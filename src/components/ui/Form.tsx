import React, { useId, useState } from 'react'
import { AlertCircle, Check, Plus } from 'lucide-react'
import { cn } from '../../utils/helpers'

export function FieldError({ children, id }: { children?: string; id?: string }) {
  if (!children) return null
  return (
    <p id={id} role="alert" className="mt-1.5 flex items-start gap-1.5 text-[12.5px] font-medium text-[#B4443A] dark:text-[#E4A79E]">
      <AlertCircle className="mt-[2px] h-3.5 w-3.5 shrink-0" aria-hidden />
      <span>{children}</span>
    </p>
  )
}

interface BaseFieldProps {
  label: string
  error?: string
  hint?: string
  required?: boolean
  className?: string
}

/* -------------------------------- Input ------------------------------ */

export interface TextFieldProps extends BaseFieldProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: 'text' | 'date' | 'time' | 'number' | 'search'
  min?: string | number
  max?: string | number
  step?: number
  autoFocus?: boolean
  icon?: React.ReactNode
  name?: string
  disabled?: boolean
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>
}

export function TextField({
  label,
  error,
  hint,
  required,
  className,
  value,
  onChange,
  icon,
  id,
  ...rest
}: TextFieldProps & { id?: string }) {
  const autoId = useId()
  const fieldId = id ?? autoId
  const describedBy = [error ? `${fieldId}-error` : null, hint ? `${fieldId}-hint` : null].filter(Boolean).join(' ') || undefined

  return (
    <div className={className}>
      <label htmlFor={fieldId} className="ml-label">
        {label} {required ? <span className="text-[#B4443A] dark:text-[#E4A79E]">*</span> : null}
      </label>
      <div className="relative">
        {icon ? <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">{icon}</span> : null}
        <input
          id={fieldId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          aria-required={required}
          className={cn('ml-input', icon && 'pl-10', error && 'border-[#B4443A] focus:ring-[#B4443A]/20 dark:border-[#E4A79E]')}
          {...rest}
        />
      </div>
      {hint ? <p id={`${fieldId}-hint`} className="ml-hint">{hint}</p> : null}
      <FieldError id={`${fieldId}-error`}>{error}</FieldError>
    </div>
  )
}

/* ------------------------------ Textarea ----------------------------- */

export function TextArea({
  label,
  error,
  hint,
  required,
  className,
  value,
  onChange,
  rows = 4,
  maxLength,
  id,
  placeholder,
}: BaseFieldProps & {
  value: string
  onChange: (value: string) => void
  rows?: number
  maxLength?: number
  id?: string
  placeholder?: string
}) {
  const autoId = useId()
  const fieldId = id ?? autoId
  return (
    <div className={className}>
      <div className="flex items-baseline justify-between">
        <label htmlFor={fieldId} className="ml-label">
          {label} {required ? <span className="text-[#B4443A] dark:text-[#E4A79E]">*</span> : null}
        </label>
        {maxLength ? (
          <span className={cn('text-[11.5px]', value.length > maxLength ? 'text-[#B4443A]' : 'text-muted')}>
            {value.length}/{maxLength}
          </span>
        ) : null}
      </div>
      <textarea
        id={fieldId}
        rows={rows}
        value={value}
        maxLength={maxLength ? maxLength + 40 : undefined}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
        className={cn('ml-input resize-y', error && 'border-[#B4443A] dark:border-[#E4A79E]')}
      />
      {hint ? <p className="ml-hint">{hint}</p> : null}
      <FieldError id={`${fieldId}-error`}>{error}</FieldError>
    </div>
  )
}

/* ------------------------------- Select ------------------------------ */

export function SelectField({
  label,
  error,
  hint,
  required,
  className,
  value,
  onChange,
  options,
  id,
  placeholder,
}: BaseFieldProps & {
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string; disabled?: boolean }>
  id?: string
  placeholder?: string
}) {
  const autoId = useId()
  const fieldId = id ?? autoId
  return (
    <div className={className}>
      <label htmlFor={fieldId} className="ml-label">
        {label} {required ? <span className="text-[#B4443A] dark:text-[#E4A79E]">*</span> : null}
      </label>
      <select
        id={fieldId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        className={cn('ml-input appearance-none bg-[length:1rem] pr-9', error && 'border-[#B4443A] dark:border-[#E4A79E]')}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236B7365' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 0.75rem center',
        }}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((o) => (
          <option key={o.value} value={o.value} disabled={o.disabled}>
            {o.label}
          </option>
        ))}
      </select>
      {hint ? <p className="ml-hint">{hint}</p> : null}
      <FieldError id={`${fieldId}-error`}>{error}</FieldError>
    </div>
  )
}

/* --------------------------- Toggle chip group ------------------------ */

export function ChipSelect({
  label,
  error,
  hint,
  className,
  options,
  selected,
  onChange,
  allowCustom,
  customPlaceholder = 'Type and press Enter',
  max,
}: {
  label: string
  error?: string
  hint?: string
  className?: string
  options: string[]
  selected: string[]
  onChange: (next: string[]) => void
  allowCustom?: boolean
  customPlaceholder?: string
  max?: number
}) {
  const [draft, setDraft] = useState('')

  const toggle = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((s) => s !== option))
    } else {
      if (max && selected.length >= max) return
      onChange([...selected, option])
    }
  }

  const addCustom = () => {
    const value = draft.trim()
    if (!value) return
    if (!selected.some((s) => s.toLowerCase() === value.toLowerCase())) {
      onChange([...selected, value])
    }
    setDraft('')
  }

  const extraSelected = selected.filter((s) => !options.includes(s))

  return (
    <fieldset className={className}>
      <legend className="ml-label">
        {label} {selected.length > 0 ? <span className="font-normal text-muted">({selected.length} selected)</span> : null}
      </legend>
      <div className="flex flex-wrap gap-2">
        {[...options, ...extraSelected].map((option) => {
          const active = selected.includes(option)
          return (
            <button
              key={option}
              type="button"
              aria-pressed={active}
              onClick={() => toggle(option)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition',
                active
                  ? 'border-accent bg-accent-soft text-accent-ink'
                  : 'border-line bg-surface text-muted hover:border-accent/60 hover:text-ink',
              )}
            >
              {active ? <Check className="h-3.5 w-3.5" aria-hidden /> : null}
              {option}
            </button>
          )
        })}
      </div>

      {allowCustom ? (
        <div className="mt-2.5 flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addCustom()
              }
            }}
            placeholder={customPlaceholder}
            aria-label={`Add your own to ${label}`}
            className="ml-input max-w-xs"
          />
          <button
            type="button"
            onClick={addCustom}
            className="inline-flex h-[42px] items-center gap-1.5 rounded-xl border border-line bg-surface px-3 text-[13px] font-semibold text-ink transition hover:bg-surface2"
          >
            <Plus className="h-4 w-4" aria-hidden /> Add
          </button>
        </div>
      ) : null}

      {hint ? <p className="ml-hint">{hint}</p> : null}
      <FieldError>{error}</FieldError>
    </fieldset>
  )
}

/* ------------------------------- Switch ------------------------------ */

export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
  id,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  label: string
  description?: string
  disabled?: boolean
  id?: string
}) {
  const autoId = useId()
  const switchId = id ?? autoId
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <div className="min-w-0">
        <label htmlFor={switchId} className={cn('block cursor-pointer text-[13.5px] font-semibold text-ink', disabled && 'cursor-not-allowed opacity-60')}>
          {label}
        </label>
        {description ? <p className="mt-0.5 text-[12.5px] leading-snug text-muted">{description}</p> : null}
      </div>
      <button
        id={switchId}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full border transition-colors',
          checked ? 'border-accent bg-accent' : 'border-line bg-surface2',
          disabled && 'cursor-not-allowed opacity-60',
        )}
      >
        <span
          className={cn(
            'absolute top-[3px] h-4 w-4 rounded-full bg-white shadow transition-all',
            checked ? 'left-[26px]' : 'left-[3px]',
          )}
        />
      </button>
    </div>
  )
}

/* --------------------------- Radio card group ------------------------ */

export function RadioCards<T extends string>({
  label,
  options,
  value,
  onChange,
  error,
  columns = 2,
}: {
  label: string
  options: Array<{ value: T; label: string; description?: string }>
  value: T
  onChange: (next: T) => void
  error?: string
  columns?: 1 | 2 | 3
}) {
  return (
    <fieldset>
      <legend className="ml-label">{label}</legend>
      <div className={cn('grid gap-2', columns === 1 && 'grid-cols-1', columns === 2 && 'sm:grid-cols-2', columns === 3 && 'sm:grid-cols-3')}>
        {options.map((o) => {
          const active = o.value === value
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(o.value)}
              aria-pressed={active}
              className={cn(
                'rounded-xl border p-3 text-left transition',
                active ? 'border-accent bg-accent-soft/70' : 'border-line bg-surface hover:border-accent/50',
              )}
            >
              <span className={cn('block text-[13.5px] font-semibold', active ? 'text-accent-ink' : 'text-ink')}>{o.label}</span>
              {o.description ? <span className="mt-0.5 block text-[12px] leading-snug text-muted">{o.description}</span> : null}
            </button>
          )
        })}
      </div>
      <FieldError>{error}</FieldError>
    </fieldset>
  )
}
