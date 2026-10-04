import { Bookmark, BookmarkCheck, CheckCircle2, Circle, Pencil, Trash2, Users } from 'lucide-react'
import type { CommunityChallenge } from '../../types'
import { Badge, Button, Card, ProgressBar } from '../ui/primitives'
import { percent, cn } from '../../utils/helpers'

export function ChallengeCard({
  challenge,
  onOpen,
  onToggleJoin,
  onToggleTask,
  onToggleSave,
  onEdit,
  onDelete,
  saved = false,
  className,
}: {
  challenge: CommunityChallenge
  onOpen?: () => void
  onToggleJoin: () => void
  onToggleTask: (taskId: string) => void
  onToggleSave?: () => void
  onEdit?: () => void
  onDelete?: () => void
  saved?: boolean
  className?: string
}) {
  const done = challenge.tasks.filter((t) => t.done).length
  const completion = percent(done, challenge.tasks.length || 1)
  const participants = challenge.sampleParticipants + (challenge.joined ? 1 : 0)

  return (
    <Card as="article" className={cn('flex flex-col p-4', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <Badge tone="neutral">{challenge.category}</Badge>
            {challenge.createdBy === 'you' ? <Badge tone="blue">Created by you</Badge> : null}
            {challenge.joined ? <Badge tone="sage">Joined</Badge> : null}
          </div>
          <h3 className="text-[15px] font-bold leading-snug text-ink">{challenge.title}</h3>
          <p className="mt-1 text-[12.5px] text-muted">{challenge.community}</p>
        </div>
        {onToggleSave ? (
          <ChallengeSavedToggle saved={Boolean(saved)} onToggle={onToggleSave} title={challenge.title} />
        ) : null}
      </div>

      <p className="mt-2.5 rounded-xl bg-accent-soft/60 px-3 py-2 text-[13px] font-medium leading-snug text-accent-ink">
        Goal: {challenge.goal}
      </p>
      <p className="mt-2.5 line-clamp-3 text-[13.5px] leading-relaxed text-muted">{challenge.description}</p>

      <div className="mt-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-[12.5px] text-muted">
            <Users className="h-3.5 w-3.5" aria-hidden />
            {participants} sample participants · {done}/{challenge.tasks.length} tasks done
          </span>
          <span className="text-[12px] font-semibold text-muted">{completion}%</span>
        </div>
        <ProgressBar value={completion} label={`${challenge.title} progress`} />
      </div>

      <ul className="mt-3 space-y-1.5">
        {challenge.tasks.slice(0, 3).map((task) => (
          <li key={task.id}>
            <label className="flex cursor-pointer items-start gap-2 text-[13px] leading-snug text-muted">
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => onToggleTask(task.id)}
                className="peer sr-only"
              />
              <span className="mt-[1px] shrink-0 text-muted peer-checked:text-accent">
                {task.done ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
              </span>
              <span className={cn('peer-checked:text-muted peer-checked:line-through', task.done && 'text-muted line-through')}>
                {task.label}
              </span>
            </label>
          </li>
        ))}
        {challenge.tasks.length > 3 ? (
          <li className="pl-6 text-[12.5px] text-muted">+{challenge.tasks.length - 3} more tasks</li>
        ) : null}
      </ul>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-3">
        <Button size="sm" variant={challenge.joined ? 'soft' : 'primary'} onClick={onToggleJoin}>
          {challenge.joined ? 'Leave challenge' : 'Join challenge'}
        </Button>
        {onOpen ? (
          <Button size="sm" variant="secondary" onClick={onOpen}>
            Open board
          </Button>
        ) : null}
        {onToggleSave ? (
          <ChallengeSavedToggle saved={saved} onToggle={onToggleSave} title={challenge.title} />
        ) : null}
        {onEdit ? (
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit ${challenge.title}`}
            className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-surface text-muted transition hover:text-ink"
          >
            <Pencil className="h-4 w-4" />
          </button>
        ) : null}
        {onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Delete ${challenge.title}`}
            className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-surface text-muted transition hover:text-[#B4443A]"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </Card>
  )
}

export function ChallengeSavedToggle({
  saved,
  onToggle,
  title,
}: {
  saved: boolean
  onToggle: () => void
  title: string
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${title} from saved` : `Save ${title}`}
      className={cn(
        'grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line transition',
        saved ? 'bg-accent-soft text-accent-ink' : 'bg-surface text-muted hover:text-ink',
      )}
    >
      {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
    </button>
  )
}
