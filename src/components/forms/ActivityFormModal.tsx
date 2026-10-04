import { useEffect, useState } from 'react'
import { CalendarPlus, Save } from 'lucide-react'
import type { Activity, ActivityCategory } from '../../types'
import { ACTIVITY_CATEGORIES } from '../../types'
import { useMilaap } from '../../hooks'
import { COMMUNITIES } from '../../data/seed'
import { Modal } from '../ui/Modal'
import { Button, Notice } from '../ui/primitives'
import { ChipSelect, SelectField, TextArea, TextField } from '../ui/Form'
import { validateActivity } from '../../utils/validation'
import { toISODate, todayISO } from '../../utils/date'

interface FormValues {
  title: string
  category: ActivityCategory
  description: string
  durationMins: number
  groupSize: number
  community: string
  place: string
  scheduleEnabled: boolean
  date: string
  time: string
  interestTags: string[]
  skillTags: string[]
}

const emptyValues = (community: string): FormValues => ({
  title: '',
  category: 'Chai & Chat',
  description: '',
  durationMins: 20,
  groupSize: 6,
  community,
  place: '',
  scheduleEnabled: true,
  date: todayISO(),
  time: '18:00',
  interestTags: [],
  skillTags: [],
})

export function ActivityFormModal({
  open,
  onClose,
  editing,
}: {
  open: boolean
  onClose: () => void
  editing?: Activity | null
}) {
  const { createActivity, updateActivity, profile, activeCommunity } = useMilaap()
  const [values, setValues] = useState<FormValues>(emptyValues(activeCommunity))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!open) return
    if (editing) {
      const d = editing.scheduledAt ? new Date(editing.scheduledAt) : null
      setValues({
        title: editing.title,
        category: editing.category,
        description: editing.description,
        durationMins: editing.durationMins,
        groupSize: editing.groupSize,
        community: editing.community,
        place: editing.place,
        scheduleEnabled: Boolean(editing.scheduledAt),
        date: d ? toISODate(d) : todayISO(),
        time: d ? `${`${d.getHours()}`.padStart(2, '0')}:${`${d.getMinutes()}`.padStart(2, '0')}` : '18:00',
        interestTags: editing.interestTags,
        skillTags: editing.skillTags,
      })
    } else {
      setValues({ ...emptyValues(activeCommunity), interestTags: profile.interests.slice(0, 2) })
    }
    setErrors({})
    setSubmitted(false)
  }, [open, editing, activeCommunity, profile.interests])

  const update = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((prev) => {
      const next = { ...prev, [key]: value }
      if (submitted) setErrors(buildErrors(next))
      return next
    })
  }

  const buildErrors = (v: FormValues) =>
    validateActivity({
      title: v.title,
      description: v.description,
      durationMins: v.durationMins,
      groupSize: v.groupSize,
      place: v.place,
      category: v.category,
      scheduledAt: v.scheduleEnabled ? `${v.date}T${v.time}` : null,
    })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    const validation = buildErrors(values)
    setErrors(validation)
    if (Object.keys(validation).length > 0) return

    const scheduledAt = values.scheduleEnabled
      ? new Date(`${values.date}T${values.time}:00`).toISOString()
      : null

    if (editing) {
      updateActivity(editing.id, {
        title: values.title.trim(),
        category: values.category,
        description: values.description.trim(),
        durationMins: Number(values.durationMins),
        groupSize: Number(values.groupSize),
        community: values.community,
        place: values.place.trim(),
        scheduledAt,
        interestTags: values.interestTags,
        skillTags: values.skillTags,
      })
    } else {
      createActivity({
        title: values.title.trim(),
        category: values.category,
        description: values.description.trim(),
        durationMins: Number(values.durationMins),
        groupSize: Number(values.groupSize),
        community: values.community,
        place: values.place.trim(),
        scheduledAt,
        interestTags: values.interestTags,
        skillTags: values.skillTags,
        sampleParticipants: 0,
        hostName: profile.name || 'You',
      })
    }
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit your activity' : 'Create a custom activity'}
      description={
        editing
          ? 'Changes are stored locally in this browser.'
          : 'Design a short meet-up and add it to your own list. It stays local to this browser.'
      }
      size="lg"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="activity-form" icon={editing ? <Save className="h-4 w-4" /> : <CalendarPlus className="h-4 w-4" />}>
            {editing ? 'Save changes' : 'Create activity'}
          </Button>
        </div>
      }
    >
      <form id="activity-form" onSubmit={submit} className="space-y-4" noValidate>
        <TextField
          label="Activity title"
          required
          value={values.title}
          onChange={(v) => update('title', v)}
          placeholder="E.g. Sunday chai and a slow walk"
          error={errors.title}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Category"
            required
            value={values.category}
            onChange={(v) => update('category', v as ActivityCategory)}
            options={ACTIVITY_CATEGORIES.map((c) => ({ value: c, label: c }))}
            error={errors.category}
          />
          <SelectField
            label="Community"
            required
            value={values.community}
            onChange={(v) => update('community', v)}
            options={COMMUNITIES.map((c) => ({ value: c.name, label: c.name }))}
          />
          <SelectField
            label="Duration"
            required
            value={String(values.durationMins)}
            onChange={(v) => update('durationMins', Number(v))}
            options={[20, 30, 45, 60, 90, 120, 180].map((m) => ({ value: String(m), label: `${m} minutes` }))}
            error={errors.durationMins}
            hint="Milaap works best at 20–60 minutes."
          />
          <TextField
            label="Suggested group size"
            required
            type="number"
            min={2}
            max={60}
            value={String(values.groupSize)}
            onChange={(v) => update('groupSize', Number(v))}
            error={errors.groupSize}
          />
        </div>

        <TextArea
          label="What will actually happen?"
          required
          value={values.description}
          onChange={(v) => update('description', v)}
          maxLength={400}
          rows={4}
          placeholder="Keep it concrete: what people do, what to bring, how long it takes."
          error={errors.description}
          hint="Sample participant numbers will stay at zero for activities you create — nobody else is really joining."
        />

        <TextField
          label="Meeting place"
          required
          value={values.place}
          onChange={(v) => update('place', v)}
          placeholder="A public place people can find easily"
          error={errors.place}
          hint="Public places only. Never ask for or share a home address."
        />

        <fieldset className="rounded-xl border border-line p-3.5">
          <legend className="px-1 text-[13px] font-semibold text-ink">Scheduling</legend>
          <label className="flex cursor-pointer items-center gap-2 text-[13.5px] text-ink">
            <input
              type="checkbox"
              checked={values.scheduleEnabled}
              onChange={(e) => update('scheduleEnabled', e.target.checked)}
              className="h-4 w-4 accent-[#7B8F42]"
            />
            Set a date and time now
          </label>
          {values.scheduleEnabled ? (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <TextField
                label="Date"
                type="date"
                min={todayISO()}
                value={values.date}
                onChange={(v) => update('date', v)}
                error={errors.scheduledAt}
                required
              />
              <TextField label="Start time" type="time" value={values.time} onChange={(v) => update('time', v)} required />
            </div>
          ) : (
            <p className="mt-2 text-[12.5px] text-muted">
              Leave it unscheduled and it becomes an idea people can pick up later.
            </p>
          )}
        </fieldset>

        <ChipSelect
          label="Suitable interests"
          options={[...new Set([...profile.interests, 'Gardening', 'Cooking', 'Walking', 'Technology', 'Sports', 'Reading'])]}
          selected={values.interestTags}
          onChange={(next) => update('interestTags', next)}
          allowCustom
          customPlaceholder="Add an interest"
          hint="Used to match your activity with people and with the Discover filters."
        />

        <ChipSelect
          label="Skills involved"
          options={[...new Set([...profile.teachSkills, ...profile.learnSkills, 'Basic smartphone use', 'Cooking', 'Spoken English'])]}
          selected={values.skillTags}
          onChange={(next) => update('skillTags', next)}
          allowCustom
          customPlaceholder="Add a skill"
        />

        {editing ? (
          <Notice tone="info">
            This activity was created by you, so only you can edit or delete it. Sample activities can be joined and saved but
            never changed.
          </Notice>
        ) : null}
      </form>
    </Modal>
  )
}
