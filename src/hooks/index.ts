import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useMilaapContext } from '../context/AppContext'
import { COMMUNITIES } from '../data/seed'

/** Primary hook for every page — thin wrapper over the context. */
export function useMilaap() {
  return useMilaapContext()
}

export function useToast() {
  const { toast } = useMilaapContext()
  return toast
}

/** Debounce any value — used by the global search + filter fields. */
export function useDebouncedValue<T>(value: T, delay = 200): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(id)
  }, [value, delay])
  return debounced
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches,
  )
  useEffect(() => {
    const mql = window.matchMedia(query)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    setMatches(mql.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [query])
  return matches
}

export function useDocumentTitle(title: string) {
  useEffect(() => {
    const previous = document.title
    document.title = title ? `${title} · Milaap` : 'Milaap — Small connections. Real belonging.'
    return () => {
      document.title = previous
    }
  }, [title])
}

/** Persisted "recent searches" list for the global search overlay. */
export function useRecentSearches(key = 'milaap:recent-searches') {
  const [items, setItems] = useState<string[]>(() => {
    try {
      const raw = window.localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as string[]).slice(0, 5) : []
    } catch {
      return []
    }
  })

  const persist = useCallback(
    (next: string[]) => {
      setItems(next)
      try {
        window.localStorage.setItem(key, JSON.stringify(next))
      } catch {
        /* ignore */
      }
    },
    [key],
  )

  const push = useCallback(
    (term: string) => {
      const clean = term.trim()
      if (clean.length < 2) return
      persist([clean, ...items.filter((i) => i.toLowerCase() !== clean.toLowerCase())].slice(0, 5))
    },
    [items, persist],
  )

  const clear = useCallback(() => persist([]), [persist])

  return { items, push, clear }
}

/** Focus trap + Escape handling shared by every dialog in the app. */
export function useDialogA11y(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    const node = ref.current
    const focusable = () =>
      node
        ? Array.from(
            node.querySelectorAll<HTMLElement>(
              'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
            ),
          ).filter((el) => el.offsetParent !== null)
        : []

    const first = focusable()[0]
    first?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      const items = focusable()
      if (items.length === 0) return
      const firstEl = items[0]
      const lastEl = items[items.length - 1]
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault()
        lastEl.focus()
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault()
        firstEl.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = overflow
      previouslyFocused?.focus?.()
    }
  }, [open, onClose])

  return ref
}

/** Community list + the currently active community, with a safe fallback. */
export function useCommunities() {
  const { activeCommunity, setActiveCommunity } = useMilaapContext()
  const communities = useMemo(() => COMMUNITIES, [])
  const active = useMemo(
    () => communities.find((c) => c.name === activeCommunity) ?? communities[0],
    [communities, activeCommunity],
  )
  return { communities, active, setActiveCommunity }
}
