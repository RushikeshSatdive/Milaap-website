import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Compass, Filter, Grid2X2, Info, List, RotateCcw, SlidersHorizontal, Sparkles } from 'lucide-react'
import { useMilaap, useDocumentTitle } from '../hooks'
import { Badge, Button, Card, EmptyState, Notice } from '../components/ui/primitives'
import { SearchInput, SelectFilter } from '../components/ui/SearchInput'
import { MemberCard, MemberRow } from '../components/cards/MemberCard'
import { ProfileDetailModal } from '../components/ProfileDetailModal'
import { PlanActivityModal } from '../components/PlanActivityModal'
import { COMMUNITIES } from '../data/seed'
import { ACTIVITY_CATEGORIES } from '../types'
import type { CommunityMember, MatchResult } from '../types'
import type { SortKey } from '../types/sort'
import { cn, unique } from '../utils/helpers'

const SORTS: Array<{ value: SortKey; label: string }> = [
  { value: 'match', label: 'Best match first' },
  { value: 'shared', label: 'Most shared interests' },
  { value: 'name', label: 'Name (A–Z)' },
  { value: 'community', label: 'Community' },
]

export function DiscoverPage() {
  useDocumentTitle('Discover People')
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const {
    matches,
    members,
    memberById,
    isConnected,
    addConnection,
    removeConnection,
    isSavedMember,
    toggleSavedMember,
    dismissMember,
    restoreDismissed,
    data,
    profile,
  } = useMilaap()

  const [query, setQuery] = useState('')
  const [interest, setInterest] = useState('')
  const [skill, setSkill] = useState('')
  const [language, setLanguage] = useState('')
  const [community, setCommunity] = useState('')
  const [activity, setActivity] = useState('')
  const [sharedOnly, setSharedOnly] = useState(false)
  const [sort, setSort] = useState<SortKey>('match')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [focusId, setFocusId] = useState<string | null>(params.get('focus'))
  const [planFor, setPlanFor] = useState<string | null>(null)

  /* Deep links such as /discover?focus=m-sana open the profile straight away */
  useEffect(() => {
    const focus = params.get('focus')
    if (focus) setFocusId(focus)
  }, [params])

  const closeProfile = () => {
    setFocusId(null)
    if (params.get('focus')) {
      params.delete('focus')
      setParams(params, { replace: true })
    }
  }

  const matchById = useMemo(
    () => Object.fromEntries(matches.map((m) => [m.memberId, m])),
    [matches],
  )

  const filterOptions = useMemo(() => {
    const allInterests = unique(members.flatMap((m) => m.interests)).sort()
    const allSkills = unique(members.flatMap((m) => [...m.teachSkills, ...m.learnSkills])).sort()
    const allLanguages = unique(members.flatMap((m) => m.languages)).sort()
    const allCommunities = unique([...COMMUNITIES.map((c) => c.name), ...members.map((m) => m.community)])
    return { allInterests, allSkills, allLanguages, allCommunities }
  }, [members])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return matches
      .map((m) => ({ match: m, member: memberById(m.memberId) }))
      .filter((row): row is { match: MatchResult; member: CommunityMember } => Boolean(row.member))
      .filter(({ member, match }) => {
        if (q) {
          const haystack = [
            member.name,
            member.bio,
            ...member.interests,
            ...member.hobbies,
            ...member.teachSkills,
            ...member.learnSkills,
            ...member.languages,
            member.community,
          ]
            .join(' ')
            .toLowerCase()
          if (!haystack.includes(q)) return false
        }
        if (interest && !member.interests.includes(interest) && !member.hobbies.includes(interest)) return false
        if (skill && ![...member.teachSkills, ...member.learnSkills].includes(skill)) return false
        if (language && !member.languages.includes(language)) return false
        if (community && member.community !== community) return false
        if (activity && !member.preferredActivities.includes(activity as (typeof ACTIVITY_CATEGORIES)[number])) return false
        if (sharedOnly && match.sharedInterests.length === 0 && match.theyTeachIWant.length === 0 && match.iTeachTheyWant.length === 0) {
          return false
        }
        return true
      })
      .sort((a, b) => {
        switch (sort) {
          case 'name':
            return a.member.name.localeCompare(b.member.name)
          case 'shared':
            return b.match.sharedInterests.length - a.match.sharedInterests.length || b.match.score - a.match.score
          case 'community':
            return a.member.community.localeCompare(b.member.community) || b.match.score - a.match.score
          default:
            return b.match.score - a.match.score
        }
      })
  }, [matches, memberById, query, interest, skill, language, community, activity, sharedOnly, sort])

  const activeFilterCount = [interest, skill, language, community, activity, sharedOnly ? 'shared-only' : ''].filter(Boolean).length

  const resetFilters = () => {
    setQuery('')
    setInterest('')
    setSkill('')
    setLanguage('')
    setCommunity('')
    setActivity('')
    setSharedOnly(false)
    setSort('match')
  }

  const focusMember = focusId ? memberById(focusId) : undefined
  const focusMatch = focusId ? matchById[focusId] : undefined

  return (
    <div className="space-y-5">
      <header>
        <Badge tone="sage" icon={<Compass className="h-3 w-3" />}>
          Discover
        </Badge>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-ink sm:text-[28px]">Discover People</h1>
        <p className="mt-1.5 max-w-2xl text-[14px] leading-relaxed text-muted">
          Twelve sample community profiles from around your area. Match scores are calculated locally from shared interests,
          complementary skills and the activities you both enjoy — the same inputs always produce the same score.
        </p>
      </header>

      {/* search + controls */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <SearchInput
            id="discover-search"
            value={query}
            onChange={setQuery}
            label="Search people by name, interest or skill"
            placeholder="Search by name, interest, skill or area…"
            className="flex-1"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={filtersOpen || activeFilterCount > 0 ? 'soft' : 'secondary'}
              icon={<SlidersHorizontal className="h-4 w-4" />}
              onClick={() => setFiltersOpen((v) => !v)}
              aria-expanded={filtersOpen}
            >
              Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </Button>
            {query || activeFilterCount > 0 ? (
              <Button variant="secondary" icon={<RotateCcw className="h-4 w-4" />} onClick={resetFilters}>
                Reset filters
              </Button>
            ) : null}
            <label className="flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-line bg-surface px-3 text-[13px] font-semibold text-ink">
              <input
                type="checkbox"
                checked={sharedOnly}
                onChange={(e) => setSharedOnly(e.target.checked)}
                className="h-4 w-4 accent-[#7B8F42]"
              />
              Only shared with me
            </label>
            <div className="inline-flex rounded-xl border border-line bg-surface p-0.5">
              {(['grid', 'list'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  aria-pressed={view === v}
                  aria-label={`${v} view`}
                  className={cn(
                    'grid h-9 w-10 place-items-center rounded-[10px] transition',
                    view === v ? 'bg-accent-soft text-accent-ink' : 'text-muted hover:text-ink',
                  )}
                >
                  {v === 'grid' ? <Grid2X2 className="h-4 w-4" /> : <List className="h-4 w-4" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filtersOpen ? (
          <div className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-2 lg:grid-cols-3">
            <SelectFilter label="Interest" value={interest} onChange={setInterest} options={filterOptions.allInterests} allLabel="Any" />
            <SelectFilter label="Skill" value={skill} onChange={setSkill} options={filterOptions.allSkills} allLabel="Any" />
            <SelectFilter label="Language" value={language} onChange={setLanguage} options={filterOptions.allLanguages} allLabel="Any" />
            <SelectFilter label="Community" value={community} onChange={setCommunity} options={filterOptions.allCommunities} allLabel="Every" />
            <SelectFilter label="Activity type" value={activity} onChange={setActivity} options={ACTIVITY_CATEGORIES} allLabel="Any" />
            <div className="flex flex-col gap-1">
              <label htmlFor="discover-sort" className="sr-only">
                Sort profiles
              </label>
              <select
                id="discover-sort"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="ml-input h-10 cursor-pointer py-0 text-[13px] font-medium"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    Sort: {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <Button variant="secondary" onClick={resetFilters} icon={<RotateCcw className="h-4 w-4" />} fullWidth>
                Reset filters
              </Button>
            </div>
          </div>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3 text-[12.5px] text-muted">
          <span className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5" aria-hidden />
            Showing <strong className="font-bold text-ink">{filtered.length}</strong> of {members.length} sample profiles
          </span>
          {activeFilterCount > 0 || query ? (
            <button type="button" onClick={resetFilters} className="font-semibold text-accent-ink hover:underline">
              Clear search and filters
            </button>
          ) : null}
          {data.dismissedMemberIds.length > 0 ? (
            <button
              type="button"
              onClick={restoreDismissed}
              className="ml-auto font-semibold text-accent-ink hover:underline"
            >
              Restore {data.dismissedMemberIds.length} dismissed
            </button>
          ) : null}
        </div>
      </Card>

      <Notice tone="warning" icon={<Info className="h-4 w-4" />} title="About these recommendations">
        Everyone listed here is fictional demonstration data created for this prototype. Adding a connection, saving a
        profile or planning an activity only changes your own browser storage — no real person is contacted and no
        invitation is delivered.
      </Notice>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Compass className="h-6 w-6" />}
          title="No profiles match these filters"
          description={`Nothing in ${profile.community} fits that combination yet. Try clearing a filter or two — or reset everything and start again.`}
          action={
            <>
              <Button onClick={resetFilters} icon={<RotateCcw className="h-4 w-4" />}>
                Reset filters
              </Button>
              <Button variant="secondary" onClick={() => navigate('/activities')}>
                Browse activities instead
              </Button>
            </>
          }
        />
      ) : view === 'grid' ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map(({ member, match }) => (
            <MemberCard
              key={member.id}
              member={member}
              match={match}
              connected={isConnected(member.id)}
              saved={isSavedMember(member.id)}
              onOpen={() => setFocusId(member.id)}
              onToggleConnect={() =>
                isConnected(member.id) ? removeConnection(member.id) : addConnection(member.id, 'discover')
              }
              onToggleSave={() => toggleSavedMember(member.id)}
              onDismiss={() => dismissMember(member.id)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(({ member, match }) => (
            <MemberRow
              key={member.id}
              member={member}
              match={match}
              connected={isConnected(member.id)}
              onOpen={() => setFocusId(member.id)}
              onToggleConnect={() =>
                isConnected(member.id) ? removeConnection(member.id) : addConnection(member.id, 'discover')
              }
            />
          ))}
        </div>
      )}

      {/* Why this match explainer */}
      <Card className="p-5">
        <h2 className="flex items-center gap-2 text-[15px] font-bold text-ink">
          <Sparkles className="h-4 w-4 text-accent" aria-hidden /> How the match score works
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: 'Shared interests', detail: 'Up to 45 points — the interests you both listed.' },
            { title: 'Complementary skills', detail: 'Up to 35 points — they teach what you want to learn, or the reverse.' },
            { title: 'Shared activity types', detail: 'Up to 15 points — the kinds of meet-ups you both prefer.' },
            { title: 'Language & area', detail: 'Up to 11 points — a shared language, and the same community.' },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-line bg-surface2/50 p-3">
              <p className="text-[13px] font-bold text-ink">{item.title}</p>
              <p className="mt-1 text-[12.5px] leading-snug text-muted">{item.detail}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[12.5px] leading-relaxed text-muted">
          Scores are deterministic: refreshing the page, changing filters or reopening a profile never changes a score. Every
          card and profile shows the specific reasons behind its number.
        </p>
      </Card>

      <ProfileDetailModal
        member={focusMember ?? null}
        open={Boolean(focusMember)}
        onClose={closeProfile}
        onPlanActivity={(id) => {
          closeProfile()
          setPlanFor(id)
        }}
      />

      <PlanActivityModal open={Boolean(planFor)} memberId={planFor ?? undefined} onClose={() => setPlanFor(null)} onCreated={() => navigate('/schedule')} />

      {focusMember && focusMatch ? (
        <p className="sr-only" aria-live="polite">
          {focusMember.name} opened with a {focusMatch.score} percent match.
        </p>
      ) : null}
    </div>
  )
}
