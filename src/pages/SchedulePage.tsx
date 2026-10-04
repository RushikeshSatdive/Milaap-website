import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  Clock,
  MapPin,
  Pencil,
  RotateCcw,
  Trash2,
  Users,
  XCircle,
} from 'lucide-react'
import { useMilaap, useDocumentTitle } from '../hooks'
import type { ActivityCategory, Invitation } from '../types'
import { Badge, Button, Card, EmptyState, Notice, SectionHeading } from '../components/ui/primitives'
import { Tabs } from '../components/ui/Tabs'
import { Modal } from '../components/ui/Modal'
import { PageHeader } from '../components/ui/PageHeader'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { PlanActivityModal } from '../components/PlanActivityModal'
import { StatCard } from '../components/cards/StatCard'
import { ActivityIcon } from '../components/ui/CategoryIcon'
import { invitationTimestamp, formatDayLabel, formatShortDay, formatTime24, humanDuration, relativeTime } from '../utils/date'
import { cn } from '../utils/helpers'

interface ScheduleItem {
  id: string
  kind: 'invitation' | 'activity'
  title: string
  category: string
  date: string
  time: string
  durationMins: number
  place: string
  status: 'upcoming' | 'past' | 'completed' | 'cancelled'
  /** Activities only: true when the demo user actually joined it. */
  joined?: boolean
  withName?: string
  withAvatarId?: string
  note?: string
  createdAt: string
}

export function SchedulePage() {
  useDocumentTitle('My Schedule')
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const {
    invitations,
    memberById,
    activities,
    joinedActivityIds,
    isJoined,
    leaveActivity,
    isSavedActivity,
    toggleSavedActivity,
    cancelInvitation,
    completeInvitation,
    deleteInvitation,
    completedActivityIds,
    completeActivity,
    stats,
  } = useMilaap()

  const todayISOString = useMemo(() => {
    const d = new Date()
    return `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, '0')}-${`${d.getDate()}`.padStart(2, '0')}`
  }, [])

  const [tab, setTab] = useState('upcoming')
  const [planOpen, setPlanOpen] = useState(false)
  const [editing, setEditing] = useState<Invitation | null>(null)
  const [pendingCancel, setPendingCancel] = useState<Invitation | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Invitation | null>(null)
  const [detailId, setDetailId] = useState<string | null>(params.get('focus'))
  const [view, setView] = useState<'grouped' | 'list'>('grouped')

  useEffect(() => {
    const focus = params.get('focus')
    if (focus) setDetailId(focus)
  }, [params])

  const closeDetail = () => {
    setDetailId(null)
    if (params.get('focus')) {
      params.delete('focus')
      setParams(params, { replace: true })
    }
  }

  const items = useMemo<ScheduleItem[]>(() => {
    const invitationItems: ScheduleItem[] = invitations.map((inv) => {
      const member = memberById(inv.memberId)
      const ts = invitationTimestamp(inv.date, inv.time)
      const status: ScheduleItem['status'] =
        inv.status === 'cancelled' ? 'cancelled' : inv.status === 'completed' ? 'completed' : ts < Date.now() ? 'past' : 'upcoming'
      return {
        id: inv.id,
        kind: 'invitation',
        title: inv.title,
        category: inv.activityType,
        date: inv.date,
        time: inv.time,
        durationMins: inv.durationMins,
        place: inv.place,
        status,
        withName: member?.name,
        withAvatarId: member?.avatarId,
        note: inv.note,
        createdAt: inv.createdAt,
      }
    })

    const activityItems: ScheduleItem[] = activities
      .filter((a) => (isJoined(a.id) || isSavedActivity(a.id)) && a.scheduledAt)
      .map((a) => {
        const d = new Date(a.scheduledAt as string)
        const ts = d.getTime()
        const iso = `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, '0')}-${`${d.getDate()}`.padStart(2, '0')}`
        return {
          id: a.id,
          kind: 'activity',
          title: a.title,
          category: a.category,
          date: iso,
          time: `${`${d.getHours()}`.padStart(2, '0')}:${`${d.getMinutes()}`.padStart(2, '0')}`,
          durationMins: a.durationMins,
          place: a.place,
          status: completedActivityIds.includes(a.id) ? 'completed' : ts < Date.now() ? 'past' : 'upcoming',
          joined: isJoined(a.id),
          withName: a.hostName,
          withAvatarId: a.hostName,
          createdAt: a.createdAt,
        }
      })

    return [...invitationItems, ...activityItems].sort(
      (a, b) => invitationTimestamp(a.date, a.time) - invitationTimestamp(b.date, b.time),
    )
  }, [invitations, activities, isJoined, isSavedActivity, completedActivityIds, memberById])

  const filtered = useMemo(() => {
    switch (tab) {
      case 'upcoming':
        return items.filter((i) => i.status === 'upcoming')
      case 'past':
        return items.filter((i) => i.status === 'past' || i.status === 'completed').reverse()
      case 'invitations':
        return items.filter((i) => i.kind === 'invitation')
      case 'cancelled':
        return items.filter((i) => i.status === 'cancelled')
      case 'saved':
        return items.filter((i) => i.kind === 'activity' && isSavedActivity(i.id))
      default:
        return items
    }
  }, [items, tab, isSavedActivity])

  const grouped = useMemo(() => {
    const map = new Map<string, ScheduleItem[]>()
    for (const item of filtered) {
      const list = map.get(item.date) ?? []
      list.push(item)
      map.set(item.date, list)
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [filtered])

  const nextUp = items.find((i) => i.status === 'upcoming')
  const detail = detailId ? items.find((i) => i.id === detailId) ?? null : null

  const counts = {
    upcoming: items.filter((i) => i.status === 'upcoming').length,
    past: items.filter((i) => i.status === 'past' || i.status === 'completed').length,
    invitations: items.filter((i) => i.kind === 'invitation').length,
    cancelled: items.filter((i) => i.status === 'cancelled').length,
  }

  const handleComplete = (item: ScheduleItem) => {
    if (item.kind === 'invitation') {
      completeInvitation(item.id)
      return
    }
    completeActivity(item.id)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={
          <Badge tone="sage" icon={<CalendarDays className="h-3 w-3" />}>
            My Schedule
          </Badge>
        }
        title="Your activity planner"
        description="Local demo invitations you created, activities you joined and saved, and everything already done. Editing or cancelling anything here updates the rest of the app immediately."
        actions={
          <Button icon={<CalendarPlus className="h-4 w-4" />} onClick={() => setPlanOpen(true)}>
            New invitation
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Upcoming" value={counts.upcoming} hint={nextUp ? `Next: ${nextUp.title}` : 'Nothing scheduled'} icon={<CalendarDays className="h-4 w-4" />} />
        <StatCard
          label="Completed / past"
          value={items.filter((i) => i.status === 'past' || i.status === 'completed').length}
          hint={`${stats.invitationsCompleted} invitations marked completed`}
          icon={<CheckCircle2 className="h-4 w-4" />}
          tone="neutral"
        />
        <StatCard label="Demo invitations" value={counts.invitations} hint="Created locally by you or seeded" icon={<CalendarPlus className="h-4 w-4" />} tone="neutral" />
        <StatCard label="Activities joined" value={joinedActivityIds.length} hint="Locally tracked joins" icon={<Users className="h-4 w-4" />} to="/activities" />
      </div>

      <Notice tone="warning" title="Demo invitations are local only">
        An invitation here is a note in your own browser. No message is sent, nobody receives it, and nobody can accept or
        decline. Participants in sample activities come from seeded demonstration data.
      </Notice>

      <Tabs
        value={tab}
        onChange={setTab}
        label="Schedule sections"
        options={[
          { id: 'upcoming', label: 'Upcoming', count: counts.upcoming },
          { id: 'past', label: 'Past & completed', count: counts.past },
          { id: 'invitations', label: 'My invitations', count: counts.invitations },
          { id: 'cancelled', label: 'Cancelled', count: counts.cancelled },
          {
            id: 'saved',
            label: 'Saved activities',
            count: items.filter((i) => i.kind === 'activity' && isSavedActivity(i.id)).length,
          },
        ]}
      />

      <div className="flex items-center justify-between gap-2">
        <p className="text-[12.5px] text-muted">
          {filtered.length} {filtered.length === 1 ? 'item' : 'items'} shown
        </p>
        <div className="inline-flex rounded-xl border border-line bg-surface p-0.5">
          {(['grouped', 'list'] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              aria-pressed={view === v}
              className={cn(
                'rounded-[10px] px-3 py-1.5 text-[12.5px] font-semibold transition',
                view === v ? 'bg-accent-soft text-accent-ink' : 'text-muted hover:text-ink',
              )}
            >
              {v === 'grouped' ? 'By date' : 'Flat list'}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="h-6 w-6" />}
          title={
            tab === 'saved'
              ? 'No saved activities'
              : tab === 'cancelled'
                ? 'Nothing cancelled'
                : tab === 'invitations'
                  ? 'No demo invitations yet'
                  : 'Nothing scheduled'
          }
          description={
            tab === 'saved'
              ? 'Save an activity from the Activities page and it will appear here with your other saved items.'
              : 'Create a local demo invitation with someone from your connections, or join a sample activity.'
          }
          action={
            <>
              <Button icon={<CalendarPlus className="h-4 w-4" />} onClick={() => setPlanOpen(true)}>
                Create invitation
              </Button>
              <Button variant="secondary" onClick={() => navigate('/activities')}>
                Browse activities
              </Button>
            </>
          }
        />
      ) : view === 'grouped' ? (
        <div className="space-y-5">
          {grouped.map(([date, groupItems]) => (
            <section key={date}>
              <SectionHeading
                title={formatShortDay(date)}
                subtitle={`${groupItems.length} ${groupItems.length === 1 ? 'item' : 'items'} · ${date === todayISOString ? 'Today' : formatDayLabel(date)}`}
              />
              <div className="space-y-2">
                {groupItems.map((item) => (
                  <ScheduleRow
                    key={`${item.kind}-${item.id}`}
                    item={item}
                    onOpen={() => setDetailId(item.id)}
                    onComplete={() => handleComplete(item)}
                    onEdit={item.kind === 'invitation' ? () => {
                      const inv = invitations.find((i) => i.id === item.id)
                      if (inv) {
                        setEditing(inv)
                        setPlanOpen(true)
                      }
                    } : undefined}
                    onCancel={item.kind === 'invitation' ? () => setPendingCancel(invitations.find((i) => i.id === item.id) ?? null) : undefined}
                    onLeave={item.kind === 'activity' ? () => leaveActivity(item.id) : undefined}
                    onDelete={item.kind === 'invitation' ? () => setPendingDelete(invitations.find((i) => i.id === item.id) ?? null) : undefined}
                    onToggleSave={
                      item.kind === 'activity'
                        ? () => toggleSavedActivity(item.id)
                        : undefined
                    }
                    saved={item.kind === 'activity' ? isSavedActivity(item.id) : false}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => (
            <ScheduleRow
              key={`${item.kind}-${item.id}`}
              item={item}
              onOpen={() => setDetailId(item.id)}
              onComplete={() => handleComplete(item)}
              onEdit={item.kind === 'invitation' ? () => {
                const inv = invitations.find((i) => i.id === item.id)
                if (inv) {
                  setEditing(inv)
                  setPlanOpen(true)
                }
              } : undefined}
              onCancel={item.kind === 'invitation' ? () => setPendingCancel(invitations.find((i) => i.id === item.id) ?? null) : undefined}
              onLeave={item.kind === 'activity' ? () => leaveActivity(item.id) : undefined}
              onDelete={item.kind === 'invitation' ? () => setPendingDelete(invitations.find((i) => i.id === item.id) ?? null) : undefined}
              onToggleSave={item.kind === 'activity' ? () => toggleSavedActivity(item.id) : undefined}
              saved={item.kind === 'activity' ? isSavedActivity(item.id) : false}
            />
          ))}
        </div>
      )}

      {detail ? (
        <ScheduleDetailDialog
          item={detail}
          open={Boolean(detail)}
          onClose={closeDetail}
          onEdit={
            detail.kind === 'invitation'
              ? () => {
                  const inv = invitations.find((i) => i.id === detail.id)
                  if (inv) {
                    closeDetail()
                    setEditing(inv)
                    setPlanOpen(true)
                  }
                }
              : undefined
          }
          onCancel={() => {
            if (detail.kind === 'invitation') setPendingCancel(invitations.find((i) => i.id === detail.id) ?? null)
          }}
          onComplete={() => handleComplete(detail)}
          onLeave={() => {
            if (detail.kind === 'activity') leaveActivity(detail.id)
          }}
        />
      ) : null}

      <PlanActivityModal
        open={planOpen}
        onClose={() => {
          setPlanOpen(false)
          setEditing(null)
        }}
        invitation={editing}
        onCreated={() => undefined}
      />

      <ConfirmDialog
        open={Boolean(pendingCancel)}
        title="Cancel this invitation?"
        message={
          <>
            “{pendingCancel?.title}” will be marked as cancelled and moved out of your upcoming list. You can delete it
            entirely afterwards.
          </>
        }
        confirmLabel="Cancel invitation"
        cancelLabel="Keep it"
        onCancel={() => setPendingCancel(null)}
        onConfirm={() => {
          if (pendingCancel) cancelInvitation(pendingCancel.id)
          setPendingCancel(null)
        }}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        destructive
        title="Delete this invitation?"
        message={<>“{pendingDelete?.title}” will be removed from your local schedule. This cannot be undone.</>}
        confirmLabel="Delete"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) deleteInvitation(pendingDelete.id)
          setPendingDelete(null)
        }}
      />

      <Card className="p-5">
        <h2 className="text-[15px] font-bold text-ink">Keeping the schedule honest</h2>
        <ul className="mt-2 space-y-1.5 text-[13px] leading-relaxed text-muted">
          <li>· Past items stay visible so you can see what you actually did, not just what you intended.</li>
          <li>· “Mark as completed” is your own bookkeeping — it does not claim anyone else attended.</li>
          <li>· Cancelling asks for confirmation first, so a stray tap never loses your plan.</li>
          <li>· Every change is written to this browser and survives a refresh.</li>
        </ul>
        <Button
          className="mt-3"
          variant="secondary"
          size="sm"
          icon={<RotateCcw className="h-4 w-4" />}
          onClick={() => navigate('/activities')}
        >
          Find another activity
        </Button>
      </Card>
    </div>
  )
}

function ScheduleRow({
  item,
  onOpen,
  onComplete,
  onEdit,
  onCancel,
  onLeave,
  onDelete,
  onToggleSave,
  saved,
}: {
  item: ScheduleItem
  onOpen: () => void
  onComplete: () => void
  onEdit?: () => void
  onCancel?: () => void
  onLeave?: () => void
  onDelete?: () => void
  onToggleSave?: () => void
  saved: boolean
}) {
  const statusTone =
    item.status === 'cancelled'
      ? 'rose'
      : item.status === 'completed'
        ? 'sage'
        : item.status === 'past'
          ? 'neutral'
          : 'blue'

  return (
    <Card className="p-3.5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-ink">
            <ActivityIcon category={item.category as ActivityCategory} className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <button type="button" onClick={onOpen} className="text-left">
              <h3 className="text-[14.5px] font-bold leading-snug text-ink">{item.title}</h3>
            </button>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-muted">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" aria-hidden /> {formatDayLabel(item.date)} · {formatTime24(item.time)} ·{' '}
                {humanDuration(item.durationMins)}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" aria-hidden /> {item.place}
              </span>
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <Badge tone={statusTone as 'sage' | 'neutral' | 'blue' | 'rose'}>
                {item.status === 'upcoming'
                  ? `Upcoming · ${relativeTime(new Date(invitationTimestamp(item.date, item.time)).toISOString())}`
                  : item.status === 'past'
                    ? 'Past'
                    : item.status === 'completed'
                      ? 'Completed'
                      : 'Cancelled'}
              </Badge>
              <Badge tone="outline">
                {item.kind === 'invitation' ? 'Demo invitation' : item.joined ? 'Joined activity' : 'Saved activity'}
              </Badge>
              {item.category ? <Badge tone="neutral">{item.category}</Badge> : null}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <Button size="sm" variant="secondary" onClick={onOpen}>
            Details
          </Button>
          {item.status !== 'completed' && item.status !== 'cancelled' ? (
            <Button size="sm" variant="soft" onClick={onComplete}>
              Mark completed
            </Button>
          ) : null}
          {onToggleSave ? (
            <Button size="sm" variant={saved ? 'soft' : 'secondary'} onClick={onToggleSave}>
              {saved ? 'Saved' : 'Save'}
            </Button>
          ) : null}
          {onEdit ? (
            <button
              type="button"
              onClick={onEdit}
              aria-label={`Edit ${item.title}`}
              className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-surface text-muted transition hover:text-ink"
            >
              <Pencil className="h-4 w-4" />
            </button>
          ) : null}
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              aria-label={`Cancel ${item.title}`}
              className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-surface text-muted transition hover:text-[#B4443A]"
            >
              <XCircle className="h-4 w-4" />
            </button>
          ) : null}
          {onLeave ? (
            <button
              type="button"
              onClick={onLeave}
              aria-label={`Leave ${item.title}`}
              className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-surface text-muted transition hover:text-[#B4443A]"
            >
              <XCircle className="h-4 w-4" />
            </button>
          ) : null}
          {onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              aria-label={`Delete ${item.title}`}
              className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-surface text-muted transition hover:text-[#B4443A]"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>
    </Card>
  )
}

function ScheduleDetailDialog({
  item,
  open,
  onClose,
  onEdit,
  onCancel,
  onComplete,
  onLeave,
}: {
  item: ScheduleItem
  open: boolean
  onClose: () => void
  onEdit?: () => void
  onCancel?: () => void
  onComplete: () => void
  onLeave?: () => void
}) {
  return (
    <Modal open={open} onClose={onClose} title={item.title} size="sm">
      <div className="space-y-3 text-[13.5px] text-muted">
        <p>
          <span className="font-semibold text-ink">Type: </span>
          {item.kind === 'invitation' ? 'Demo invitation (created locally)' : 'Joined sample activity'} · {item.category}
        </p>
        <p>
          <span className="font-semibold text-ink">When: </span>
          {formatShortDay(item.date)} at {formatTime24(item.time)} for {humanDuration(item.durationMins)}
        </p>
        <p>
          <span className="font-semibold text-ink">Where: </span>
          {item.place}
        </p>
        {item.withName ? (
          <p>
            <span className="font-semibold text-ink">{item.kind === 'invitation' ? 'With: ' : 'Host: '}</span>
            {item.withName}
          </p>
        ) : null}
        {item.note ? (
          <p className="rounded-xl border border-line bg-surface2/60 p-3">
            <span className="font-semibold text-ink">Note: </span>
            {item.note}
          </p>
        ) : null}
        <p className="rounded-xl border border-line bg-surface2/60 p-3 text-[12.5px]">
          Status: <strong className="text-ink">{item.status}</strong> · created {relativeTime(item.createdAt)}
        </p>
        <p className="text-[12.5px]">
          Demo invitation created locally. No real message has been sent, and no other person is aware of this item.
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {onEdit ? <Button size="sm" icon={<Pencil className="h-4 w-4" />} onClick={onEdit}>Edit invitation</Button> : null}
        {item.status !== 'completed' && item.status !== 'cancelled' ? (
          <Button size="sm" variant="soft" onClick={onComplete}>
            Mark as completed
          </Button>
        ) : null}
        {onCancel ? (
          <Button size="sm" variant="secondary" onClick={onCancel}>
            Cancel invitation
          </Button>
        ) : null}
        {onLeave ? (
          <Button size="sm" variant="secondary" onClick={onLeave}>
            Leave activity
          </Button>
        ) : null}
      </div>
    </Modal>
  )
}
