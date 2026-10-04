import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Check, Info, Save, UserCircle2, X } from 'lucide-react'
import { useMilaap, useDocumentTitle } from '../hooks'
import type { ActivityCategory, UserProfile } from '../types'
import { ACTIVITY_CATEGORIES, AVAILABILITY_SLOTS } from '../types'
import {
  ACCESSIBILITY_OPTIONS,
  AGE_RANGES,
  COMMUNITIES,
  HOBBIES_OPTIONS,
  INTEREST_OPTIONS,
  LANGUAGE_OPTIONS,
} from '../data/seed'
import { Avatar, Badge, Button, Card, Notice, ProgressBar, SectionHeading } from '../components/ui/primitives'
import { ChipSelect, SelectField, TextArea, TextField } from '../components/ui/Form'
import { PageHeader } from '../components/ui/PageHeader'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { validateProfile, hasErrors } from '../utils/validation'
import { computeProfileCompletion } from '../utils/profile'
import { avatarPalette } from '../utils/helpers'
import { AVATAR_IDS } from '../data/seed'

interface FormState {
  name: string
  avatarId: string
  ageRange: string
  community: string
  bio: string
  interests: string[]
  hobbies: string[]
  languages: string[]
  teachSkills: string[]
  learnSkills: string[]
  preferredActivities: ActivityCategory[]
  availability: string[]
  accessibility: string
}

const toForm = (profile: UserProfile): FormState => ({
  name: profile.name,
  avatarId: profile.avatarId,
  ageRange: profile.ageRange ?? '',
  community: profile.community,
  bio: profile.bio,
  interests: profile.interests,
  hobbies: profile.hobbies,
  languages: profile.languages,
  teachSkills: profile.teachSkills,
  learnSkills: profile.learnSkills,
  preferredActivities: profile.preferredActivities,
  availability: profile.availability,
  accessibility: profile.accessibility ?? '',
})

export function ProfileEditPage() {
  useDocumentTitle('Edit profile')
  const navigate = useNavigate()
  const { profile, updateProfile, toast } = useMilaap()
  const [values, setValues] = useState<FormState>(() => toForm(profile))
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})
  const [submitted, setSubmitted] = useState(false)
  const [confirmDiscard, setConfirmDiscard] = useState(false)

  const dirty = useMemo(() => JSON.stringify(values) !== JSON.stringify(toForm(profile)), [values, profile])
  const completion = useMemo(
    () =>
      computeProfileCompletion({
        ...profile,
        ...values,
        ageRange: values.ageRange,
        accessibility: values.accessibility,
        preferredActivities: values.preferredActivities as ActivityCategory[],
      } as UserProfile),
    [profile, values],
  )

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setValues((prev) => {
      const next = { ...prev, [key]: value }
      if (submitted) setErrors(validateProfile(next) as Record<string, string | undefined>)
      return next
    })
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    const validation = validateProfile(values) as Record<string, string | undefined>
    setErrors(validation)
    if (hasErrors(validation)) {
      const firstKey = Object.keys(validation)[0]
      document.querySelector<HTMLInputElement>(`#profile-field-${firstKey} input`)?.focus()
      toast({ tone: 'warning', title: 'Please fix the highlighted fields' })
      return
    }
    updateProfile({
      name: values.name.trim(),
      avatarId: values.avatarId,
      ageRange: values.ageRange || undefined,
      community: values.community,
      bio: values.bio.trim(),
      interests: values.interests,
      hobbies: values.hobbies,
      languages: values.languages,
      teachSkills: values.teachSkills,
      learnSkills: values.learnSkills,
      preferredActivities: values.preferredActivities,
      availability: values.availability as UserProfile['availability'],
      accessibility: values.accessibility || undefined,
    })
    setSubmitted(false)
    navigate('/profile')
  }

  const cancel = () => {
    if (dirty) {
      setConfirmDiscard(true)
      return
    }
    navigate('/profile')
  }

  return (
    <div className="space-y-5">
      <PageHeader
        backTo="/profile"
        backLabel="Back to my profile"
        eyebrow={
          <Badge tone="sage" icon={<UserCircle2 className="h-3 w-3" />}>
            Edit profile
          </Badge>
        }
        title="Tell Milaap who you are"
        description="There is no signup and no account. Everything you type here is saved to this browser and used only to rank people, activities and skill swaps for you."
      />

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <form onSubmit={submit} className="space-y-4" noValidate>
          <Card className="p-5">
            <SectionHeading title="The basics" subtitle="Only what helps a neighbour say hello." />

            <div className="flex flex-wrap items-center gap-4">
              <Avatar name={values.name || 'You'} avatarId={values.avatarId} size="lg" />
              <div className="min-w-[12rem] flex-1">
                <p className="ml-label">Avatar colour</p>
                <div className="flex flex-wrap gap-2">
                  {AVATAR_IDS.map((id) => {
                    const palette = avatarPalette(id)
                    const active = values.avatarId === id
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => update('avatarId', id)}
                        aria-label={`Choose avatar style ${id}`}
                        aria-pressed={active}
                        className="grid h-9 w-9 place-items-center rounded-full ring-offset-2 transition"
                        style={{
                          backgroundImage: `linear-gradient(140deg, ${palette.from}, ${palette.to})`,
                          boxShadow: active ? `0 0 0 2px var(--surface), 0 0 0 4px ${palette.from}` : undefined,
                        }}
                      >
                        {active ? <Check className="h-4 w-4 text-white" aria-hidden /> : null}
                      </button>
                    )
                  })}
                </div>
                <p className="ml-hint">
                  Milaap uses initials on a soft colour instead of photo uploads, so no images are collected.
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div id="profile-field-name">
                <TextField
                  label="Your name (or a nickname)"
                  required
                  value={values.name}
                  onChange={(v) => update('name', v)}
                  placeholder="E.g. Aarav"
                  error={errors.name}
                  hint="First name or a nickname is enough."
                />
              </div>
              <SelectField
                label="Age range (optional)"
                value={values.ageRange}
                onChange={(v) => update('ageRange', v)}
                options={[{ value: '', label: 'Prefer not to say' }, ...AGE_RANGES.map((a) => ({ value: a, label: a }))]}
                hint="A range only — never a birth date."
              />
              <SelectField
                label="Community or neighbourhood"
                required
                value={values.community}
                onChange={(v) => update('community', v)}
                options={COMMUNITIES.map((c) => ({ value: c.name, label: c.name }))}
                error={errors.community}
                hint="Neighbourhood level only. Milaap never asks for a flat or street number."
              />
              <div className="sm:col-span-2">
                <TextArea
                  label="Short introduction"
                  value={values.bio}
                  onChange={(v) => update('bio', v)}
                  maxLength={400}
                  rows={3}
                  placeholder="Two sentences: what you do, and what you would like to do around here."
                  error={errors.bio}
                  hint="At least 20 characters helps people know what to say first."
                />
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <SectionHeading title="Interests & hobbies" subtitle="These weigh the most in your match score." />
            <div className="space-y-5">
              <ChipSelect
                label="Interests"
                options={INTEREST_OPTIONS}
                selected={values.interests}
                onChange={(next) => update('interests', next)}
                allowCustom
                customPlaceholder="Add your own interest"
                error={errors.interests}
              />
              <ChipSelect
                label="Hobbies"
                options={HOBBIES_OPTIONS}
                selected={values.hobbies}
                onChange={(next) => update('hobbies', next)}
                allowCustom
                customPlaceholder="Add your own hobby"
              />
              <ChipSelect
                label="Languages you speak"
                options={LANGUAGE_OPTIONS}
                selected={values.languages}
                onChange={(next) => update('languages', next)}
                allowCustom
                customPlaceholder="Add another language"
                error={errors.languages}
              />
            </div>
          </Card>

          <Card className="p-5">
            <SectionHeading
              title="Skills to share and learn"
              subtitle="This is what powers complementary skill swaps in the Skill Exchange."
            />
            <div className="space-y-5">
              <ChipSelect
                label="Skills I can share"
                options={[
                  ...values.interests,
                  'Smartphone photography', 'Basic car maintenance', 'Cooking', 'Excel basics',
                  'Spoken English', 'Digital payments', 'Gardening basics', 'Video editing on phone',
                ].filter((v, i, arr) => arr.indexOf(v) === i)}
                selected={values.teachSkills}
                onChange={(next) => update('teachSkills', next)}
                allowCustom
                customPlaceholder="Add a skill you can teach"
                error={errors.teachSkills}
                max={12}
              />
              <ChipSelect
                label="Skills I want to learn"
                options={[
                  'Basic car maintenance', 'Cooking', 'Marathi conversation', 'Excel basics', 'Smartphone photography',
                  'Playing guitar', 'Yoga', 'Public speaking', 'Gardening', 'Digital payments',
                ]}
                selected={values.learnSkills}
                onChange={(next) => update('learnSkills', next)}
                allowCustom
                customPlaceholder="Add a skill you want to learn"
                max={12}
              />
            </div>
          </Card>

          <Card className="p-5">
            <SectionHeading title="Activities & availability" subtitle="So suggested meet-ups happen at times that work." />
            <div className="space-y-5">
              <ChipSelect
                label="Preferred activities"
                options={ACTIVITY_CATEGORIES}
                selected={values.preferredActivities}
                onChange={(next) => update('preferredActivities', next as FormState['preferredActivities'])}
                error={errors.preferredActivities}
              />
              <ChipSelect
                label="Usual availability"
                options={AVAILABILITY_SLOTS}
                selected={values.availability}
                onChange={(next) => update('availability', next)}
              />
              <SelectField
                label="Accessibility preferences (optional)"
                value={values.accessibility}
                onChange={(v) => update('accessibility', v)}
                options={ACCESSIBILITY_OPTIONS.map((v) => ({ value: v, label: v }))}
                hint="Milaap uses this only to suggest venues and durations that suit you."
              />
            </div>
          </Card>

          <Notice tone="info" icon={<Info className="h-4 w-4" />} title="What Milaap will never ask for">
            Your exact address, phone number, email, ID documents, payment details or anything else sensitive. There is no
            account, so there is nothing to verify or recover.
          </Notice>

          <div className="sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-20 flex flex-col-reverse gap-2 rounded-2xl border border-line bg-surface/95 p-3 shadow-lift backdrop-blur sm:flex-row sm:justify-end lg:bottom-4">
            <Button variant="secondary" type="button" onClick={cancel} icon={<X className="h-4 w-4" />}>
              Cancel
            </Button>
            <Button type="submit" icon={<Save className="h-4 w-4" />} disabled={!dirty}>
              {dirty ? 'Save profile' : 'No changes to save'}
            </Button>
          </div>
        </form>

        <aside className="space-y-4">
          <Card className="p-5">
            <h2 className="text-[15px] font-bold text-ink">Live completion</h2>
            <p className="mt-1 text-[13px] leading-relaxed text-muted">
              Updates as you type, so you can see exactly what is still missing.
            </p>
            <ProgressBar className="mt-3" value={completion.percent} label="Profile completion" hint={`${completion.percent}%`} />
            <ul className="mt-3 space-y-1.5">
              {completion.checks.map((c) => (
                <li key={c.key} className="flex items-center gap-2 text-[12.5px]">
                  <span className={c.done ? 'text-accent' : 'text-muted/60'}>
                    {c.done ? <Check className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                  </span>
                  <span className={c.done ? 'text-muted line-through' : 'text-ink'}>{c.label}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5">
            <h2 className="text-[15px] font-bold text-ink">Matching preview</h2>
            <p className="mt-1 text-[13px] leading-relaxed text-muted">
              With these values, your profile leans on:
            </p>
            <ul className="mt-2 space-y-1.5 text-[12.5px] text-muted">
              <li>· {values.interests.length} interests · {values.hobbies.length} hobbies</li>
              <li>· {values.teachSkills.length} skills to share · {values.learnSkills.length} to learn</li>
              <li>· {values.preferredActivities.length} preferred activity types</li>
              <li>· {values.languages.length} languages · {values.availability.length} availability slots</li>
            </ul>
            <p className="mt-2 text-[11.5px] leading-relaxed text-muted">
              Save the profile and Discover People re-ranks instantly using these values.
            </p>
          </Card>

          <Card className="p-5">
            <h2 className="text-[15px] font-bold text-ink">Removing something?</h2>
            <p className="mt-1 text-[13px] leading-relaxed text-muted">
              Tap a selected chip to unselect it. To start from the demonstration profile again, use “Restore sample profile”
              on the profile page.
            </p>
            <Button className="mt-3" size="sm" variant="secondary" onClick={() => navigate('/profile')}>
              Back to my profile
            </Button>
          </Card>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmDiscard}
        destructive
        title="Discard your changes?"
        message="You have unsaved edits. Leaving now will keep the previously saved profile."
        confirmLabel="Discard changes"
        cancelLabel="Keep editing"
        onCancel={() => setConfirmDiscard(false)}
        onConfirm={() => {
          setConfirmDiscard(false)
          navigate('/profile')
        }}
      />
    </div>
  )
}
