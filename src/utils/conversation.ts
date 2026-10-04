/* Deterministic, human conversation starters generated from real overlap
   between the demo profile and a sample member. No random text, no API calls. */
import type { CommunityMember, MatchResult, UserProfile } from '../types'

export function conversationStarters(
  profile: UserProfile,
  member: CommunityMember,
  match?: MatchResult,
): string[] {
  const starters: string[] = []
  const first = member.name.split(' ')[0]

  for (const interest of (match?.sharedInterests ?? []).slice(0, 2)) {
    starters.push(`“I saw you’re also into ${interest.toLowerCase()} — how did you get started with it?”`)
  }
  for (const skill of (match?.theyTeachIWant ?? []).slice(0, 1)) {
    starters.push(`“I’ve been meaning to learn ${skill.toLowerCase()}. Is it something you could show me in ${member.preferredActivities[0]?.toLowerCase() ?? 'a short meet-up'}?”`)
  }
  for (const skill of (match?.iTeachTheyWant ?? []).slice(0, 1)) {
    starters.push(`“You mentioned wanting to learn ${skill.toLowerCase()} — happy to walk you through the basics over a chai.”`)
  }
  if (member.availability.length > 0) {
    starters.push(`“${member.availability[0]} works best for me too — shall we try the ${member.preferredActivities[0]?.toLowerCase() ?? 'neighbourhood park'} first?”`)
  }
  if (member.accessibility && member.accessibility !== 'None needed') {
    starters.push(`“Is there a meeting spot that’s easier for you — I’d rather pick a place that works on your side.”`)
  }
  if (starters.length < 3) {
    starters.push(`“Hi ${first} — I’m new-ish to ${profile.community.split(',')[0]} and trying to actually meet people, not just collect phone numbers.”`)
    starters.push(`“What’s one thing around here you’d show someone who moved in recently?”`)
  }
  return Array.from(new Set(starters)).slice(0, 4)
}

/** A short, printable "swap plan" summarising a complementary pairing. */
export function swapPlan(
  iTeach: string[],
  theyTeach: string[],
  minutesEach = 20,
): string {
  const mine = iTeach[0] ?? 'a skill you can share'
  const theirs = theyTeach[0] ?? 'a skill they can share'
  return `Minute 0–${minutesEach}: you teach ${mine.toLowerCase()}. Minute ${minutesEach}–${minutesEach * 2}: they teach ${theirs.toLowerCase()}. Last 10 minutes: decide whether to meet again.`
}
