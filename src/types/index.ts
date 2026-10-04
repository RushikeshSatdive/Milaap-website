/* ------------------------------------------------------------------
   Milaap — shared TypeScript domain types
   Every entity below is demonstration data held in localStorage.
   ------------------------------------------------------------------ */

export type ThemeMode = 'light' | 'dark'

export type ActivityCategory =
  | 'Chai & Chat'
  | 'Skill Swap'
  | 'Recipe Exchange'
  | 'Community Walk'
  | 'Board Games'
  | 'Digital Help Hour'
  | 'Language Exchange'
  | 'Study Together'
  | 'Sports & Fitness'
  | 'Cultural Storytelling'
  | 'Neighbourhood Volunteering'
  | 'Fix One Local Problem'

export const ACTIVITY_CATEGORIES: ActivityCategory[] = [
  'Chai & Chat',
  'Skill Swap',
  'Recipe Exchange',
  'Community Walk',
  'Board Games',
  'Digital Help Hour',
  'Language Exchange',
  'Study Together',
  'Sports & Fitness',
  'Cultural Storytelling',
  'Neighbourhood Volunteering',
  'Fix One Local Problem',
]

export type AvailabilitySlot =
  | 'Weekday mornings'
  | 'Weekday afternoons'
  | 'Weekday evenings'
  | 'Weekend mornings'
  | 'Weekend afternoons'
  | 'Weekend evenings'

export const AVAILABILITY_SLOTS: AvailabilitySlot[] = [
  'Weekday mornings',
  'Weekday afternoons',
  'Weekday evenings',
  'Weekend mornings',
  'Weekend afternoons',
  'Weekend evenings',
]

export type SkillCategory =
  | 'Food & Cooking'
  | 'Tech & Digital'
  | 'Home & Repair'
  | 'Wellness & Fitness'
  | 'Arts & Crafts'
  | 'Music & Performance'
  | 'Language & Literacy'
  | 'Study & Career'
  | 'Gardening & Nature'
  | 'Life & Everyday'

export const SKILL_CATEGORIES: SkillCategory[] = [
  'Food & Cooking',
  'Tech & Digital',
  'Home & Repair',
  'Wellness & Fitness',
  'Arts & Crafts',
  'Music & Performance',
  'Language & Literacy',
  'Study & Career',
  'Gardening & Nature',
  'Life & Everyday',
]

/** Human-facing profile of the demo user ("you"). No account, no auth. */
export interface UserProfile {
  id: string
  name: string
  avatarId: string
  ageRange?: string
  community: string
  bio: string
  interests: string[]
  hobbies: string[]
  languages: string[]
  teachSkills: string[]
  learnSkills: string[]
  preferredActivities: ActivityCategory[]
  availability: AvailabilitySlot[]
  accessibility?: string
  createdAt: string
  updatedAt: string
}

/** Seeded demonstration community members. Not real people. */
export interface CommunityMember {
  id: string
  name: string
  avatarId: string
  ageRange?: string
  community: string
  bio: string
  interests: string[]
  hobbies: string[]
  languages: string[]
  teachSkills: string[]
  learnSkills: string[]
  preferredActivities: ActivityCategory[]
  availability: AvailabilitySlot[]
  accessibility?: string
  /** Always true — every profile shipped with Milaap is demonstration data. */
  isSample?: boolean
}

export interface Connection {
  memberId: string
  addedAt: string
  /** Which surface produced the connection, for the activity timeline. */
  source: 'discover' | 'skill-exchange' | 'community' | 'home'
}

export type InvitationStatus = 'planned' | 'completed' | 'cancelled'

export interface Invitation {
  id: string
  memberId: string
  activityType: ActivityCategory
  title: string
  /** yyyy-mm-dd */
  date: string
  /** HH:mm 24h */
  time: string
  durationMins: number
  place: string
  note?: string
  status: InvitationStatus
  createdAt: string
  isSample?: boolean
}

export interface Activity {
  id: string
  title: string
  category: ActivityCategory
  description: string
  durationMins: number
  groupSize: number
  community: string
  /** ISO date-time, or null for an unscheduled idea */
  scheduledAt: string | null
  interestTags: string[]
  skillTags: string[]
  /** Sample participants seeded with the demo data */
  sampleParticipants: number
  /** 0 means "no popularity signal" */
  popularity: number
  place: string
  hostName: string
  /** 'community' = seeded demo content, 'you' = created by the demo user */
  createdBy: 'community' | 'you'
  isSample: boolean
  createdAt: string
}

export type SkillListingType = 'offer' | 'request'

export interface SkillListing {
  id: string
  type: SkillListingType
  skill: string
  category: SkillCategory
  description: string
  /** member id, or 'me' for the demo user */
  memberId: string
  availability: AvailabilitySlot[]
  format: 'In person' | 'Online' | 'Either'
  note?: string
  createdBy: 'community' | 'you'
  isSample: boolean
  createdAt: string
}

export interface ChallengeTask {
  id: string
  label: string
  done: boolean
}

export interface CommunityChallenge {
  id: string
  title: string
  goal: string
  description: string
  community: string
  category: 'Environment' | 'Digital Inclusion' | 'Learning' | 'Culture' | 'Wellbeing' | 'Local Fix'
  /** Sample participants seeded with demo data */
  sampleParticipants: number
  tasks: ChallengeTask[]
  joined: boolean
  /** true when the demo user created this locally */
  createdBy: 'community' | 'you'
  isSample: boolean
  createdAt: string
}

export type NotificationKind =
  | 'match'
  | 'activity'
  | 'invitation'
  | 'reminder'
  | 'profile'
  | 'skill'
  | 'community'

export interface AppNotification {
  id: string
  kind: NotificationKind
  title: string
  message: string
  createdAt: string
  read: boolean
  /** In-app route this notification links to */
  href: string
  /** true = seeded demo notification, false = generated by a real local action */
  seeded: boolean
}

export interface NotificationPreferences {
  matches: boolean
  activities: boolean
  invitations: boolean
  skills: boolean
  community: boolean
  profile: boolean
}

export interface AppSettings {
  theme: ThemeMode
  reducedMotion: boolean
  notify: NotificationPreferences
  activeCommunity: string
}

export interface AppData {
  version: number
  profile: UserProfile
  connections: Connection[]
  invitations: Invitation[]
  activities: Activity[]
  joinedActivityIds: string[]
  savedActivityIds: string[]
  /** Activities the demo user marked as done (their own bookkeeping only). */
  completedActivityIds: string[]
  skillListings: SkillListing[]
  savedSkillIds: string[]
  challenges: CommunityChallenge[]
  completedTaskIds: string[]
  savedChallengeIds: string[]
  members: CommunityMember[]
  notifications: AppNotification[]
  savedMemberIds: string[]
  dismissedMemberIds: string[]
  settings: AppSettings
  /** ISO timestamp of last local change — shown in Settings */
  lastUpdated: string
  /** one-time flags, e.g. profile-nudge notification already sent */
  flags: Record<string, boolean>
}

export interface MatchResult {
  memberId: string
  score: number
  sharedInterests: string[]
  theyTeachIWant: string[]
  iTeachTheyWant: string[]
  sharedActivities: ActivityCategory[]
  sharedLanguages: string[]
  reasons: string[]
}

export interface SkillMatch {
  memberId: string
  score: number
  iTeachThem: string[]
  theyTeachMe: string[]
}
