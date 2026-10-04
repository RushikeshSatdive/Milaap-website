import { Bookmark, BookmarkCheck, GraduationCap, Pencil, Repeat, Trash2, Users } from 'lucide-react'
import type { SkillListing } from '../../types'
import { Avatar, Badge, Button, Card } from '../ui/primitives'
import { SkillIcon } from '../ui/CategoryIcon'
import { cn } from '../../utils/helpers'

export function SkillCard({
  listing,
  teacherName,
  teacherAvatarId,
  teacherCommunity,
  matchedNames,
  saved,
  onOpenProfile,
  onToggleSave,
  onEdit,
  onDelete,
  onSuggestSwap,
  className,
}: {
  listing: SkillListing
  teacherName: string
  teacherAvatarId: string
  teacherCommunity: string
  /** Names of complementary listings this one pairs with, if any. */
  matchedNames: string[]
  saved: boolean
  onOpenProfile?: () => void
  onToggleSave?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onSuggestSwap?: () => void
  className?: string
}) {
  const isOffer = listing.type === 'offer'

  return (
    <Card as="article" className={cn('flex flex-col p-4', className)}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-ink">
          <SkillIcon category={listing.category} className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[15px] font-bold leading-snug text-ink">{listing.skill}</h3>
            <Badge tone={isOffer ? 'sage' : 'blue'} icon={isOffer ? <GraduationCap className="h-3 w-3" /> : <Users className="h-3 w-3" />}>
              {isOffer ? 'I can teach' : 'I want to learn'}
            </Badge>
          </div>
          <p className="mt-0.5 text-[12.5px] text-muted">{listing.category}</p>
        </div>
        {onToggleSave ? (
          <button
            type="button"
            onClick={onToggleSave}
            aria-pressed={saved}
            aria-label={saved ? 'Remove from saved skills' : 'Save this skill listing'}
            className={cn(
              'grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line transition',
              saved ? 'bg-accent-soft text-accent-ink' : 'bg-surface text-muted hover:text-ink',
            )}
          >
            {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          </button>
        ) : null}
      </div>

      <p className="mt-3 line-clamp-3 text-[13.5px] leading-relaxed text-muted">{listing.description}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <Badge tone="outline">{listing.format}</Badge>
        {listing.availability.slice(0, 2).map((a) => (
          <Badge key={a} tone="neutral">
            {a}
          </Badge>
        ))}
        {listing.createdBy === 'you' ? <Badge tone="blue">Your listing</Badge> : null}
      </div>

      <div className="mt-4 flex items-center gap-2.5 border-t border-line pt-3">
        <button
          type="button"
          onClick={onOpenProfile}
          className="flex min-w-0 items-center gap-2 text-left"
          aria-label={`Open ${teacherName}'s profile`}
        >
          <Avatar name={teacherName} avatarId={teacherAvatarId} size="xs" />
          <span className="min-w-0">
            <span className="block truncate text-[12.5px] font-semibold text-ink">{teacherName}</span>
            <span className="block truncate text-[11.5px] text-muted">{teacherCommunity}</span>
          </span>
        </button>
        <div className="ml-auto flex items-center gap-2">
          {onSuggestSwap ? (
            <Button size="sm" variant={matchedNames.length > 0 ? 'primary' : 'secondary'} icon={<Repeat className="h-4 w-4" />} onClick={onSuggestSwap}>
              <span className="hidden sm:inline">{matchedNames.length > 0 ? 'Suggest swap' : 'Plan 20 min'}</span>
            </Button>
          ) : null}
          {onEdit ? (
            <button
              type="button"
              onClick={onEdit}
              aria-label={`Edit ${listing.skill}`}
              className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-surface text-muted transition hover:text-ink"
            >
              <Pencil className="h-4 w-4" />
            </button>
          ) : null}
          {onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              aria-label={`Delete ${listing.skill}`}
              className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-surface text-muted transition hover:text-[#B4443A]"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      {matchedNames.length > 0 ? (
        <p className="mt-3 rounded-xl border border-accent/25 bg-accent-soft/60 p-2.5 text-[12.5px] font-medium leading-snug text-accent-ink">
          <span className="font-bold">Complementary match: </span>
          pairs with {matchedNames.slice(0, 2).join(' and ')} — a 20-minute swap would suit both sides.
        </p>
      ) : null}
    </Card>
  )
}
