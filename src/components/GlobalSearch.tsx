import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock3, Compass, LayoutGrid, Repeat2, Search, Trash2, UsersRound, X } from 'lucide-react'
import { useMilaap, useRecentSearches } from '../hooks'
import { SearchInput } from './ui/SearchInput'
import { Avatar, Badge, EmptyState } from './ui/primitives'
import { ActivityIcon, SkillIcon } from './ui/CategoryIcon'
import { cn, percent } from '../utils/helpers'

interface ResultItem {
  id: string
  group: 'People' | 'Skills' | 'Activities' | 'Challenges'
  title: string
  subtitle: string
  href: string
  score: number
  icon: React.ReactNode
}

export function GlobalSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const { members, skillListings, activities, challenges, memberById, matchFor, isConnected } = useMilaap()
  const { items: recent, push: pushRecent, clear: clearRecent } = useRecentSearches()
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) {
      setQuery('')
      return
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const index = useMemo<ResultItem[]>(() => {
    const people: ResultItem[] = members.map((m) => {
      const match = matchFor(m.id)
      return {
        id: m.id,
        group: 'People',
        title: m.name,
        subtitle: `${m.community} · ${[...m.interests, ...m.teachSkills].slice(0, 3).join(', ')}`,
        href: `/discover?focus=${m.id}`,
        score: match?.score ?? 0,
        icon: <Avatar name={m.name} avatarId={m.avatarId} size="xs" />,
      }
    })

    const skills: ResultItem[] = skillListings.map((s) => {
      const owner = s.memberId === 'me' ? null : memberById(s.memberId)
      return {
        id: s.id,
        group: 'Skills',
        title: s.skill,
        subtitle: `${s.type === 'offer' ? 'Can teach' : 'Wants to learn'} · ${owner?.name ?? 'You'} · ${s.category}`,
        href: `/skills?focus=${s.id}`,
        score: 0,
        icon: (
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent-soft text-accent-ink">
            <SkillIcon category={s.category} className="h-4 w-4" />
          </span>
        ),
      }
    })

    const acts: ResultItem[] = activities.map((a) => ({
      id: a.id,
      group: 'Activities',
      title: a.title,
      subtitle: `${a.category} · ${a.community}`,
      href: `/activities?focus=${a.id}`,
      score: 0,
      icon: (
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent-soft text-accent-ink">
          <ActivityIcon category={a.category} className="h-4 w-4" />
        </span>
      ),
    }))

    const chals: ResultItem[] = challenges.map((c) => ({
      id: c.id,
      group: 'Challenges',
      title: c.title,
      subtitle: `${c.community} · ${percent(c.tasks.filter((t) => t.done).length, c.tasks.length || 1)}% complete`,
      href: `/community?challenge=${c.id}`,
      score: 0,
      icon: (
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent-soft text-accent-ink">
          <UsersRound className="h-4 w-4" />
        </span>
      ),
    }))

    return [...people, ...skills, ...acts, ...chals]
  }, [members, skillListings, activities, challenges, memberById, matchFor])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q.length < 1) return []
    return index
      .map((item) => {
        const haystack = `${item.title} ${item.subtitle} ${item.group}`.toLowerCase()
        let score = 0
        if (item.title.toLowerCase() === q) score += 60
        if (item.title.toLowerCase().startsWith(q)) score += 30
        if (item.title.toLowerCase().includes(q)) score += 18
        if (haystack.includes(q)) score += 8
        return { item, score }
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title))
      .slice(0, 24)
      .map((r) => r.item)
  }, [index, query])

  const grouped = useMemo(() => {
    const order: ResultItem['group'][] = ['People', 'Skills', 'Activities', 'Challenges']
    return order
      .map((group) => ({ group, items: results.filter((r) => r.group === group) }))
      .filter((g) => g.items.length > 0)
  }, [results])

  const go = (href: string) => {
    pushRecent(query)
    navigate(href)
    onClose()
  }

  useEffect(() => {
    if (open) {
      const raf = window.requestAnimationFrame(() => {
        containerRef.current?.querySelector('input')?.focus()
      })
      return () => window.cancelAnimationFrame(raf)
    }
    return undefined
  }, [open])

  if (!open) return null

  const groupIcons = {
    People: Compass,
    Skills: Repeat2,
    Activities: LayoutGrid,
    Challenges: UsersRound,
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center px-3 pt-[8vh] sm:px-4">
      <div className="absolute inset-0 animate-fade-in bg-[#20241F]/55 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Search Milaap"
        className="relative w-full max-w-2xl animate-pop-in overflow-hidden rounded-2xl border border-line bg-surface shadow-lift"
      >
        <div className="flex items-center gap-2 border-b border-line p-3">
          <SearchInput
            value={query}
            onChange={setQuery}
            label="Search people, skills, activities and challenges"
            placeholder="Search people, skills, activities, challenges…"
            autoFocus
            className="flex-1"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-muted transition hover:bg-surface2 hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="ml-scroll max-h-[60vh] overflow-y-auto p-3">
          {query.trim().length === 0 ? (
            <div>
              {recent.length > 0 ? (
                <div className="mb-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-muted">
                      <Clock3 className="h-3.5 w-3.5" aria-hidden /> Recent searches
                    </h3>
                    <button
                      type="button"
                      onClick={clearRecent}
                      className="flex items-center gap-1 text-[12px] font-semibold text-muted transition hover:text-ink"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden /> Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recent.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setQuery(r)}
                        className="rounded-full border border-line bg-surface2 px-3 py-1.5 text-[12.5px] font-medium text-ink transition hover:border-accent/60"
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              <h3 className="mb-2 text-[12px] font-bold uppercase tracking-wide text-muted">Try searching for</h3>
              <div className="flex flex-wrap gap-2">
                {['Photography', 'Cooking', 'Clean-up', 'Video calling', 'Spoken English', 'Board games'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setQuery(s)}
                    className="rounded-full border border-line bg-surface px-3 py-1.5 text-[12.5px] font-medium text-muted transition hover:border-accent/60 hover:text-ink"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <p className="mt-4 text-[12.5px] leading-relaxed text-muted">
                Search covers demonstration profiles and locally created content only. Tip: press{' '}
                <kbd className="rounded border border-line bg-surface2 px-1.5 py-0.5 text-[11px] font-semibold">Ctrl</kbd> +{' '}
                <kbd className="rounded border border-line bg-surface2 px-1.5 py-0.5 text-[11px] font-semibold">K</kbd> anywhere
                in Milaap.
              </p>
            </div>
          ) : groupBy(results).length === 0 ? (
            <EmptyState
              icon={<Search className="h-6 w-6" />}
              title={`No results for “${query}”`}
              description="Try a different word, or browse Discover People, Activities and Skill Exchange directly."
            />
          ) : (
            <div className="space-y-4">
              {grouped.map((group) => {
                const Icon = groupIcons[group.group]
                return (
                  <section key={group.group}>
                    <h3 className="mb-2 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-muted">
                      <Icon className="h-3.5 w-3.5" aria-hidden /> {group.group}
                      <Badge tone="outline">{group.items.length}</Badge>
                    </h3>
                    <ul className="space-y-1.5">
                      {group.items.map((item) => (
                        <li key={`${item.group}-${item.id}`}>
                          <button
                            type="button"
                            onClick={() => go(item.href)}
                            className={cn(
                              'flex w-full items-center gap-3 rounded-xl border border-transparent px-2.5 py-2 text-left transition',
                              'hover:border-line hover:bg-surface2/70',
                            )}
                          >
                            {item.icon}
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[13.5px] font-semibold text-ink">{item.title}</span>
                              <span className="block truncate text-[12px] text-muted">{item.subtitle}</span>
                            </span>
                            {item.group === 'People' && item.score > 0 ? (
                              <span className="shrink-0 text-[12px] font-bold text-accent-ink">{item.score}%</span>
                            ) : null}
                            {item.group === 'People' && isConnected(item.id) ? (
                              <Badge tone="sage">Connected</Badge>
                            ) : null}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </section>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-line bg-surface2/60 px-4 py-2.5 text-[11.5px] text-muted">
          <span>Search is local to this browser — no query leaves this device.</span>
          <button type="button" onClick={() => setQuery('')} className="font-semibold transition hover:text-ink">
            Clear search
          </button>
        </div>
      </div>
    </div>
  )
}

function groupBy(items: ResultItem[]): ResultItem['group'][] {
  return Array.from(new Set(items.map((i) => i.group)))
}
