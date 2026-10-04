import type { ReactNode } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '../ui/primitives'
import { cn } from '../../utils/helpers'

export function StatCard({
  label,
  value,
  hint,
  icon,
  to,
  tone = 'sage',
  className,
}: {
  label: string
  value: ReactNode
  hint?: string
  icon?: ReactNode
  to?: string
  tone?: 'sage' | 'neutral'
  className?: string
}) {
  const body = (
    <Card
      className={cn(
        'h-full p-4 transition',
        to && 'hover:shadow-lift focus-within:shadow-lift',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[12.5px] font-semibold uppercase tracking-wide text-muted">{label}</p>
          <p className="mt-1.5 text-2xl font-extrabold leading-none text-ink">{value}</p>
          {hint ? <p className="mt-1.5 text-[12.5px] leading-snug text-muted">{hint}</p> : null}
        </div>
        {icon ? (
          <span
            className={cn(
              'grid h-9 w-9 shrink-0 place-items-center rounded-xl',
              tone === 'sage' ? 'bg-accent-soft text-accent-ink' : 'bg-surface2 text-muted',
            )}
          >
            {icon}
          </span>
        ) : null}
      </div>
    </Card>
  )

  if (to) {
    return (
      <Link to={to} className="block h-full rounded-2xl">
        <span className="sr-only">Go to {label}</span>
        {body}
      </Link>
    )
  }
  return body
}

export function InfoRow({
  label,
  value,
  action,
}: {
  label: string
  value: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-line py-2.5 last:border-0">
      <span className="text-[13px] text-muted">{label}</span>
      <span className="flex items-center gap-2 text-right text-[13px] font-semibold text-ink">
        {value}
        {action}
      </span>
    </div>
  )
}

export function QuickLinkCard({
  to,
  title,
  description,
  icon,
}: {
  to: string
  title: string
  description: string
  icon: ReactNode
}) {
  return (
    <Link
      to={to}
      className="group flex items-start gap-3 rounded-2xl border border-line bg-surface p-4 transition hover:border-accent/50 hover:shadow-lift"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-ink">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1 text-[14px] font-bold text-ink">
          {title}
          <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" aria-hidden />
        </span>
        <span className="mt-0.5 block text-[12.5px] leading-snug text-muted">{description}</span>
      </span>
    </Link>
  )
}
