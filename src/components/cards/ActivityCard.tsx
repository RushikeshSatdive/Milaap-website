import { Bookmark, BookmarkCheck, CalendarClock, Check, Clock, MapPin, Pencil, Trash2, Users } from 'lucide-react'
import type { Activity } from '../../types'
import { Avatar, Badge, Button, Card } from '../ui/primitives'
import { ActivityIcon } from '../ui/CategoryIcon'
import { formatDateTime, humanDuration } from '../../utils/date'
import { cn } from '../../utils/helpers'

export function ActivityCard({
  activity,
  joined,
  saved,
  onOpen,
  onJoin,
  onLeave,
  onSave,
  onEdit,
  onDelete,
  className,
}: {
  activity: Activity
  joined: boolean
  saved: boolean
  onOpen: () => void
  onJoin?: () => void
  onLeave?: () => void
  onSave?: () => void
  onEdit?: () => void
  onDelete?: () => void
  className?: string
}) {
  const participants = activity.sampleParticipants + (joined ? 1 : 0)
  const spotsLeft = Math.max(0, activity.groupSize - participants)

  return (
    <Card as="article" className={cn('flex flex-col p-4', className)}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-ink">
          <ActivityIcon category={activity.category} className="h-5 w-5" />
        </span>
        <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left">
          <h3 className="text-[15px] font-bold leading-snug text-ink">{activity.title}</h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-muted">
            <span className="font-semibold text-accent-ink">{activity.category}</span>
            <span aria-hidden>·</span>
            <span className="truncate">{activity.community}</span>
          </p>
        </button>
        {onSave ? (
          <button
            type="button"
            onClick={onSave}
            aria-pressed={saved}
            aria-label={saved ? 'Remove from saved activities' : 'Save this activity'}
            className={cn(
              'grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line transition',
              saved ? 'bg-accent-soft text-accent-ink' : 'bg-surface text-muted hover:text-ink',
            )}
          >
            {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          </button>
        ) : null}
      </div>

      <button type="button" onClick={onOpen} className="mt-3 text-left">
        <p className="line-clamp-2 text-[13.5px] leading-relaxed text-muted">{activity.description}</p>
      </button>

      <dl className="mt-3 grid grid-cols-2 gap-2 text-[12.5px]">
        <div className="flex items-center gap-1.5 text-muted">
          <CalendarClock className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <dt className="sr-only">When</dt>
          <dd className="truncate">{activity.scheduledAt ? formatDateTime(activity.scheduledAt) : 'Not scheduled yet'}</dd>
        </div>
        <div className="flex items-center gap-1.5 text-muted">
          <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <dt className="sr-only">Duration</dt>
          <dd>{humanDuration(activity.durationMins)}</dd>
        </div>
        <div className="flex items-center gap-1.5 text-muted">
          <Users className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <dt className="sr-only">Group size</dt>
          <dd>
            {participants}/{activity.groupSize} sample spots
          </dd>
        </div>
        <div className="flex items-center gap-1.5 text-muted">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <dt className="sr-only">Where</dt>
          <dd className="truncate">{activity.place}</dd>
        </div>
      </dl>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {activity.category === 'Skill Swap' || activity.skillTags.length > 0
          ? activity.skillTags.slice(0, 2).map((t) => (
              <Badge key={t} tone="sage">
                {t}
              </Badge>
            ))
          : null}
        {activity.interestTags.slice(0, 2).map((t) => (
          <Badge key={t} tone="neutral">
            {t}
          </Badge>
        ))}
        {activity.createdBy === 'you' ? <Badge tone="blue">Created by you</Badge> : null}
        {joined ? <Badge tone="sage" icon={<Check className="h-3 w-3" />}>Joined</Badge> : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-3">
        {onJoin && !joined ? (
          <Button size="sm" onClick={onJoin} disabled={spotsLeft === 0}>
            {spotsLeft === 0 ? 'Group full' : 'Join activity'}
          </Button>
        ) : null}
        {onLeave && joined ? (
          <Button size="sm" variant="soft" onClick={onLeave}>
            Leave activity
          </Button>
        ) : null}
        <Button size="sm" variant="secondary" onClick={onOpen}>
          Details
        </Button>
        {onEdit ? (
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit ${activity.title}`}
            className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-surface text-muted transition hover:text-ink"
          >
            <Pencil className="h-4 w-4" />
          </button>
        ) : null}
        {onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Delete ${activity.title}`}
            className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-surface text-muted transition hover:text-[#B4443A]"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ) : null}
        <span className="ml-auto flex items-center gap-1.5 text-[12px] text-muted">
          <Avatar name={activity.hostName} avatarId={activity.hostName} size="xs" className="h-6 w-6 text-[9px]" />
          <span className="hidden sm:inline">Hosted by {activity.hostName}</span>
        </span>
      </div>
    </Card>
  )
}
