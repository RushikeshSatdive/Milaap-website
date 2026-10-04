import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { cn } from '../../utils/helpers'

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  backTo,
  backLabel = 'Back',
  className,
}: {
  eyebrow?: React.ReactNode
  title: string
  description?: React.ReactNode
  actions?: React.ReactNode
  backTo?: string
  backLabel?: string
  className?: string
}) {
  return (
    <header className={cn('mb-5', className)}>
      {backTo ? (
        <Link
          to={backTo}
          className="mb-2 inline-flex items-center gap-1 text-[13px] font-semibold text-muted transition hover:text-ink"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden /> {backLabel}
        </Link>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {eyebrow ? <div className="mb-1.5 flex flex-wrap items-center gap-2">{eyebrow}</div> : null}
          <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-[28px]">{title}</h1>
          {description ? (
            <div className="mt-1.5 max-w-2xl text-[14px] leading-relaxed text-muted">{description}</div>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  )
}
