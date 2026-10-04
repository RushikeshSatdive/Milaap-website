/* Date + time helpers used across Milaap. All dates are local-browser dates. */

export const MS_DAY = 86_400_000

export function startOfDay(d: Date = new Date()): Date {
  const copy = new Date(d)
  copy.setHours(0, 0, 0, 0)
  return copy
}

export function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Parses yyyy-mm-dd as a *local* date (avoids the UTC off-by-one of new Date(string)). */
export function parseISODate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const [, y, m, d] = match
  const date = new Date(Number(y), Number(m) - 1, Number(d))
  if (date.getFullYear() !== Number(y) || date.getMonth() !== Number(m) - 1 || date.getDate() !== Number(d)) {
    return null
  }
  return date
}

export function todayISO(): string {
  return toISODate(new Date())
}

/** ISO date-time `n` days from now at a given HH:mm — keeps seeds always-fresh. */
export function daysFromNow(days: number, time = '18:00'): string {
  const d = startOfDay()
  d.setDate(d.getDate() + days)
  const [h, m] = time.split(':').map(Number)
  d.setHours(h || 0, m || 0, 0, 0)
  return d.toISOString()
}

export function daysFromNowISO(days: number): string {
  const d = startOfDay()
  d.setDate(d.getDate() + days)
  return toISODate(d)
}

export function formatDate(input: string | Date, opts?: Intl.DateTimeFormatOptions): string {
  const date = typeof input === 'string' ? new Date(input) : input
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-IN', opts ?? { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatDayLabel(value: string): string {
  const date = parseISODate(value)
  if (!date) return '—'
  const today = startOfDay()
  const diff = Math.round((startOfDay(date).getTime() - today.getTime()) / MS_DAY)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  return formatDate(date, { weekday: 'short', day: 'numeric', month: 'short' })
}

export function formatShortDay(value: string): string {
  const date = parseISODate(value)
  if (!date) return '—'
  return formatDate(date, { weekday: 'long', day: 'numeric', month: 'long' })
}

/** 24h "18:30" → "6:30 PM" */
export function formatTime24(time: string): string {
  const [hRaw, mRaw] = time.split(':')
  const h = Number(hRaw)
  const m = Number(mRaw ?? 0)
  if (Number.isNaN(h)) return time
  const suffix = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}:${`${m || 0}`.padStart(2, '0')} ${suffix}`
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return `${formatDate(d, { weekday: 'short', day: 'numeric', month: 'short' })} · ${d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}`
}

export function humanDuration(mins: number): string {
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m === 0 ? `${h} hr${h > 1 ? 's' : ''}` : `${h} hr ${m} min`
}

export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const diff = Date.now() - then
  const mins = Math.round(diff / 60000)
  if (Math.abs(mins) < 1) return 'just now'
  if (Math.abs(mins) < 60) return mins > 0 ? `${mins} min ago` : `in ${Math.abs(mins)} min`
  const hours = Math.round(mins / 60)
  if (Math.abs(hours) < 24) return hours > 0 ? `${hours} hr ago` : `in ${Math.abs(hours)} hr`
  const days = Math.round(hours / 24)
  if (Math.abs(days) < 30) return days > 0 ? `${days} day${days > 1 ? 's' : ''} ago` : `in ${Math.abs(days)} day${Math.abs(days) > 1 ? 's' : ''}`
  return formatDate(iso)
}

export function isPastISO(iso: string): boolean {
  const t = new Date(iso).getTime()
  return !Number.isNaN(t) && t < Date.now()
}

export function isToday(value: string): boolean {
  const d = parseISODate(value)
  if (!d) return false
  return toISODate(d) === toISODate(new Date())
}

export function daysUntil(value: string): number {
  const d = parseISODate(value)
  if (!d) return Number.POSITIVE_INFINITY
  return Math.round((startOfDay(d).getTime() - startOfDay().getTime()) / MS_DAY)
}

/** Combined sortable timestamp for an invitation (local date + time). */
export function invitationTimestamp(date: string, time: string): number {
  const d = parseISODate(date)
  if (!d) return Number.POSITIVE_INFINITY
  const [h, m] = time.split(':').map(Number)
  d.setHours(h || 0, m || 0, 0, 0)
  return d.getTime()
}

export function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(':').map(Number)
  const total = (h || 0) * 60 + (m || 0) + mins
  const hh = `${Math.floor((total % 1440) / 60)}`.padStart(2, '0')
  const mm = `${total % 60}`.padStart(2, '0')
  return `${hh}:${mm}`
}
