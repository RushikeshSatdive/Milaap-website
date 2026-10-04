export type ClassValue = string | number | false | null | undefined

/** Tiny classname joiner — keeps components readable without extra deps. */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ')
}

const AVATAR_PALETTE = [
  { from: '#7B8F42', to: '#5F7031', ring: 'rgba(123,143,66,.35)' },
  { from: '#B07B4F', to: '#8A5C36', ring: 'rgba(176,123,79,.35)' },
  { from: '#5F7E8C', to: '#43606D', ring: 'rgba(95,126,140,.35)' },
  { from: '#8A6E9E', to: '#6A5180', ring: 'rgba(138,110,158,.35)' },
  { from: '#A8763F', to: '#7E5729', ring: 'rgba(168,118,63,.35)' },
  { from: '#4E8A70', to: '#376954', ring: 'rgba(78,138,112,.35)' },
]

export function avatarPalette(avatarId: string) {
  let hash = 0
  for (let i = 0; i < avatarId.length; i += 1) {
    hash = (hash * 31 + avatarId.charCodeAt(i)) % 9973
  }
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length]
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

/** "1 activity" / "2 activities" — handles the common y → ies plural too. */
export function pluralise(count: number, singular: string, plural?: string): string {
  if (count === 1) return `${count} ${singular}`
  const fallback = singular.endsWith('y')
    ? `${singular.slice(0, -1)}ies`
    : singular.endsWith('s')
      ? singular
      : `${singular}s`
  return `${count} ${plural ?? fallback}`
}

export function titleCase(value: string): string {
  return value.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
}

export function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items))
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function uid(prefix = 'id'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

export function percent(part: number, total: number): number {
  if (total <= 0) return 0
  return Math.round((part / total) * 100)
}
