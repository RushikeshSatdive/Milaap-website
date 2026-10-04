import type { ReactNode } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '../../utils/helpers'

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  label,
  className,
  autoFocus,
  onClear,
  id,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label: string
  className?: string
  autoFocus?: boolean
  onClear?: () => void
  id?: string
}) {
  return (
    <div className={cn('relative', className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
      <input
        id={id}
        type="search"
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="ml-input pl-10 pr-10 [&::-webkit-search-cancel-button]:appearance-none"
      />
      {value ? (
        <button
          type="button"
          onClick={() => {
            onChange('')
            onClear?.()
          }}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-muted transition hover:bg-surface2 hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  )
}

export function FilterBar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)} role="group" aria-label="Filters">
      {children}
    </div>
  )
}

export function SelectFilter({
  label,
  value,
  onChange,
  options,
  allLabel = 'All',
  className,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: string[]
  allLabel?: string
  className?: string
}) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <label className="sr-only" htmlFor={`filter-${label.replace(/\s+/g, '-').toLowerCase()}`}>
        {label}
      </label>
      <select
        id={`filter-${label.replace(/\s+/g, '-').toLowerCase()}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="ml-input h-10 w-full min-w-[9.5rem] cursor-pointer py-0 text-[13px] font-medium"
      >
        <option value="">{allLabel}: {label}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  )
}
