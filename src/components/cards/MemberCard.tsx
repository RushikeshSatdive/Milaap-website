import { Bookmark, BookmarkCheck, Check, Info, MapPin, Sparkles, UserMinus, UserPlus, X } from 'lucide-react'
import type { CommunityMember, MatchResult } from '../../types'
import { Avatar, Badge, Button, Card } from '../ui/primitives'
import { cn } from '../../utils/helpers'

/** Circular match-score dial. Deterministic value computed by the matching engine. */
export function MatchRing({ score, size = 46, label = 'match' }: { score: number; size?: number; label?: string }) {
  const stroke = 4
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const dash = (Math.max(0, Math.min(100, score)) / 100) * circumference
  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${score} percent ${label}`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--line)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--sage)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
        />
      </svg>
      <span
        className="absolute inset-0 grid place-items-center text-[11.5px] font-bold text-ink"
        aria-hidden
      >
        {score}%
      </span>
    </div>
  )
}

export interface MemberCardProps {
  member: CommunityMember
  match?: MatchResult
  connected: boolean
  saved: boolean
  onOpen: () => void
  onToggleConnect: () => void
  onToggleSave: () => void
  onDismiss?: () => void
  compact?: boolean
  className?: string
}

export function MemberCard({
  member,
  match,
  connected,
  saved,
  onOpen,
  onToggleConnect,
  onToggleSave,
  onDismiss,
  compact = false,
  className,
}: MemberCardProps) {
  return (
    <Card as="article" className={cn('flex flex-col p-4 transition hover:shadow-lift', className)}>
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onOpen}
          className="flex min-w-0 flex-1 items-start gap-3 text-left"
          aria-label={`View ${member.name}'s demo profile`}
        >
          <Avatar name={member.name} avatarId={member.avatarId} size={compact ? 'sm' : 'md'} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h3 className="truncate text-[15px] font-bold text-ink">{member.name}</h3>
              {member.ageRange ? <span className="text-[12px] text-muted">{member.ageRange}</span> : null}
            </div>
            <p className="mt-0.5 flex items-center gap-1 text-[12.5px] text-muted">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="truncate">{member.community}</span>
            </p>
          </div>
        </button>
        {match ? <MatchRing score={match.score} /> : null}
      </div>

      <button type="button" onClick={onOpen} className="mt-3 block text-left">
        <p className={cn('text-[13.5px] leading-relaxed text-muted', compact ? 'line-clamp-2' : 'line-clamp-3')}>
          {member.bio}
        </p>
      </button>

      {match ? (
        <div className="mt-3 rounded-xl border border-accent/25 bg-accent-soft/60 p-2.5">
          <p className="flex items-start gap-1.5 text-[12.5px] font-medium leading-snug text-accent-ink">
            <Sparkles className="mt-[1px] h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>
              <span className="font-bold">Why this match: </span>
              {match.reasons[0]}
            </span>
          </p>
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {(match?.sharedInterests.length ? match.sharedInterests : member.interests).slice(0, 3).map((interest) => (
          <Badge key={interest} tone={match?.sharedInterests.includes(interest) ? 'sage' : 'neutral'}>
            {interest}
          </Badge>
        ))}
        {member.interests.length > 3 ? <Badge tone="outline">+{member.interests.length - 3}</Badge> : null}
      </div>

      {!compact ? (
        <div className="mt-3 grid gap-1.5 text-[12.5px]">
          {member.teachSkills.length > 0 ? (
            <p className="text-muted">
              <span className="font-semibold text-ink">Can teach: </span>
              {member.teachSkills.slice(0, 3).join(', ')}
            </p>
          ) : null}
          {member.learnSkills.length > 0 ? (
            <p className="text-muted">
              <span className="font-semibold text-ink">Wants to learn: </span>
              {member.learnSkills.slice(0, 3).join(', ')}
            </p>
          ) : null}
          <p className="text-muted">
            <span className="font-semibold text-ink">Suggested activity: </span>
            {member.preferredActivities[0]}
          </p>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-3">
        <Button
          size="sm"
          variant={connected ? 'soft' : 'primary'}
          icon={connected ? <Check className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
          onClick={onToggleConnect}
        >
          {connected ? 'Connected' : 'Add connection'}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          icon={<Info className="h-4 w-4" />}
          onClick={onOpen}
        >
          Details
        </Button>
        <button
          type="button"
          onClick={onToggleSave}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${member.name} from bookmarks` : `Bookmark ${member.name}`}
          className={cn(
            'ml-auto grid h-9 w-9 place-items-center rounded-lg border border-line transition',
            saved ? 'bg-accent-soft text-accent-ink' : 'bg-surface text-muted hover:text-ink',
          )}
        >
          {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
        </button>
        {onDismiss ? (
          <button
            type="button"
            onClick={onDismiss}
            aria-label={`Dismiss ${member.name} from recommendations`}
            className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-surface text-muted transition hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
        {connected ? (
          <button
            type="button"
            onClick={onToggleConnect}
            aria-label={`Remove ${member.name} from connections`}
            className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-surface text-muted transition hover:text-[#B4443A]"
          >
            <UserMinus className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </Card>
  )
}

export function MemberRow({
  member,
  match,
  connected,
  onOpen,
  onToggleConnect,
}: {
  member: CommunityMember
  match?: MatchResult
  connected: boolean
  onOpen: () => void
  onToggleConnect: () => void
}) {
  return (
    <Card as="article" className="flex items-center gap-3 p-3 transition hover:shadow-lift">
      <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-3 text-left">
        <Avatar name={member.name} avatarId={member.avatarId} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-[14px] font-bold text-ink">{member.name}</p>
          <p className="truncate text-[12.5px] text-muted">
            {member.community} · {member.teachSkills[0] ?? member.interests[0]}
          </p>
        </div>
      </button>
      {match ? <MatchRing score={match.score} size={40} /> : null}
      <Button
        size="sm"
        variant={connected ? 'soft' : 'secondary'}
        onClick={onToggleConnect}
        icon={connected ? <Check className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
      >
        <span className="hidden sm:inline">{connected ? 'Connected' : 'Add'}</span>
      </Button>
    </Card>
  )
}
