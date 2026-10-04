import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CalendarPlus, Filter, Info, LayoutGrid, Plus, RotateCcw } from 'lucide-react'
import { useMilaap, useDocumentTitle } from '../hooks'
import { ACTIVITY_CATEGORIES, type Activity, type ActivityCategory } from '../types'
import type { ActivitySortKey } from '../types/sort'
import { Badge, Button, Card, EmptyState, Notice } from '../components/ui/primitives'
import { SearchInput, SelectFilter } from '../components/ui/SearchInput'
import { Tabs } from '../components/ui/Tabs'
import { ActivityCard } from '../components/cards/ActivityCard'
import { ActivityDetailModal } from '../components/ActivityDetailModal'
import { ActivityFormModal } from '../components/forms/ActivityFormModal'
import { PlanActivityModal } from '../components/PlanActivityModal'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { COMMUNITIES } from '../data/seed'
import { isPastISO, isToday } from '../utils/date'
import { activityPopularity } from '../utils/matching'

type DateFilter = 'any' | 'today' | 'week' | 'weekend' | 'unscheduled'

const DATE_FILTERS: Array<{ value: DateFilter; label: string }> = [
  { value: 'any', label: 'Any date' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Next 7 days' },
  { value: 'weekend', label: 'This weekend' },
  { value: 'unscheduled', label: 'Ideas without a date' },
]

export function ActivitiesPage() {
  useDocumentTitle('Activities')
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const {
    activities,
    joinedActivityIds,
    savedActivityIds,
    isJoined,
    joinActivity,
    leaveActivity,
    isSavedActivity,
    toggleSavedActivity,
    deleteActivity,
    members,
    profile,
  } = useMilaap()

  const [query, setQuery] = useState(params.get('q') ?? '')
  const [category, setCategory] = useState<string>(params.get('category') ?? '')
  const [community, setCommunity] = useState('')
  const [dateFilter, setDateFilter] = useState<DateFilter>('any')
  const [sort, setSort] = useState<ActivitySortKey>('upcoming')
  const [tab, setTab] = useState<string>(params.get('tab') ?? 'all')
  const [focusId, setFocusId] = useState<string | null>(params.get('focus'))
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Activity | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Activity | null>(null)
  const [planActivity, setPlanActivity] = useState<Activity | null>(null)

  useEffect(() => {
    const focus = params.get('focus')
    if (focus) setFocusId(focus)
    const q = params.get('q')
    if (q) setQuery(q)
    const c = params.get('category')
    if (c) setCategory(c)
  }, [params])

  const closeDetail = () => {
    setFocusId(null)
    if (params.get('focus')) {
      params.delete('focus')
      setParams(params, { replace: true })
    }
  }

  const counts = useMemo(
    () => ({
      all: activities.length,
      joined: joinedActivityIds.length,
      saved: savedActivityIds.length,
      mine: activities.filter((a) => a.createdBy === 'you').length,
    }),
    [activities, joinedActivityIds, savedActivityIds],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return activities
      .filter((a) => {
        if (tab === 'joined' && !isJoined(a.id)) return false
        if (tab === 'saved' && !isSavedActivity(a.id)) return false
        if (tab === 'mine' && a.createdBy !== 'you') return false
        if (q) {
          const haystack = [a.title, a.description, a.category, a.community, a.place, ...a.interestTags, ...a.skillTags]
            .join(' ')
            .toLowerCase()
          if (!haystack.includes(q)) return false
        }
        if (category && a.category !== category) return false
        if (community && a.community !== community) return false

        if (dateFilter === 'unscheduled') return a.scheduledAt === null
        if (!a.scheduledAt) return false
        const ts = new Date(a.scheduledAt).getTime()
        if (dateFilter === 'today') return isToday(a.scheduledAt.slice(0, 10))
        if (dateFilter === 'week') return ts >= Date.now() && ts <= Date.now() + 7 * 864e5
        if (dateFilter === 'weekend') {
          const day = new Date(a.scheduledAt).getDay()
          return (day === 0 || day === 6) && ts >= Date.now() - 864e5
        }
        return true
      })
      .sort((a, b) => {
        switch (sort) {
          case 'popular':
            return activityPopularity(b, joinedActivityIds) - activityPopularity(a, joinedActivityIds)
          case 'shortest':
            return a.durationMins - b.durationMins || a.title.localeCompare(b.title)
          case 'newest':
            return b.createdAt.localeCompare(a.createdAt)
          default: {
            const at = a.scheduledAt ? new Date(a.scheduledAt).getTime() : Number.POSITIVE_INFINITY
            const bt = b.scheduledAt ? new Date(b.scheduledAt).getTime() : Number.POSITIVE_INFINITY
            const aPast = a.scheduledAt ? isPastISO(a.scheduledAt) : false
            const bPast = b.scheduledAt ? isPastISO(b.scheduledAt) : false
            if (aPast !== bPast) return aPast ? 1 : -1
            return at - bt
          }
        }
      })
  }, [activities, query, category, community, dateFilter, sort, tab, isJoined, isSavedActivity, joinedActivityIds])

  const hasFilters = Boolean(query || category || community || dateFilter !== 'any')

  const resetFilters = () => {
    setQuery('')
    setCategory('')
    setCommunity('')
    setDateFilter('any')
    setSort('upcoming')
  }

  const focusActivity = focusId ? activities.find((a) => a.id === focusId) : undefined
  const memberInterests = useMemo(
    () => [
      ...new Set([...profile.interests, ...members.flatMap((m) => m.interests)]),
    ].sort(),
    [profile.interests, members],
  )

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge tone="sage" icon={<LayoutGrid className="h-3 w-3" />}>
            Activities
          </Badge>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-ink sm:text-[28px]">Find something to do together</h1>
          <p className="mt-1.5 max-w-2xl text-[14px] leading-relaxed text-muted">
            Twelve kinds of short, low-pressure meet-ups — from a 20-minute chai to a lane clean-up. Join a sample activity,
            save it for later, or create your own.
          </p>
        </div>
        <Button
          icon={<Plus className="h-4 w-4" />}
          onClick={() => {
            setEditing(null)
            setFormOpen(true)
          }}
        >
          Create activity
        </Button>
      </header>

      <Tabs
        value={tab}
        onChange={setTab}
        label="Activity lists"
        options={[
          { id: 'all', label: 'All activities', count: counts.all },
          { id: 'joined', label: 'Joined', count: counts.joined },
          { id: 'saved', label: 'Saved', count: counts.saved },
          { id: 'mine', label: 'Created by me', count: counts.mine },
        ]}
      />

      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <SearchInput
            id="activity-search"
            value={query}
            onChange={setQuery}
            label="Search activities"
            placeholder="Search activities, tags, places…"
            className="flex-1"
          />
          <div className="flex flex-wrap gap-2">
            <SelectFilter label="Category" value={category} onChange={setCategory} options={ACTIVITY_CATEGORIES} allLabel="All" />
            <SelectFilter label="Community" value={community} onChange={setCommunity} options={COMMUNITIES.map((c) => c.name)} allLabel="Every" />
            <div className="flex flex-col gap-1">
              <label htmlFor="activity-date" className="sr-only">
                Filter by date
              </label>
              <select
                id="activity-date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as DateFilter)}
                className="ml-input h-10 cursor-pointer py-0 text-[13px] font-medium"
              >
                {DATE_FILTERS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="activity-sort" className="sr-only">
                Sort activities
              </label>
              <select
                id="activity-sort"
                value={sort}
                onChange={(e) => setSort(e.target.value as ActivitySortKey)}
                className="ml-input h-10 cursor-pointer py-0 text-[13px] font-medium"
              >
                <option value="upcoming">Sort: Upcoming first</option>
                <option value="popular">Sort: Most popular first</option>
                <option value="shortest">Sort: Shortest first</option>
                <option value="newest">Sort: Newest created</option>
              </select>
            </div>
            {hasFilters ? (
              <Button variant="secondary" icon={<RotateCcw className="h-4 w-4" />} onClick={resetFilters}>
                Reset
              </Button>
            ) : null}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3">
          <span className="flex items-center gap-1.5 text-[12.5px] text-muted">
            <Filter className="h-3.5 w-3.5" aria-hidden />
            {filtered.length} of {activities.length} activities
          </span>
          <div className="ml-auto flex flex-wrap gap-1.5">
            {ACTIVITY_CATEGORIES.slice(0, 6).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(category === c ? '' : c)}
                aria-pressed={category === c}
                className={
                  category === c
                    ? 'rounded-full border border-accent bg-accent-soft px-2.5 py-1 text-[11.5px] font-semibold text-accent-ink'
                    : 'rounded-full border border-line bg-surface px-2.5 py-1 text-[11.5px] font-medium text-muted transition hover:border-accent/50 hover:text-ink'
                }
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Notice tone="info" icon={<Info className="h-4 w-4" />} title="Counts and participants are demonstration data">
        Participant numbers come from seeded sample data plus your own local joins. Joining an activity never contacts a real
        person, and nobody else can see it.
      </Notice>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<LayoutGrid className="h-6 w-6" />}
          title={tab === 'mine' ? 'You have not created an activity yet' : 'No activities match these filters'}
          description={
            tab === 'mine'
              ? 'Create a short meet-up of your own — 20 minutes is plenty to start with.'
              : 'Try a different category or date range, or reset the filters to see everything.'
          }
          action={
            tab === 'mine' ? (
              <Button icon={<Plus className="h-4 w-4" />} onClick={() => setFormOpen(true)}>
                Create activity
              </Button>
            ) : (
              <Button icon={<RotateCcw className="h-4 w-4" />} onClick={resetFilters}>
                Reset filters
              </Button>
            )
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              joined={isJoined(activity.id)}
              saved={isSavedActivity(activity.id)}
              onOpen={() => setFocusId(activity.id)}
              onJoin={() => joinActivity(activity.id)}
              onLeave={() => leaveActivity(activity.id)}
              onSave={() => toggleSavedActivity(activity.id)}
              onEdit={
                activity.createdBy === 'you'
                  ? () => {
                      setEditing(activity)
                      setFormOpen(true)
                    }
                  : undefined
              }
              onDelete={activity.createdBy === 'you' ? () => setPendingDelete(activity) : undefined}
            />
          ))}
        </div>
      )}

      {/* interest shortcut band */}
      <Card className="p-5">
        <h2 className="text-[15px] font-bold text-ink">Browse by interest instead</h2>
        <p className="mt-1 text-[13px] text-muted">
          These are the interests from your profile and the sample community. Tapping one filters the list above.
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {memberInterests.slice(0, 14).map((interest) => (
            <button
              key={interest}
              type="button"
              onClick={() => {
                setQuery(interest)
                setTab('all')
              }}
              className="rounded-full border border-line bg-surface px-3 py-1.5 text-[12.5px] font-medium text-muted transition hover:border-accent/60 hover:text-ink"
            >
              {interest}
            </button>
          ))}
        </div>
      </Card>

      <ActivityDetailModal
        activity={focusActivity ?? null}
        open={Boolean(focusActivity)}
        onClose={closeDetail}
        onEdit={(a) => {
          closeDetail()
          setEditing(a)
          setFormOpen(true)
        }}
        onDelete={(a) => {
          closeDetail()
          setPendingDelete(a)
        }}
        onPlan={(a) => {
          closeDetail()
          setPlanActivity(a)
        }}
      />

      <ActivityFormModal open={formOpen} onClose={() => setFormOpen(false)} editing={editing} />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        destructive
        title="Delete this activity?"
        message={
          <>
            “{pendingDelete?.title}” will be removed from your local data, along with any join or save you had on it. This cannot
            be undone.
          </>
        }
        confirmLabel="Delete activity"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) deleteActivity(pendingDelete.id)
          setPendingDelete(null)
        }}
      />

      <PlanActivityModal
        open={Boolean(planActivity)}
        onClose={() => setPlanActivity(null)}
        defaultActivityType={(planActivity?.category ?? 'Chai & Chat') as ActivityCategory}
        defaultTitle={planActivity?.title}
        defaultDuration={20}
        onCreated={() => navigate('/schedule')}
      />

      <p className="flex items-center gap-1.5 text-[12px] text-muted">
        <CalendarPlus className="h-3.5 w-3.5" aria-hidden />
        Activities created by you appear under “Created by me” and can be edited or deleted at any time.
      </p>
    </div>
  )
}
