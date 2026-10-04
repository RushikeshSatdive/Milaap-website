import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { useMilaap } from '../hooks'
import type { ActivityCategory } from '../types'
import { Badge, Button, Card, CardHeader, EmptyState } from './ui/primitives'
import { ActivityIcon } from './ui/CategoryIcon'
import { formatTime24, toISODate } from '../utils/date'
import { cn } from '../utils/helpers'

interface CalendarEvent {
  id: string
  title: string
  date: string
  time: string
  kind: 'activity' | 'invitation'
  category: string
  href: string
  place: string
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function CommunityCalendar({ community }: { community: string }) {
  const { activities, invitations, memberById, joinedActivityIds } = useMilaap()
  const [cursor, setCursor] = useState(() => {
    const d = new Date()
    return { year: d.getFullYear(), month: d.getMonth() }
  })
  const [selected, setSelected] = useState<string | null>(null)

  const events = useMemo<CalendarEvent[]>(() => {
    const fromActivities: CalendarEvent[] = activities
      .filter((a) => a.scheduledAt && a.community === community)
      .map((a) => {
        const d = new Date(a.scheduledAt as string)
        return {
          id: `a-${a.id}`,
          title: a.title,
          date: toISODate(d),
          time: `${`${d.getHours()}`.padStart(2, '0')}:${`${d.getMinutes()}`.padStart(2, '0')}`,
          kind: 'activity' as const,
          category: a.category,
          href: `/activities?focus=${a.id}`,
          place: a.place,
        }
      })

    const fromInvitations: CalendarEvent[] = invitations
      .filter((i) => i.status !== 'cancelled')
      .flatMap<CalendarEvent>((i) => {
        const member = memberById(i.memberId)
        const inCommunity = community === member?.community || community === 'Shivaji Nagar, Ahilyanagar'
        if (!inCommunity) return []
        return [
          {
            id: `i-${i.id}`,
            title: `${i.title} (with ${member?.name ?? 'a connection'})`,
            date: i.date,
            time: i.time,
            kind: 'invitation' as const,
            category: i.activityType,
            href: `/schedule?focus=${i.id}`,
            place: i.place,
          },
        ]
      })

    return [...fromActivities, ...fromInvitations].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
  }, [activities, invitations, community, memberById])

  const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  })

  /* Monday-first grid */
  const firstOfMonth = new Date(cursor.year, cursor.month, 1)
  const startOffset = (firstOfMonth.getDay() + 6) % 7
  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate()
  const cells: Array<{ date: string; day: number; inMonth: boolean }> = []

  for (let i = 0; i < startOffset; i += 1) {
    const d = new Date(cursor.year, cursor.month, 1 - (startOffset - i))
    cells.push({ date: toISODate(d), day: d.getDate(), inMonth: false })
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ date: toISODate(new Date(cursor.year, cursor.month, day)), day, inMonth: true })
  }
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1]
    const next = new Date(last.date)
    next.setDate(next.getDate() + 1)
    cells.push({ date: toISODate(next), day: next.getDate(), inMonth: false })
  }

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {}
    for (const e of events) {
      map[e.date] = map[e.date] ? [...map[e.date], e] : [e]
    }
    return map
  }, [events])

  const todayDate = new Date()
  const today = toISODate(todayDate)
  const upcoming = events.filter((e) => e.date >= today).slice(0, 5)
  const selectedEvents = selected ? eventsByDate[selected] ?? [] : []

  const shiftMonth = (delta: number) => {
    const d = new Date(cursor.year, cursor.month + delta, 1)
    setCursor({ year: d.getFullYear(), month: d.getMonth() })
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
      <Card>
        <CardHeader
          title="Community activity calendar"
          subtitle={`Scheduled demo activities and your own invitations around ${community.split(',')[0]}.`}
          icon={<CalendarDays className="h-4 w-4" />}
          action={
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => shiftMonth(-1)}
                aria-label="Previous month"
                className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-surface text-muted transition hover:text-ink"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => shiftMonth(1)}
                aria-label="Next month"
                className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-surface text-muted transition hover:text-ink"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          }
        />
        <div className="px-3 pb-4 sm:px-5">
          <p className="mb-3 text-[14px] font-bold text-ink">{monthLabel}</p>
          <div className="grid grid-cols-7 gap-1 text-center">
            {WEEKDAYS.map((d) => (
              <span key={d} className="pb-1 text-[11px] font-bold uppercase tracking-wide text-muted">
                {d.slice(0, 1)}
                <span className="sr-only">{d}</span>
              </span>
            ))}
            {cells.map((cell) => {
              const dayEvents = eventsByDate[cell.date] ?? []
              const isToday = cell.date === today
              const isSelected = cell.date === selected
              return (
                <button
                  key={cell.date}
                  type="button"
                  onClick={() => setSelected(cell.date === selected ? null : cell.date)}
                  aria-label={`${cell.day}, ${dayEvents.length} events`}
                  aria-pressed={isSelected}
                  className={cn(
                    'relative flex aspect-square flex-col items-center justify-center rounded-xl border text-[12.5px] font-semibold transition',
                    cell.inMonth ? 'text-ink' : 'text-muted/50',
                    isSelected
                      ? 'border-accent bg-accent-soft text-accent-ink'
                      : isToday
                        ? 'border-accent/60 bg-surface'
                        : 'border-transparent hover:border-line hover:bg-surface2',
                  )}
                >
                  {cell.day}
                  {dayEvents.length > 0 ? (
                    <span className="mt-0.5 flex gap-0.5">
                      {dayEvents.slice(0, 3).map((e) => (
                        <span
                          key={e.id}
                          className={cn('h-1.5 w-1.5 rounded-full', e.kind === 'invitation' ? 'bg-[#B07B4F]' : 'bg-accent')}
                        />
                      ))}
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>
          <p className="mt-3 flex flex-wrap items-center gap-3 text-[11.5px] text-muted">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-accent" /> Sample activity
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#B07B4F]" /> Your local invitation
            </span>
          </p>
        </div>
      </Card>

      <Card>
        <CardHeader
          title={selected ? `Events on ${new Date(selected).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}` : 'Next up in the community'}
          subtitle={selected ? 'Tap a row to open it.' : 'The next five scheduled items.'}
          icon={<CalendarDays className="h-4 w-4" />}
        />
        <div className="px-5 pb-5">
          {(selected ? selectedEvents : upcoming).length === 0 ? (
            <EmptyState
              className="py-8"
              icon={<CalendarDays className="h-5 w-5" />}
              title={selected ? 'Nothing scheduled that day' : 'No upcoming items'}
              description={
                selected
                  ? 'Pick another date, or create an invitation with someone from your connections.'
                  : 'Join or create an activity and it will appear here.'
              }
              action={
                selected ? (
                  <Button size="sm" variant="secondary" onClick={() => setSelected(null)}>
                    Show next up
                  </Button>
                ) : (
                  <Button size="sm" variant="secondary" onClick={() => setCursor({ year: todayDate.getFullYear(), month: todayDate.getMonth() })}>
                    Jump to this month
                  </Button>
                )
              }
            />
          ) : (
            <ul className="space-y-2">
              {(selected ? selectedEvents : upcoming).map((event) => (
                <li key={event.id}>
                  <Link
                    to={event.href}
                    className="flex items-start gap-3 rounded-xl border border-line bg-surface2/40 p-3 transition hover:border-accent/50"
                  >
                    <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent-ink">
                      <ActivityIcon category={event.category as ActivityCategory} className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-semibold text-ink">{event.title}</span>
                      <span className="mt-0.5 block text-[12.5px] text-muted">
                        {new Date(event.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} ·{' '}
                        {formatTime24(event.time)} · {event.place}
                      </span>
                    </span>
                    {event.kind === 'invitation' ? <Badge tone="amber">Yours</Badge> : <Badge tone="neutral">Sample</Badge>}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {!selected && joinedActivityIds.length > 0 ? (
            <p className="mt-4 rounded-xl bg-accent-soft/60 p-3 text-[12.5px] leading-relaxed text-accent-ink">
              You have joined {joinedActivityIds.length} demo {joinedActivityIds.length === 1 ? 'activity' : 'activities'}. Open{' '}
              <Link to="/schedule" className="font-semibold underline decoration-dotted">
                My Schedule
              </Link>{' '}
              to see them grouped by date.
            </p>
          ) : null}
        </div>
      </Card>
    </div>
  )
}
