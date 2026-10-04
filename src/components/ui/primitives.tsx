import React from 'react'
import { Loader2, Inbox } from 'lucide-react'
import { cn } from '../../utils/helpers'

/* ------------------------------- Button ------------------------------ */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'soft'
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: React.ReactNode
  fullWidth?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-white hover:bg-accent-hover active:bg-accent-hover shadow-soft disabled:bg-accent/60 dark:text-[#171a13]',
  secondary:
    'border border-line bg-surface text-ink hover:bg-surface2 active:bg-surface2 disabled:opacity-60',
  soft: 'bg-accent-soft text-accent-ink hover:brightness-[0.97] active:brightness-[0.94] disabled:opacity-60',
  ghost: 'text-ink hover:bg-surface2 active:bg-surface2 disabled:opacity-50',
  danger: 'bg-[#B4443A] text-white hover:bg-[#9d382f] active:bg-[#8f3229] disabled:opacity-60',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-[13px] gap-1.5 rounded-lg',
  md: 'h-11 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-5 text-[15px] gap-2 rounded-xl',
  icon: 'h-10 w-10 rounded-xl justify-center',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, icon, fullWidth, className, children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center font-semibold transition-colors duration-150 select-none',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        'disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : icon}
      {children}
    </button>
  )
})

/* -------------------------------- Card ------------------------------- */

export function Card({
  className,
  children,
  as = 'div',
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { as?: 'div' | 'section' | 'article' | 'li' }) {
  // Rendered through createElement so the polymorphic tag keeps working while
  // callers still get the div-based prop types they expect.
  return React.createElement(as, { className: cn('ml-card', className), ...rest } as React.HTMLAttributes<HTMLElement>, children)
}

export function CardHeader({
  title,
  subtitle,
  icon,
  action,
  className,
}: {
  title: React.ReactNode
  subtitle?: React.ReactNode
  icon?: React.ReactNode
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-start justify-between gap-3 p-5 pb-3', className)}>
      <div className="flex min-w-0 items-start gap-3">
        {icon ? (
          <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-ink">
            {icon}
          </span>
        ) : null}
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold leading-snug text-ink">{title}</h3>
          {subtitle ? <p className="mt-0.5 text-[13px] leading-snug text-muted">{subtitle}</p> : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

/* -------------------------------- Badge ------------------------------ */

type BadgeTone = 'sage' | 'neutral' | 'amber' | 'blue' | 'rose' | 'outline'

const badgeTones: Record<BadgeTone, string> = {
  sage: 'bg-accent-soft text-accent-ink border-transparent',
  neutral: 'bg-surface2 text-muted border-line',
  amber: 'bg-[#FBF1DC] text-[#8A6112] border-[#F0DFBB] dark:bg-[#33291577] dark:text-[#E7C87E] dark:border-[#4a3c1c]',
  blue: 'bg-[#E6EEF6] text-[#2F5675] border-[#D2E1EF] dark:bg-[#1d2935] dark:text-[#9EC4E0] dark:border-[#2b3d4d]',
  rose: 'bg-[#FBE9E7] text-[#8E3B31] border-[#F3D5D0] dark:bg-[#33211e] dark:text-[#E4A79E] dark:border-[#4a2e29]',
  outline: 'bg-transparent text-muted border-line',
}

export function Badge({
  tone = 'neutral',
  children,
  className,
  icon,
}: {
  tone?: BadgeTone
  children: React.ReactNode
  className?: string
  icon?: React.ReactNode
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-[3px] text-[11.5px] font-semibold leading-tight',
        badgeTones[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  )
}

/* -------------------------------- Chip ------------------------------- */

export function Chip({
  children,
  onRemove,
  onClick,
  active,
  className,
  title,
}: {
  children: React.ReactNode
  onRemove?: () => void
  onClick?: () => void
  active?: boolean
  className?: string
  title?: string
}) {
  const base =
    'inline-flex max-w-full items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition'
  if (onClick) {
    return (
      <button
        type="button"
        title={title}
        onClick={onClick}
        aria-pressed={active}
        className={cn(
          base,
          active
            ? 'border-accent bg-accent-soft text-accent-ink'
            : 'border-line bg-surface text-muted hover:border-accent/60 hover:text-ink',
          className,
        )}
      >
        {children}
      </button>
    )
  }
  return (
    <span className={cn(base, 'border-line bg-surface2 text-ink', className)} title={title}>
      <span className="truncate">{children}</span>
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${typeof children === 'string' ? children : 'item'}`}
          className="-mr-1 grid h-5 w-5 shrink-0 place-items-center rounded-full text-muted transition hover:bg-line hover:text-ink"
        >
          ×
        </button>
      ) : null}
    </span>
  )
}

/* ------------------------------- Progress ---------------------------- */

export function ProgressBar({
  value,
  label,
  hint,
  tone = 'sage',
  className,
}: {
  value: number
  label?: string
  hint?: string
  tone?: 'sage' | 'amber'
  className?: string
}) {
  const pct = Math.max(0, Math.min(100, Math.round(value)))
  return (
    <div className={className}>
      {label || hint ? (
        <div className="mb-1.5 flex items-baseline justify-between gap-2">
          {label ? <span className="text-[13px] font-semibold text-ink">{label}</span> : null}
          {hint ? <span className="text-[12px] text-muted">{hint}</span> : null}
        </div>
      ) : null}
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-surface2"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? 'Progress'}
      >
        <div
          className={cn('h-full rounded-full transition-all duration-500', tone === 'sage' ? 'bg-accent' : 'bg-[#C9952F]')}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

/* -------------------------------- Avatar ----------------------------- */

import { avatarPalette, initials } from '../../utils/helpers'

const sizeMap = {
  xs: 'h-8 w-8 text-[11px]',
  sm: 'h-10 w-10 text-xs',
  md: 'h-12 w-12 text-sm',
  lg: 'h-16 w-16 text-lg',
  xl: 'h-24 w-24 text-2xl',
} as const

export function Avatar({
  name,
  avatarId,
  size = 'md',
  className,
  ring,
}: {
  name: string
  avatarId: string
  size?: keyof typeof sizeMap
  className?: string
  ring?: boolean
}) {
  const palette = avatarPalette(avatarId || name)
  return (
    <span
      aria-hidden
      className={cn(
        'grid shrink-0 select-none place-items-center rounded-full font-bold text-white',
        ring && 'ring-2 ring-surface',
        sizeMap[size],
        className,
      )}
      style={{ backgroundImage: `linear-gradient(140deg, ${palette.from}, ${palette.to})` }}
    >
      {initials(name)}
    </span>
  )
}

/* ------------------------------ Empty state -------------------------- */

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-surface/60 px-6 py-14 text-center',
        className,
      )}
    >
      <span className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-accent-soft text-accent-ink">
        {icon ?? <Inbox className="h-6 w-6" />}
      </span>
      <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
      {description ? <p className="mt-1.5 max-w-sm text-[13.5px] leading-relaxed text-muted">{description}</p> : null}
      {action ? <div className="mt-5 flex flex-wrap items-center justify-center gap-2">{action}</div> : null}
    </div>
  )
}

/* -------------------------------- Skeleton --------------------------- */

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-xl bg-surface2', className)} aria-hidden />
}

export function PageSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-live="polite">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-4 w-80" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
      <Skeleton className="h-56" />
      <span className="sr-only">Loading your Milaap data from this browser…</span>
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="rounded-2xl border border-[#F3D5D0] bg-[#FBE9E7] p-5 text-[#8E3B31] dark:border-[#4a2e29] dark:bg-[#33211e] dark:text-[#E4A79E]">
      <h2 className="text-[15px] font-semibold">Something went wrong loading your local data</h2>
      <p className="mt-1 text-[13.5px]">{message}</p>
      {onRetry ? (
        <Button variant="secondary" size="sm" className="mt-3" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  )
}

/* ------------------------------ Section ------------------------------ */

export function SectionHeading({
  title,
  subtitle,
  action,
  className,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('mb-3 flex flex-wrap items-end justify-between gap-3', className)}>
      <div>
        <h2 className="text-[17px] font-bold tracking-tight text-ink">{title}</h2>
        {subtitle ? <p className="mt-0.5 text-[13px] text-muted">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  )
}

export function Notice({
  tone = 'info',
  icon,
  title,
  children,
  className,
}: {
  tone?: 'info' | 'warning' | 'success'
  icon?: React.ReactNode
  title?: string
  children: React.ReactNode
  className?: string
}) {
  const tones = {
    info: 'bg-accent-soft/70 border-accent/25 text-accent-ink',
    warning: 'bg-[#FBF1DC] border-[#F0DFBB] text-[#8A6112] dark:bg-[#33291577] dark:border-[#4a3c1c] dark:text-[#E7C87E]',
    success: 'bg-[#EAF3E5] border-[#CFE3C4] text-[#3F6329] dark:bg-[#1e2a19] dark:border-[#33462a] dark:text-[#B4D69C]',
  }
  return (
    <div className={cn('rounded-xl border p-3.5 text-[13px] leading-relaxed', tones[tone], className)}>
      <div className="flex gap-2.5">
        {icon ? <span className="mt-0.5 shrink-0">{icon}</span> : null}
        <div>
          {title ? <p className="font-semibold">{title}</p> : null}
          <div className={title ? 'mt-0.5' : undefined}>{children}</div>
        </div>
      </div>
    </div>
  )
}

export function VisuallyHidden({ children }: { children: React.ReactNode }) {
  return <span className="sr-only">{children}</span>
}
