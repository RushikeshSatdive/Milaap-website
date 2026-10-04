import type { UserProfile } from '../types'

export interface ProfileCompletion {
  percent: number
  missing: string[]
  complete: boolean
  checks: Array<{ key: string; label: string; done: boolean; weight: number }>
}

/**
 * Weighted completion indicator for the demo profile.
 * Anything missing is surfaced by name so the UI can show a real to-do list.
 */
export function computeProfileCompletion(profile: UserProfile): ProfileCompletion {
  const checks = [
    { key: 'name', label: 'your name', done: profile.name.trim().length >= 2, weight: 10 },
    { key: 'avatar', label: 'an avatar colour', done: Boolean(profile.avatarId), weight: 5 },
    { key: 'community', label: 'your community', done: Boolean(profile.community), weight: 10 },
    { key: 'bio', label: 'a short introduction', done: profile.bio.trim().length >= 20, weight: 10 },
    { key: 'interests', label: 'at least one interest', done: profile.interests.length > 0, weight: 12 },
    { key: 'hobbies', label: 'a hobby or two', done: profile.hobbies.length > 0, weight: 6 },
    { key: 'languages', label: 'the languages you speak', done: profile.languages.length > 0, weight: 10 },
    { key: 'teachSkills', label: 'a skill you can share', done: profile.teachSkills.length > 0, weight: 13 },
    { key: 'learnSkills', label: 'a skill you want to learn', done: profile.learnSkills.length > 0, weight: 13 },
    { key: 'activities', label: 'preferred activity types', done: profile.preferredActivities.length > 0, weight: 6 },
    { key: 'availability', label: 'your usual availability', done: profile.availability.length > 0, weight: 5 },
  ]

  const total = checks.reduce((sum, c) => sum + c.weight, 0)
  const earned = checks.reduce((sum, c) => (c.done ? sum + c.weight : sum), 0)
  const percent = Math.round((earned / total) * 100)
  const missing = checks.filter((c) => !c.done).map((c) => c.label)

  return { percent, missing, complete: percent === 100, checks }
}
