import { MapPin } from 'lucide-react'
import { useCommunities } from '../hooks'
import { cn } from '../utils/helpers'

export function CommunitySelector({
  className,
  label = 'Community',
  compact = false,
}: {
  className?: string
  label?: string
  compact?: boolean
}) {
  const { communities, active, setActiveCommunity } = useCommunities()
  const id = 'community-selector'

  return (
    <div className={cn(compact ? 'flex items-center gap-2' : 'space-y-1.5', className)}>
      <label htmlFor={id} className={cn('flex items-center gap-1.5 text-[12.5px] font-semibold text-muted', compact && 'sr-only')}>
        <MapPin className="h-3.5 w-3.5" aria-hidden />
        {label}
      </label>
      <select
        id={id}
        value={active.name}
        onChange={(e) => setActiveCommunity(e.target.value)}
        className={cn(
          'ml-input cursor-pointer text-[13.5px] font-semibold',
          compact && 'h-9 w-auto max-w-[13rem] py-0 text-[12.5px]',
        )}
      >
        {communities.map((c) => (
          <option key={c.id} value={c.name}>
            {c.name}
          </option>
        ))}
      </select>
      {!compact ? <p className="text-[12px] leading-snug text-muted">{active.blurb}</p> : null}
    </div>
  )
}
