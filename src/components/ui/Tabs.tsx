import React from 'react'
import { cn } from '../../utils/helpers'

export interface TabOption {
  id: string
  label: string
  count?: number
}

export function Tabs({
  options,
  value,
  onChange,
  className,
  label = 'Sections',
}: {
  options: TabOption[]
  value: string
  onChange: (id: string) => void
  className?: string
  label?: string
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn('ml-scroll -mx-1 flex gap-1 overflow-x-auto rounded-2xl border border-line bg-surface p-1', className)}
    >
      {options.map((o) => {
        const active = o.id === value
        return (
          <button
            key={o.id}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(o.id)}
            className={cn(
              'flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-2 text-[13px] font-semibold transition',
              active ? 'bg-accent-soft text-accent-ink' : 'text-muted hover:bg-surface2 hover:text-ink',
            )}
          >
            {o.label}
            {typeof o.count === 'number' ? (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-[11px] font-bold',
                  active ? 'bg-accent text-white dark:text-[#171a13]' : 'bg-surface2 text-muted',
                )}
              >
                {o.count}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

export interface SegmentedOption<T extends string> {
  id: T
  label: string
  icon?: React.ReactNode
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: {
  options: SegmentedOption<T>[]
  value: T
  onChange: (id: T) => void
  label: string
  className?: string
}) {
  return (
    <div role="group" aria-label={label} className={cn('inline-flex rounded-xl border border-line bg-surface p-0.5', className)}>
      {options.map((o) => {
        const active = o.id === value
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.id)}
            title={o.label}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-[10px] px-3 py-1.5 text-[12.5px] font-semibold transition',
              active ? 'bg-accent-soft text-accent-ink' : 'text-muted hover:text-ink',
            )}
          >
            {o.icon}
            <span className={cn(o.icon && 'hidden sm:inline')}>{o.label}</span>
          </button>
        )
      })}
    </div>
  )
}
