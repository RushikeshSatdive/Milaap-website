/* Shared form validation — one source of truth for every Milaap form. */
import type { Invitation, UserProfile } from '../types'
import { invitationTimestamp, startOfDay, toISODate } from './date'

export type Errors<T> = Partial<Record<keyof T, string>>

export const LIMITS = {
  name: { min: 2, max: 40 },
  bio: { min: 20, max: 400 },
  note: { min: 0, max: 240 },
  place: { min: 3, max: 80 },
  title: { min: 4, max: 70 },
  description: { min: 20, max: 400 },
  goal: { min: 10, max: 160 },
  skill: { min: 3, max: 60 },
  skillDescription: { min: 15, max: 260 },
}

export function validateProfile(values: {
  name: string
  bio: string
  community: string
  interests: string[]
  languages: string[]
  teachSkills: string[]
  learnSkills: string[]
  preferredActivities: string[]
  accessibility?: string
}): Errors<typeof values> {
  const errors: Errors<typeof values> = {}
  const name = values.name.trim()
  if (!name) errors.name = 'Please enter your name.'
  else if (name.length < LIMITS.name.min) errors.name = `Name must be at least ${LIMITS.name.min} characters.`
  else if (name.length > LIMITS.name.max) errors.name = `Name must be under ${LIMITS.name.max} characters.`

  const bio = values.bio.trim()
  if (bio.length > 0 && bio.length < LIMITS.bio.min) {
    errors.bio = `Add a little more — at least ${LIMITS.bio.min} characters so neighbours know what to say first.`
  } else if (bio.length > LIMITS.bio.max) {
    errors.bio = `Keep the introduction under ${LIMITS.bio.max} characters.`
  }

  if (!values.community) errors.community = 'Choose your community or neighbourhood.'
  if (values.interests.length === 0) errors.interests = 'Pick at least one interest.'
  if (values.languages.length === 0) errors.languages = 'Add at least one language you speak.'
  if (values.teachSkills.length === 0 && values.learnSkills.length === 0) {
    errors.teachSkills = 'Add at least one skill you can share or want to learn.'
  }
  if (values.preferredActivities.length === 0) {
    errors.preferredActivities = 'Select at least one preferred activity.'
  }
  return errors
}

export type ProfileFieldValues = Pick<
  UserProfile,
  'name' | 'bio' | 'community' | 'interests' | 'languages' | 'teachSkills' | 'learnSkills' | 'preferredActivities' | 'accessibility'
>

export interface InvitationFormValues {
  memberId: string
  activityType: string
  title: string
  date: string
  time: string
  durationMins: number
  place: string
  note: string
}

export function validateInvitation(values: InvitationFormValues): Errors<InvitationFormValues> {
  const errors: Errors<InvitationFormValues> = {}
  if (!values.memberId) errors.memberId = 'Choose who this demo invitation is for.'
  if (!values.activityType) errors.activityType = 'Choose an activity type.'
  if (!values.title.trim()) errors.title = 'Give the invitation a short title.'
  else if (values.title.trim().length < 3) errors.title = 'Title is a little short.'

  if (!values.date) errors.date = 'Pick a date.'
  else {
    const parsed = /^\d{4}-\d{2}-\d{2}$/.test(values.date)
    if (!parsed) errors.date = 'Use the date picker to choose a valid date.'
    else if (toISODate(startOfDay(new Date(values.date))) < toISODate(startOfDay())) {
      const ts = invitationTimestamp(values.date, values.time || '00:00')
      if (ts < Date.now() - 60_000) errors.date = 'That date is in the past — choose today or later.'
    }
  }

  if (!values.time) errors.time = 'Pick a start time.'
  else if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(values.time)) errors.time = 'Enter a valid time.'

  if (!Number.isFinite(values.durationMins) || values.durationMins < 15) {
    errors.durationMins = 'Durations start at 15 minutes.'
  } else if (values.durationMins > 480) {
    errors.durationMins = 'Keep it under 8 hours — short meet-ups work best.'
  }

  if (!values.place.trim()) errors.place = 'Suggest a public meeting place.'
  else if (values.place.trim().length < LIMITS.place.min) errors.place = 'Add a little more detail about the place.'
  else if (values.place.trim().length > LIMITS.place.max) errors.place = 'Place name is too long.'

  if (values.note.length > LIMITS.note.max) errors.note = `Notes must be under ${LIMITS.note.max} characters.`

  return errors
}

export function validateActivity(values: {
  title: string
  description: string
  durationMins: number
  groupSize: number
  place: string
  scheduledAt: string | null
  category: string
}): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!values.title.trim()) errors.title = 'Give your activity a title.'
  else if (values.title.trim().length < LIMITS.title.min) errors.title = `At least ${LIMITS.title.min} characters, please.`
  else if (values.title.trim().length > LIMITS.title.max) errors.title = 'Titles should stay under 70 characters.'

  if (!values.category) errors.category = 'Choose a category.'

  if (!values.description.trim()) errors.description = 'Describe what will actually happen.'
  else if (values.description.trim().length < LIMITS.description.min) {
    errors.description = `Add a little more detail (at least ${LIMITS.description.min} characters).`
  } else if (values.description.trim().length > LIMITS.description.max) {
    errors.description = 'Keep the description under 400 characters.'
  }

  if (!Number.isFinite(values.durationMins) || values.durationMins < 15) errors.durationMins = 'Minimum 15 minutes.'
  else if (values.durationMins > 480) errors.durationMins = 'Maximum 8 hours.'

  if (!Number.isFinite(values.groupSize) || values.groupSize < 2) errors.groupSize = 'A group needs at least 2 people.'
  else if (values.groupSize > 60) errors.groupSize = 'Keep groups under 60 people.'

  if (!values.place.trim()) errors.place = 'Where will people meet?'

  if (values.scheduledAt) {
    const ts = new Date(values.scheduledAt).getTime()
    if (Number.isNaN(ts)) errors.scheduledAt = 'Enter a valid date and time.'
    else if (ts < Date.now() - 60_000) errors.scheduledAt = 'Scheduled time must be in the future.'
  }
  return errors
}

export function validateChallenge(values: {
  title: string
  goal: string
  description: string
  tasks: string[]
}): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!values.title.trim()) errors.title = 'Give the challenge a title.'
  else if (values.title.trim().length < LIMITS.title.min) errors.title = 'A slightly longer title helps people recognise it.'
  if (!values.goal.trim()) errors.goal = 'What is the one measurable goal?'
  else if (values.goal.trim().length < LIMITS.goal.min) errors.goal = 'Be a little more specific about the goal.'
  if (!values.description.trim()) errors.description = 'Explain how it will work.'
  else if (values.description.trim().length < 20) errors.description = 'Add a bit more detail.'
  const cleaned = values.tasks.map((t) => t.trim()).filter(Boolean)
  if (cleaned.length < 2) errors.tasks = 'Add at least two tasks so progress can be tracked.'
  return errors
}

export function validateSkillListing(values: {
  skill: string
  description: string
  category: string
  availability: string[]
}): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!values.skill.trim()) errors.skill = 'What is the skill?'
  else if (values.skill.trim().length < LIMITS.skill.min) errors.skill = 'Name the skill a little more fully.'
  else if (values.skill.trim().length > LIMITS.skill.max) errors.skill = 'Keep skill names under 60 characters.'
  if (!values.category) errors.category = 'Pick a skill category.'
  if (!values.description.trim()) errors.description = 'Say what someone will actually learn or teach.'
  else if (values.description.trim().length < LIMITS.skillDescription.min) {
    errors.description = `A little more detail please (at least ${LIMITS.skillDescription.min} characters).`
  } else if (values.description.trim().length > LIMITS.skillDescription.max) {
    errors.description = 'Keep it under 260 characters.'
  }
  if (values.availability.length === 0) errors.availability = 'Choose at least one time you are usually free.'
  return errors
}

export function hasErrors(errors: Record<string, string | undefined>): boolean {
  return Object.values(errors).some(Boolean)
}

export function isValidInvitationShape(value: unknown): value is Invitation {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return typeof v.id === 'string' && typeof v.memberId === 'string' && typeof v.date === 'string' && typeof v.time === 'string'
}
