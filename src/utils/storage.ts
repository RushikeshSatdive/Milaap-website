/* ------------------------------------------------------------------
   Reusable localStorage persistence layer.
   - Safe against unavailable storage (private mode, blocked cookies)
   - Repairs malformed data field by field instead of throwing
   - Never claims to be encrypted or suitable for sensitive data
   ------------------------------------------------------------------ */
import type { AppData, AppSettings, UserProfile } from '../types'
import { CURRENT_DATA_VERSION, buildSeedState } from '../data/seed'

export const STORAGE_KEY = 'milaap:data:v1'
export const THEME_KEY = 'milaap:theme'

function safeParse(raw: string | null): unknown {
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value)
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : []
}

function mergeSettings(value: unknown): AppSettings {
  const seed = buildSeedState().settings
  if (!value || typeof value !== 'object') return seed
  const raw = value as Record<string, unknown>
  const notifyRaw = (raw.notify ?? {}) as Record<string, unknown>
  return {
    theme: raw.theme === 'dark' || raw.theme === 'light' ? raw.theme : seed.theme,
    reducedMotion: typeof raw.reducedMotion === 'boolean' ? raw.reducedMotion : seed.reducedMotion,
    activeCommunity: typeof raw.activeCommunity === 'string' && raw.activeCommunity ? raw.activeCommunity : seed.activeCommunity,
    notify: {
      matches: typeof notifyRaw.matches === 'boolean' ? notifyRaw.matches : seed.notify.matches,
      activities: typeof notifyRaw.activities === 'boolean' ? notifyRaw.activities : seed.notify.activities,
      invitations: typeof notifyRaw.invitations === 'boolean' ? notifyRaw.invitations : seed.notify.invitations,
      skills: typeof notifyRaw.skills === 'boolean' ? notifyRaw.skills : seed.notify.skills,
      community: typeof notifyRaw.community === 'boolean' ? notifyRaw.community : seed.notify.community,
      profile: typeof notifyRaw.profile === 'boolean' ? notifyRaw.profile : seed.notify.profile,
    },
  }
}

function mergeProfile(value: unknown): UserProfile {
  const seed = buildSeedState().profile
  if (!value || typeof value !== 'object') return seed
  const raw = value as Record<string, unknown>
  return {
    id: 'me',
    name: typeof raw.name === 'string' && raw.name.trim() ? raw.name : seed.name,
    avatarId: typeof raw.avatarId === 'string' && raw.avatarId ? raw.avatarId : seed.avatarId,
    ageRange: typeof raw.ageRange === 'string' ? raw.ageRange : seed.ageRange,
    community: typeof raw.community === 'string' && raw.community ? raw.community : seed.community,
    bio: typeof raw.bio === 'string' ? raw.bio : seed.bio,
    interests: asStringArray(raw.interests),
    hobbies: asStringArray(raw.hobbies),
    languages: asStringArray(raw.languages),
    teachSkills: asStringArray(raw.teachSkills),
    learnSkills: asStringArray(raw.learnSkills),
    preferredActivities: (asStringArray(raw.preferredActivities) as UserProfile['preferredActivities']),
    availability: (asStringArray(raw.availability) as UserProfile['availability']),
    accessibility: typeof raw.accessibility === 'string' ? raw.accessibility : undefined,
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : seed.createdAt,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : seed.updatedAt,
  }
}

/**
 * Repairs any stored payload into a valid AppData object.
 * Missing / malformed sections fall back to the seeded sample data.
 */
export function normalizeData(value: unknown): AppData {
  const seed = buildSeedState()
  if (!value || typeof value !== 'object') return seed as AppData
  const raw = value as Record<string, unknown>

  const members = asArray<AppData['members'][number]>(raw.members).filter(
    (m) => m && typeof m.id === 'string' && typeof m.name === 'string',
  )

  const activities = asArray<AppData['activities'][number]>(raw.activities).filter(
    (a) => a && typeof a.id === 'string' && typeof a.title === 'string',
  )

  const challenges = asArray<AppData['challenges'][number]>(raw.challenges).filter(
    (c) => c && typeof c.id === 'string' && typeof c.title === 'string',
  )

  const notifications = asArray<AppData['notifications'][number]>(raw.notifications).filter(
    (n) => n && typeof n.id === 'string' && typeof n.title === 'string',
  )

  const connections = asArray<AppData['connections'][number]>(raw.connections).filter(
    (c) => c && typeof c.memberId === 'string',
  )

  const invitations = asArray<AppData['invitations'][number]>(raw.invitations).filter(
    (i) => i && typeof i.id === 'string' && typeof i.date === 'string' && typeof i.memberId === 'string',
  )

  const skillListings = asArray<AppData['skillListings'][number]>(raw.skillListings).filter(
    (s) => s && typeof s.id === 'string' && typeof s.skill === 'string',
  )

  const completedTaskIds = asStringArray(raw.completedTaskIds)

  // Apply locally completed tasks onto the challenge task list so progress survives reloads.
  const withProgress = challenges.map((c) => ({
    ...c,
    tasks: Array.isArray(c.tasks)
      ? c.tasks.map((t) => ({ ...t, done: t.done || completedTaskIds.includes(t.id) }))
      : [],
  }))

  return {
    version: CURRENT_DATA_VERSION,
    profile: mergeProfile(raw.profile),
    connections,
    invitations,
    activities,
    joinedActivityIds: asStringArray(raw.joinedActivityIds),
    savedActivityIds: asStringArray(raw.savedActivityIds),
    completedActivityIds: asStringArray(raw.completedActivityIds),
    skillListings,
    savedSkillIds: asStringArray(raw.savedSkillIds),
    challenges: withProgress.length > 0 ? withProgress : seed.challenges,
    completedTaskIds,
    savedChallengeIds: asStringArray(raw.savedChallengeIds),
    members: members.length > 0 ? members : seed.members,
    notifications: Array.isArray(raw.notifications) ? notifications : seed.notifications,
    savedMemberIds: asStringArray(raw.savedMemberIds),
    dismissedMemberIds: asStringArray(raw.dismissedMemberIds),
    settings: mergeSettings(raw.settings),
    lastUpdated: typeof raw.lastUpdated === 'string' ? raw.lastUpdated : seed.lastUpdated,
    flags: raw.flags && typeof raw.flags === 'object' ? (raw.flags as Record<string, boolean>) : {},
  }
}

export function loadData(): AppData {
  if (typeof window === 'undefined') return buildSeedState() as AppData
  const raw = safeParse(window.localStorage.getItem(STORAGE_KEY))
  if (!raw) return buildSeedState() as AppData
  try {
    const normalized = normalizeData(raw)
    // If the stored payload was structurally broken, write the repaired copy back.
    if (JSON.stringify(normalized) !== JSON.stringify(raw)) saveData(normalized)
    return normalized
  } catch {
    return buildSeedState() as AppData
  }
}

export function saveData(data: AppData): boolean {
  if (typeof window === 'undefined') return false
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    return true
  } catch {
    // Storage may be full or blocked. The app keeps working in memory.
    return false
  }
}

export function clearData(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

export function hasStoredData(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== null
  } catch {
    return false
  }
}

export function storageIsAvailable(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const probe = '__milaap_probe__'
    window.localStorage.setItem(probe, '1')
    window.localStorage.removeItem(probe)
    return true
  } catch {
    return false
  }
}
