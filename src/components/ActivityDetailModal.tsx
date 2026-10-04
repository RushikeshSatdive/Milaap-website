import {
  Bookmark,
  BookmarkCheck,
  CalendarPlus,
  Check,
  Clock,
  Info,
  MapPin,
  Pencil,
  Trash2,
  Users,
} from 'lucide-react'
import type { Activity } from '../types'
import { useMilaap } from '../hooks'
import { Modal } from './ui/Modal'
import { Avatar, Badge, Button, Notice, ProgressBar } from './ui/primitives'
import { ActivityIcon } from './ui/CategoryIcon'
import { formatDateTime, humanDuration } from '../utils/date'
import { percent } from '../utils/helpers'

export function ActivityDetailModal({
  activity,
  open,
  onClose,
  onEdit,
  onDelete,
  onPlan,
}: {
  activity: Activity | null
  open: boolean
  onClose: () => void
  onEdit?: (activity: Activity) => void
  onDelete?: (activity: Activity) => void
  onPlan?: (activity: Activity) => void
}) {
  const { isJoined, joinActivity, leaveActivity, isSavedActivity, toggleSavedActivity, members } = useMilaap()

  if (!activity) return null

  const joined = isJoined(activity.id)
  const saved = isSavedActivity(activity.id)
  const participants = activity.sampleParticipants + (joined ? 1 : 0)
  const host = activity.createdBy === 'you' ? null : members.find((m) => m.name === activity.hostName)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={activity.title}
      description={`${activity.category} · ${activity.community}`}
      size="lg"
      footer={
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          {joined ? (
            <Button variant="soft" onClick={() => leaveActivity(activity.id)}>
              Leave activity
            </Button>
          ) : (
            <Button onClick={() => joinActivity(activity.id)} disabled={participants >= activity.groupSize}>
              {participants >= activity.groupSize ? 'Group full' : 'Join this activity'}
            </Button>
          )}
          <Button
            variant="secondary"
            icon={saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
            onClick={() => toggleSavedActivity(activity.id)}
          >
            {saved ? 'Saved' : 'Save activity'}
          </Button>
          {onPlan ? (
            <Button variant="secondary" icon={<CalendarPlus className="h-4 w-4" />} onClick={() => onPlan(activity)}>
              Plan 20 minutes
            </Button>
          ) : null}
          {activity.createdBy === 'you' && onEdit ? (
            <Button variant="secondary" size="icon" aria-label="Edit activity" onClick={() => onEdit(activity)} icon={<Pencil className="h-4 w-4" />} />
          ) : null}
          {activity.createdBy === 'you' && onDelete ? (
            <Button
              variant="secondary"
              size="icon"
              aria-label="Delete activity"
              onClick={() => onDelete(activity)}
              icon={<Trash2 className="h-4 w-4" />}
            />
          ) : null}
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-2xl border border-line bg-surface2/50 p-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-ink">
            <ActivityIcon category={activity.category} className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-[14px] font-bold text-ink">{activity.title}</p>
            <p className="mt-0.5 text-[13px] text-muted">
              {activity.scheduledAt ? formatDateTime(activity.scheduledAt) : 'Not scheduled yet — an open idea'}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge tone="sage">{activity.category}</Badge>
              <Badge tone="neutral">{humanDuration(activity.durationMins)}</Badge>
              {activity.createdBy === 'you' ? <Badge tone="blue">Created by you</Badge> : <Badge tone="outline">Sample activity</Badge>}
              {joined ? (
                <Badge tone="sage" icon={<Check className="h-3 w-3" />}>
                  Joined
                </Badge>
              ) : null}
            </div>
          </div>
        </div>

        <p className="text-[14px] leading-relaxed text-muted">{activity.description}</p>

        <dl className="grid gap-3 sm:grid-cols-2">
          {[
            { icon: <Clock className="h-4 w-4" />, label: 'Duration', value: humanDuration(activity.durationMins) },
            {
              icon: <MapPin className="h-4 w-4" />,
              label: 'Meeting place',
              value: activity.place,
            },
            {
              icon: <Users className="h-4 w-4" />,
              label: 'Suggested group size',
              value: `${activity.groupSize} people`,
            },
            {
              icon: <CalendarPlus className="h-4 w-4" />,
              label: 'Community',
              value: activity.community,
            },
          ].map((row) => (
            <div key={row.label} className="flex items-start gap-2.5 rounded-xl border border-line p-3">
              <span className="mt-0.5 text-muted" aria-hidden>
                {row.icon}
              </span>
              <div>
                <dt className="text-[12px] font-semibold uppercase tracking-wide text-muted">{row.label}</dt>
                <dd className="mt-0.5 text-[13.5px] text-ink">{row.value}</dd>
              </div>
            </div>
          ))}
        </dl>

        <div className="rounded-xl border border-line p-3.5">
          <ProgressBar
            value={percent(participants, activity.groupSize)}
            label="Sample participants"
            hint={`${participants} of ${activity.groupSize} spots`}
          />
          <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
            {activity.createdBy === 'you'
              ? 'You created this activity, so the participant count is just you — nobody else has joined.'
              : `${activity.sampleParticipants} participants come from the seeded demonstration data. ${joined ? 'Your join adds one more, stored only in this browser.' : 'Joining adds you locally — no real person is notified.'}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface2/50 p-3.5">
          <Avatar name={activity.hostName} avatarId={activity.hostName} size="sm" />
          <div>
            <p className="text-[13.5px] font-semibold text-ink">
              {activity.createdBy === 'you' ? 'Hosted by you' : `Hosted by ${activity.hostName}`}
            </p>
            <p className="text-[12.5px] text-muted">
              {host ? `${host.community} · sample profile` : 'Sample host profile for demonstration'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {activity.interestTags.map((t) => (
            <Badge key={t} tone="neutral">
              {t}
            </Badge>
          ))}
          {activity.skillTags
            .filter((t) => !activity.interestTags.includes(t))
            .map((t) => (
              <Badge key={t} tone="sage">
                {t}
              </Badge>
            ))}
        </div>

        <Notice tone="warning" icon={<Info className="h-4 w-4" />}>
          This is a demonstration activity. Joining, leaving or saving only changes your own local data — nobody is contacted
          and no real event is created.
        </Notice>
      </div>
    </Modal>
  )
}
