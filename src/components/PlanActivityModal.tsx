import { useEffect, useMemo, useState } from 'react'
import { CalendarPlus, Info, MapPin, ShieldCheck } from 'lucide-react'
import type { ActivityCategory, Invitation } from '../types'
import { ACTIVITY_CATEGORIES } from '../types'
import { useMilaap } from '../hooks'
import { MEETING_PLACES } from '../data/seed'
import { Modal } from './ui/Modal'
import { Button, Notice } from './ui/primitives'
import { SelectField, TextArea, TextField } from './ui/Form'
import { Avatar } from './ui/primitives'
import { validateInvitation, hasErrors, type InvitationFormValues } from '../utils/validation'
import { todayISO } from '../utils/date'
import { conversationStarters } from '../utils/conversation'

export interface PlanActivityModalProps {
  open: boolean
  onClose: () => void
  /** Pre-selected member; when omitted the user picks from their connections. */
  memberId?: string
  /** Pre-filled activity type + title when launched from an activity or skill. */
  defaultActivityType?: ActivityCategory
  defaultTitle?: string
  defaultDuration?: number
  /** Pass an existing invitation to edit it instead of creating a new one. */
  invitation?: Invitation | null
  onCreated?: (id: string) => void
}

export function PlanActivityModal({
  open,
  onClose,
  memberId,
  defaultActivityType,
  defaultTitle,
  defaultDuration,
  invitation,
  onCreated,
}: PlanActivityModalProps) {
  const {
    connections,
    memberById,
    members,
    createInvitation,
    updateInvitation,
    isConnected,
    addConnection,
    profile,
    matchFor,
  } = useMilaap()

  const connectionMembers = useMemo(
    () => connections.map((c) => memberById(c.memberId)).filter(Boolean),
    [connections, memberById],
  )

  const [values, setValues] = useState<InvitationFormValues>({
    memberId: '',
    activityType: defaultActivityType ?? 'Chai & Chat',
    title: defaultTitle ?? 'Chai & chat at the market corner',
    date: todayISO(),
    time: '18:00',
    durationMins: defaultDuration ?? 20,
    place: MEETING_PLACES[0],
    note: '',
  })
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})
  const [submitted, setSubmitted] = useState(false)

  /* Re-sync the form whenever the modal is opened for a specific person. */
  useEffect(() => {
    if (!open) return
    if (invitation) {
      setValues({
        memberId: invitation.memberId,
        activityType: invitation.activityType,
        title: invitation.title,
        date: invitation.date,
        time: invitation.time,
        durationMins: invitation.durationMins,
        place: invitation.place,
        note: invitation.note ?? '',
      })
      setErrors({})
      setSubmitted(false)
      return
    }
    const targetId = memberId ?? connectionMembers[0]?.id ?? ''
    const target = targetId ? memberById(targetId) : undefined
    setValues((v) => ({
      ...v,
      memberId: targetId,
      activityType: defaultActivityType ?? target?.preferredActivities[0] ?? v.activityType,
      title: defaultTitle ?? defaultTitleFor(target?.preferredActivities[0] ?? defaultActivityType ?? 'Chai & Chat'),
      durationMins: defaultDuration ?? v.durationMins,
      date: v.date < todayISO() ? todayISO() : v.date,
    }))
    setErrors({})
    setSubmitted(false)
    // Only re-run when the modal opens or the target changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, memberId, defaultActivityType, defaultTitle, defaultDuration, invitation])

  const target = values.memberId ? memberById(values.memberId) : undefined
  const starters = useMemo(
    () => (target ? conversationStarters(profile, target, matchFor(target.id)) : []),
    [target, profile, matchFor],
  )

  const update = <K extends keyof InvitationFormValues>(key: K, value: InvitationFormValues[K]) => {
    setValues((prev) => {
      const next = { ...prev, [key]: value }
      if (submitted) setErrors(validateInvitation(next) as Record<string, string | undefined>)
      return next
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    const validation = validateInvitation(values) as Record<string, string | undefined>
    setErrors(validation)
    if (hasErrors(validation)) return
    if (!isConnected(values.memberId)) addConnection(values.memberId, 'discover')
    const payload = {
      memberId: values.memberId,
      activityType: values.activityType as ActivityCategory,
      title: values.title.trim(),
      date: values.date,
      time: values.time,
      durationMins: Number(values.durationMins),
      place: values.place.trim(),
      note: values.note.trim() || undefined,
    }
    if (invitation) {
      updateInvitation(invitation.id, payload)
      onCreated?.(invitation.id)
    } else {
      const created = createInvitation(payload)
      onCreated?.(created.id)
    }
    onClose()
  }

  const memberOptions = [
    ...connectionMembers.map((m) => ({ value: m!.id, label: `${m!.name} — ${m!.community}` })),
    ...members
      .filter((m) => !connectionMembers.some((c) => c?.id === m.id))
      .map((m) => ({ value: m.id, label: `${m.name} — ${m.community} (not a connection yet)` })),
  ]

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={invitation ? 'Edit this demo invitation' : 'Plan a 20-minute activity'}
      description="Create a local demo invitation. Nothing is sent to anyone — it is stored in this browser only."
      size="lg"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-1.5 text-[12px] text-muted">
            <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden />
            Demo invitation created locally. No real message has been sent.
          </p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" form="plan-activity-form" icon={<CalendarPlus className="h-4 w-4" />}>
              {invitation ? 'Save changes' : 'Create demo invitation'}
            </Button>
          </div>
        </div>
      }
    >
      <form id="plan-activity-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        <SelectField
          label="Who is this with?"
          required
          value={values.memberId}
          onChange={(v) => update('memberId', v)}
          options={memberOptions}
          placeholder="Choose a person"
          error={errors.memberId}
          hint="Your connections come first. Sample community members are demonstration profiles."
        />

        {target ? (
          <div className="flex items-center gap-3 rounded-xl border border-line bg-surface2/60 p-3">
            <Avatar name={target.name} avatarId={target.avatarId} size="sm" />
            <div className="min-w-0 text-[12.5px]">
              <p className="font-semibold text-ink">{target.name}</p>
              <p className="text-muted">
                Enjoys {target.preferredActivities.slice(0, 2).join(' & ')} · {target.availability[0] ?? 'flexible'}
              </p>
            </div>
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Activity type"
            required
            value={values.activityType}
            onChange={(v) => {
              update('activityType', v)
              if (!submitted) update('title', defaultTitleFor(v as ActivityCategory))
            }}
            options={ACTIVITY_CATEGORIES.map((c) => ({ value: c, label: c }))}
            error={errors.activityType}
          />
          <TextField
            label="Title"
            required
            value={values.title}
            onChange={(v) => update('title', v)}
            placeholder="Short and specific"
            error={errors.title}
          />
          <TextField
            label="Date"
            required
            type="date"
            min={todayISO()}
            value={values.date}
            onChange={(v) => update('date', v)}
            error={errors.date}
          />
          <TextField
            label="Start time"
            required
            type="time"
            value={values.time}
            onChange={(v) => update('time', v)}
            error={errors.time}
          />
          <SelectField
            label="Duration"
            required
            value={String(values.durationMins)}
            onChange={(v) => update('durationMins', Number(v))}
            options={[20, 30, 45, 60, 90, 120].map((m) => ({
              value: String(m),
              label: m === 20 ? "20 minutes (Milaap's favourite length)" : `${m} minutes`,
            }))}
            error={errors.durationMins}
          />
          <TextField
            label="Suggested public meeting place"
            required
            value={values.place}
            onChange={(v) => update('place', v)}
            placeholder="A public, easy-to-find spot"
            icon={<MapPin className="h-4 w-4" />}
            error={errors.place}
            hint="Public places only — never a home address."
          />
        </div>

        <TextArea
          label="Optional note"
          value={values.note}
          onChange={(v) => update('note', v)}
          placeholder="Anything to bring, or how to recognise you."
          maxLength={240}
          rows={3}
          error={errors.note}
        />

        {starters.length > 0 ? (
          <Notice
            tone="info"
            title="Conversation starters for this meet-up"
            icon={<Info className="h-4 w-4" />}
          >
            <ul className="mt-1 space-y-1">
              {starters.slice(0, 3).map((s) => (
                <li key={s}>• {s}</li>
              ))}
            </ul>
          </Notice>
        ) : null}

        <Notice tone="warning">
          <strong>This is a prototype.</strong> The invitation is stored in your browser’s localStorage. No person is
          contacted, no message is delivered, and nobody can accept it.
        </Notice>
      </form>
    </Modal>
  )
}

function defaultTitleFor(category: ActivityCategory): string {
  switch (category) {
    case 'Chai & Chat':
      return 'Chai and a proper conversation'
    case 'Skill Swap':
      return 'Skill swap: 20 minutes each way'
    case 'Recipe Exchange':
      return 'Recipe exchange over tea'
    case 'Community Walk':
      return 'Short walk around the neighbourhood'
    case 'Board Games':
      return 'Carrom or ludo, whichever table is free'
    case 'Digital Help Hour':
      return 'Phone help: one problem, sorted'
    case 'Language Exchange':
      return 'Language practice, both directions'
    case 'Study Together':
      return 'Quiet study, same table'
    case 'Sports & Fitness':
      return 'Easy stretch and a walk'
    case 'Cultural Storytelling':
      return 'Stories about this neighbourhood'
    case 'Neighbourhood Volunteering':
      return 'Small volunteering hour'
    case 'Fix One Local Problem':
      return 'Fix one small local thing together'
    default:
      return 'A short meet-up'
  }
}
