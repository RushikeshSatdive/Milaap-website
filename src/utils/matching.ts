/* ------------------------------------------------------------------
   Milaap matching engine — deterministic, explainable, local.
   Nothing here talks to a server: scores are computed from the
   demonstration profile in localStorage plus the seeded sample members.
   ------------------------------------------------------------------ */
import type {
  Activity,
  ActivityCategory,
  CommunityMember,
  MatchResult,
  SkillListing,
  SkillMatch,
  UserProfile,
} from '../types'

const norm = (s: string) => s.trim().toLowerCase()

function overlap(a: string[], b: string[]): string[] {
  const setB = new Set(b.map(norm))
  return a.filter((item) => setB.has(norm(item)))
}

export interface MatchOptions {
  /** Boost people from the community currently selected in the app. */
  preferCommunity?: string
  /** Bump score for members who are available at the same times as you. */
  considerAvailability?: boolean
}

/**
 * Weighted, fully explainable match score.
 *  - shared interests        → up to 45
 *  - complementary skills    → up to 35  (they teach what I want / I teach what they want)
 *  - shared activity types   → up to 15
 *  - shared languages        → up to 5
 *  - same community          → up to 6 (context boost, capped at 100 total)
 */
export function scoreMember(
  profile: UserProfile,
  member: CommunityMember,
  options: MatchOptions = {},
): MatchResult {
  const sharedInterests = overlap(profile.interests, member.interests)
  const theyTeachIWant = overlap(member.teachSkills, profile.learnSkills)
  const iTeachTheyWant = overlap(profile.teachSkills, member.learnSkills)
  const sharedActivities = overlap(
    profile.preferredActivities as string[],
    member.preferredActivities as string[],
  ) as ActivityCategory[]
  const sharedLanguages = overlap(profile.languages, member.languages)
  const sameCommunity = options.preferCommunity
    ? norm(member.community) === norm(options.preferCommunity)
    : false

  const interestDenom = Math.max(3, Math.min(profile.interests.length, member.interests.length))
  const interestScore = (sharedInterests.length / interestDenom) * 45

  const skillPairs = theyTeachIWant.length + iTeachTheyWant.length
  const skillScore = Math.min(35, skillPairs * 14)

  const activityScore = Math.min(
    15,
    (sharedActivities.length / Math.max(1, profile.preferredActivities.length)) * 30,
  )
  const languageScore = Math.min(5, sharedLanguages.length * 2)
  const communityScore = sameCommunity ? 6 : 0

  const raw = interestScore + skillScore + activityScore + languageScore + communityScore
  const score = Math.max(18, Math.min(99, Math.round(raw)))

  const reasons: string[] = []
  if (sharedInterests.length > 0) {
    reasons.push(`You both listed ${sharedInterests.slice(0, 3).join(', ')} as interests.`)
  }
  if (theyTeachIWant.length > 0) {
    reasons.push(
      `${member.name.split(' ')[0]} can teach ${theyTeachIWant.slice(0, 2).join(' and ')} — that is on your “want to learn” list.`,
    )
  }
  if (iTeachTheyWant.length > 0) {
    reasons.push(
      `You can teach ${iTeachTheyWant.slice(0, 2).join(' and ')}, which ${member.name.split(' ')[0]} wants to learn.`,
    )
  }
  if (sharedActivities.length > 0) {
    reasons.push(`You both prefer ${sharedActivities.slice(0, 2).join(' and ')} activities.`)
  }
  if (sameCommunity) {
    reasons.push(`Both of you are in ${member.community}.`)
  }
  if (sharedLanguages.length > 0) {
    reasons.push(`You share ${sharedLanguages.slice(0, 2).join(' and ')}.`)
  }
  if (options.considerAvailability) {
    const sharedSlots = overlap(profile.availability, member.availability)
    if (sharedSlots.length > 0) {
      reasons.push(`Free at the same time: ${sharedSlots.slice(0, 2).join(', ')}.`)
    }
  }
  if (reasons.length === 0) {
    reasons.push('New to your area, so Milaap suggests a low-commitment first meet-up.')
  }

  return {
    memberId: member.id,
    score,
    sharedInterests,
    theyTeachIWant,
    iTeachTheyWant,
    sharedActivities,
    sharedLanguages,
    reasons,
  }
}

/** Rank every non-dismissed member. Same inputs always produce the same order. */
export function rankMembers(
  profile: UserProfile,
  members: CommunityMember[],
  opts: {
    dismissed?: string[]
    excludeConnections?: string[]
    connectionIds?: string[]
    preferCommunity?: string
    considerAvailability?: boolean
  } = {},
): MatchResult[] {
  const dismissed = new Set(opts.dismissed ?? [])
  const excluded = new Set(opts.excludeConnections ?? [])
  return members
    .filter((m) => !dismissed.has(m.id) && !excluded.has(m.id))
    .map((m) =>
      scoreMember(profile, m, {
        preferCommunity: opts.preferCommunity,
        considerAvailability: opts.considerAvailability,
      }),
    )
    .sort((a, b) => b.score - a.score || a.memberId.localeCompare(b.memberId))
}

export function matchMap(results: MatchResult[]): Record<string, MatchResult> {
  return Object.fromEntries(results.map((r) => [r.memberId, r]))
}

/**
 * Skill-swap pairing: a member is complementary when they teach something the
 * demo user wants to learn AND want to learn something the demo user teaches.
 */
export function findSkillMatches(profile: UserProfile, members: CommunityMember[]): SkillMatch[] {
  return members
    .map((member) => {
      const theyTeachMe = overlap(member.teachSkills, profile.learnSkills)
      const iTeachThem = overlap(profile.teachSkills, member.learnSkills)
      const score = Math.min(100, theyTeachMe.length * 30 + iTeachThem.length * 30 + (theyTeachMe.length && iTeachThem.length ? 10 : 0))
      return { memberId: member.id, score, iTeachThem, theyTeachMe }
    })
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score || a.memberId.localeCompare(b.memberId))
}

/** Complementary listing pairs (offer ↔ request) around the demo user's skills. */
export interface ListingPair {
  offer: SkillListing
  request: SkillListing
  kind: 'you-teach' | 'you-learn'
  memberId: string
}

export function findListingPairs(profile: UserProfile, listings: SkillListing[]): ListingPair[] {
  const pairs: ListingPair[] = []
  const offers = listings.filter((l) => l.type === 'offer')
  const requests = listings.filter((l) => l.type === 'request')
  const sameSkill = (a: string, b: string) => norm(a).includes(norm(b)) || norm(b).includes(norm(a))

  for (const offer of offers) {
    for (const request of requests) {
      if (offer.memberId === request.memberId) continue
      if (!sameSkill(offer.skill, request.skill)) continue
      if (offer.memberId === 'me' || request.memberId === 'me') {
        const otherId = offer.memberId === 'me' ? request.memberId : offer.memberId
        pairs.push({
          offer,
          request,
          kind: offer.memberId === 'me' ? 'you-teach' : 'you-learn',
          memberId: otherId,
        })
        continue
      }
      // Seeded member ↔ member pairing that involves one of your skills is still useful context.
      const touchesMySkills =
        profile.teachSkills.some((s) => sameSkill(s, offer.skill)) ||
        profile.learnSkills.some((s) => sameSkill(s, offer.skill))
      if (touchesMySkills) {
        pairs.push({ offer, request, kind: 'you-learn', memberId: offer.memberId })
      }
    }
  }
  return pairs.slice(0, 12)
}

/** Activities that score well for a member: overlapping tags, category and community. */
export function recommendActivities(
  profile: UserProfile,
  activities: Activity[],
  member: CommunityMember | null,
  limit = 3,
): Activity[] {
  const interests = new Set([...profile.interests, ...profile.hobbies].map(norm))
  const skills = new Set([...profile.teachSkills, ...profile.learnSkills].map(norm))
  const memberInterests = new Set([
    ...(member?.interests ?? []),
    ...(member?.preferredActivities ?? []),
  ].map(norm))

  return activities
    .map((activity) => {
      let score = 0
      if (profile.preferredActivities.includes(activity.category)) score += 10
      if (member?.preferredActivities.includes(activity.category)) score += 6
      score += activity.interestTags.filter((t) => interests.has(norm(t))).length * 5
      score += activity.skillTags.filter((t) => skills.has(norm(t))).length * 6
      score += activity.interestTags.filter((t) => memberInterests.has(norm(t))).length * 3
      if (activity.community === profile.community) score += 4
      if (activity.community === member?.community) score += 3
      if (activity.createdBy === 'you') score += 2
      return { activity, score }
    })
    .sort((a, b) => b.score - a.score || a.activity.id.localeCompare(b.activity.id))
    .slice(0, limit)
    .map((x) => x.activity)
}

/** Deterministic "popularity" used when sorting activities. */
export function activityPopularity(activity: Activity, joinedIds: string[]): number {
  return activity.popularity + (joinedIds.includes(activity.id) ? 12 : 0)
}

export function skillCategoryOf(listings: SkillListing[], skill: string): string {
  const found = listings.find((l) => l.skill === skill)
  return found?.category ?? 'Life & Everyday'
}
