import { CheckCircle2, Circle, Pencil, Trash2, Users } from 'lucide-react'
import type { CommunityChallenge } from '../types'
import { useMilaap } from '../hooks'
import { Modal } from './ui/Modal'
import { Badge, Button, Card, Notice, ProgressBar } from './ui/primitives'
import { percent, cn } from '../utils/helpers'

export function ChallengeBoardModal({
  challenge,
  open,
  onClose,
  onEdit,
  onDelete,
}: {
  challenge: CommunityChallenge | null
  open: boolean
  onClose: () => void
  onEdit?: (challenge: CommunityChallenge) => void
  onDelete?: (challenge: CommunityChallenge) => void
}) {
  const { toggleTask, toggleChallengeJoin, isSavedChallenge, toggleSaveChallenge } = useMilaap()

  if (!challenge) return null

  const done = challenge.tasks.filter((t) => t.done).length
  const completion = percent(done, challenge.tasks.length || 1)
  const saved = isSavedChallenge(challenge.id)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={challenge.title}
      description={`${challenge.category} · ${challenge.community}`}
      size="lg"
      footer={
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <Button variant={challenge.joined ? 'soft' : 'primary'} onClick={() => toggleChallengeJoin(challenge.id)}>
            {challenge.joined ? 'Leave challenge' : 'Join challenge'}
          </Button>
          <Button variant="secondary" onClick={() => toggleSaveChallenge(challenge.id)}>
            {saved ? 'Saved' : 'Save challenge'}
          </Button>
          {challenge.createdBy === 'you' && onEdit ? (
            <Button variant="secondary" size="icon" aria-label="Edit challenge" icon={<Pencil className="h-4 w-4" />} onClick={() => onEdit(challenge)} />
          ) : null}
          {challenge.createdBy === 'you' && onDelete ? (
            <Button
              variant="secondary"
              size="icon"
              aria-label="Delete challenge"
              icon={<Trash2 className="h-4 w-4" />}
              onClick={() => onDelete(challenge)}
            />
          ) : null}
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-1.5">
          <Badge tone="sage">{challenge.category}</Badge>
          {challenge.joined ? <Badge tone="sage">You joined</Badge> : null}
          {challenge.createdBy === 'you' ? <Badge tone="blue">Created by you</Badge> : <Badge tone="outline">Sample challenge</Badge>}
        </div>

        <p className="rounded-xl bg-accent-soft/70 px-3.5 py-2.5 text-[13.5px] font-medium leading-relaxed text-accent-ink">
          <span className="font-bold">Goal: </span>
          {challenge.goal}
        </p>

        <p className="text-[14px] leading-relaxed text-muted">{challenge.description}</p>

        <Card className="p-4">
          <ProgressBar
            value={completion}
            label="Challenge progress"
            hint={`${done} of ${challenge.tasks.length} tasks · ${completion}%`}
          />
          <p className="mt-2 flex items-center gap-1.5 text-[12.5px] text-muted">
            <Users className="h-3.5 w-3.5" aria-hidden />
            {challenge.createdBy === 'you'
              ? 'Only you are on this challenge — it has no real participants.'
              : `${challenge.sampleParticipants} sample participants from the demonstration data${challenge.joined ? ', plus you.' : '.'}`}
          </p>
        </Card>

        <div>
          <h3 className="text-[14px] font-bold text-ink">Task list</h3>
          <p className="mt-0.5 text-[12.5px] text-muted">
            Tick a task when you have actually done it locally. Progress is saved in this browser.
          </p>
          <ul className="mt-2.5 space-y-2">
            {challenge.tasks.map((task) => (
              <li key={task.id}>
                <label
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition',
                    task.done ? 'border-accent/40 bg-accent-soft/50' : 'border-line bg-surface hover:border-accent/40',
                  )}
                >
                  <input type="checkbox" checked={task.done} onChange={() => toggleTask(challenge.id, task.id)} className="sr-only" />
                  <span className={cn('mt-[1px] shrink-0', task.done ? 'text-accent' : 'text-muted')}>
                    {task.done ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                  </span>
                  <span className={cn('text-[13.5px] leading-snug', task.done ? 'text-muted line-through' : 'text-ink')}>
                    {task.label}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>

        <Notice tone="warning">
          Community participation here is fictional demonstration data. Milaap has no backend, so no neighbour is notified when
          you join, tick a task or create a challenge.
        </Notice>
      </div>
    </Modal>
  )
}
