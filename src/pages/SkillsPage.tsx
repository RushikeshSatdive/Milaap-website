import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CalendarPlus, Info, Plus, Repeat2, RotateCcw, Sparkles, Wand2 } from 'lucide-react'
import { useMilaap, useDocumentTitle } from '../hooks'
import { SKILL_CATEGORIES, type SkillListing } from '../types'
import { Badge, Button, Card, EmptyState, Notice, SectionHeading } from '../components/ui/primitives'
import { SearchInput, SelectFilter } from '../components/ui/SearchInput'
import { Tabs } from '../components/ui/Tabs'
import { SkillCard } from '../components/cards/SkillCard'
import { SkillFormModal } from '../components/forms/SkillFormModal'
import { PlanActivityModal } from '../components/PlanActivityModal'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { findListingPairs, findSkillMatches } from '../utils/matching'
import { swapPlan } from '../utils/conversation'
import { pluralise, unique } from '../utils/helpers'
import type { SkillSortKey } from '../types/sort'

const HOME_SKILL_MATCH_LIMIT = 4

export function SkillsPage() {
  useDocumentTitle('Skill Exchange')
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const {
    skillListings,
    savedSkillIds,
    isSavedSkill,
    toggleSavedSkill,
    deleteSkillListing,
    members,
    memberById,
    profile,
    isConnected,
    addConnection,
    matchFor,
  } = useMilaap()

  const [tab, setTab] = useState(params.get('tab') ?? 'offers')
  const [query, setQuery] = useState(params.get('q') ?? '')
  const [category, setCategory] = useState('')
  const [format, setFormat] = useState('')
  const [availability, setAvailability] = useState('')
  const [sort, setSort] = useState<SkillSortKey>('category')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<SkillListing | null>(null)
  const [pendingDelete, setPendingDelete] = useState<SkillListing | null>(null)
  const [planFor, setPlanFor] = useState<string | null>(null)
  const [focusId, setFocusId] = useState<string | null>(params.get('focus'))
  const [formType, setFormType] = useState<'offer' | 'request'>('offer')

  useEffect(() => {
    const focus = params.get('focus')
    if (focus) setFocusId(focus)
    const t = params.get('tab')
    if (t) setTab(t)
  }, [params])

  useEffect(() => {
    if (params.get('tab') === 'create') {
      setFormType('offer')
      setFormOpen(true)
      params.delete('tab')
      setParams(params, { replace: true })
    }
  }, [params, setParams])

  const listingOwner = (listing: SkillListing) =>
    listing.memberId === 'me'
      ? { name: profile.name || 'You', avatarId: profile.avatarId, community: profile.community }
      : (() => {
          const m = memberById(listing.memberId)
          return {
            name: m?.name ?? 'Sample member',
            avatarId: m?.avatarId ?? listing.memberId,
            community: m?.community ?? '—',
          }
        })()

  /* Complementary pairs: which listings pair with which */
  const pairMap = useMemo(() => {
    const map: Record<string, string[]> = {}
    for (const listing of skillListings) {
      const partners = skillListings.filter(
        (other) =>
          other.id !== listing.id &&
          other.type !== listing.type &&
          (other.skill.toLowerCase().includes(listing.skill.toLowerCase()) ||
            listing.skill.toLowerCase().includes(other.skill.toLowerCase())),
      )
      map[listing.id] = partners.map((p) => listingOwner(p).name)
    }
    return map
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skillListings, memberById, profile])

  const skillMatches = useMemo(() => findSkillMatches(profile, members), [profile, members])
  const listingPairs = useMemo(() => findListingPairs(profile, skillListings), [profile, skillListings])
  const extraPairs = useMemo(
    () =>
      listingPairs.filter(
        (p) => p.offer.memberId !== 'me' && p.request.memberId !== 'me',
      ),
    [listingPairs],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return skillListings
      .filter((l) => {
        if (tab === 'offers' && l.type !== 'offer') return false
        if (tab === 'requests' && l.type !== 'request') return false
        if (tab === 'saved' && !savedSkillIds.includes(l.id)) return false
        if (tab === 'mine' && l.createdBy !== 'you') return false
        if (q) {
          const haystack = [l.skill, l.description, l.category, listingOwner(l).name, l.note ?? ''].join(' ').toLowerCase()
          if (!haystack.includes(q)) return false
        }
        if (category && l.category !== category) return false
        if (format && l.format !== format) return false
        if (availability && !l.availability.includes(availability as SkillListing['availability'][number])) return false
        return true
      })
      .sort((a, b) => {
        switch (sort) {
          case 'alphabetical':
            return a.skill.localeCompare(b.skill)
          case 'recent':
            return b.createdAt.localeCompare(a.createdAt)
          default:
            return a.category.localeCompare(b.category) || a.skill.localeCompare(b.skill)
        }
      })
  }, [skillListings, tab, savedSkillIds, query, category, format, availability, sort, memberById, profile])

  const counts = {
    offers: skillListings.filter((l) => l.type === 'offer').length,
    requests: skillListings.filter((l) => l.type === 'request').length,
    matches: skillMatches.length + extraPairs.length,
    saved: savedSkillIds.length,
    mine: skillListings.filter((l) => l.createdBy === 'you').length,
  }

  const availabilities = useMemo(() => unique(skillListings.flatMap((l) => l.availability)).sort(), [skillListings])
  const focusedListing = focusId ? skillListings.find((l) => l.id === focusId) : undefined

  const hasFilters = Boolean(query || category || format || availability)

  const resetFilters = () => {
    setQuery('')
    setCategory('')
    setFormat('')
    setAvailability('')
    setSort('category')
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge tone="sage" icon={<Repeat2 className="h-3 w-3" />}>
            Skill Exchange
          </Badge>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-ink sm:text-[28px]">Swap what you know</h1>
          <p className="mt-1.5 max-w-2xl text-[14px] leading-relaxed text-muted">
            A neighbourhood learning marketplace with no money in it. Browse what people can teach and want to learn, then
            suggest a twenty-minute swap. Example: {''}
            <span className="font-semibold text-ink">
              {profile.name || 'You'} can teach {profile.teachSkills[0]?.toLowerCase() ?? 'smartphone photography'} and wants to learn{' '}
              {profile.learnSkills[0]?.toLowerCase() ?? 'basic car maintenance'}
            </span>
            .
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            icon={<Plus className="h-4 w-4" />}
            onClick={() => {
              setEditing(null)
              setFormType('offer')
              setFormOpen(true)
            }}
          >
            Offer a skill
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setEditing(null)
              setFormType('request')
              setFormOpen(true)
            }}
          >
            Request to learn
          </Button>
        </div>
      </header>

      {params.get('focus') && focusedListing ? (
        <Notice tone="info" title={`You searched for “${focusedListing.skill}”`}>
          <p>
            {focusedListing.type === 'offer' ? 'Offered' : 'Wanted'} by {listingOwner(focusedListing).name} ·{' '}
            {focusedListing.category}. {pairMap[focusedListing.id]?.length ? `Pairs with ${pairMap[focusedListing.id].slice(0, 2).join(' and ')}.` : ''}
          </p>
        </Notice>
      ) : null}

      <Tabs
        value={tab}
        onChange={setTab}
        label="Skill exchange sections"
        options={[
          { id: 'offers', label: 'I can teach', count: counts.offers },
          { id: 'requests', label: 'I want to learn', count: counts.requests },
          { id: 'matches', label: 'Complementary matches', count: counts.matches },
          { id: 'saved', label: 'Saved', count: counts.saved },
          { id: 'mine', label: 'My listings', count: counts.mine },
        ]}
      />

      {tab === 'matches' ? (
        <div className="space-y-4">
          <SectionHeading
            title="Your complementary skill matches"
            subtitle="People who can teach what you want to learn, and want to learn what you can teach."
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {skillMatches.map((sm) => {
              const member = memberById(sm.memberId)
              if (!member) return null
              const match = matchFor(member.id)
              return (
                <Card key={sm.memberId} className="p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-[15px] font-bold text-ink">{member.name}</h3>
                    <Badge tone="sage">{sm.score}% skill fit</Badge>
                    {match ? <Badge tone="outline">overall match {match.score}%</Badge> : null}
                  </div>
                  <p className="mt-1 text-[12.5px] text-muted">{member.community}</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <div className="rounded-xl border border-line bg-surface2/50 p-3">
                      <p className="text-[12px] font-bold uppercase tracking-wide text-muted">You teach them</p>
                      <p className="mt-1 text-[13px] text-ink">{sm.iTeachThem.join(', ') || 'Nothing yet'}</p>
                    </div>
                    <div className="rounded-xl border border-line bg-surface2/50 p-3">
                      <p className="text-[12px] font-bold uppercase tracking-wide text-muted">They teach you</p>
                      <p className="mt-1 text-[13px] text-ink">{sm.theyTeachMe.join(', ') || 'Nothing yet'}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-[12.5px] leading-relaxed text-muted">
                    <span className="font-semibold text-ink">Swap plan: </span>
                    {swapPlan(sm.iTeachThem, sm.theyTeachMe)}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" icon={<CalendarPlus className="h-4 w-4" />} onClick={() => setPlanFor(member.id)}>
                      Suggest a 20-minute swap
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => navigate(`/discover?focus=${member.id}`)}>
                      View profile
                    </Button>
                    {!isConnected(member.id) ? (
                      <Button size="sm" variant="ghost" onClick={() => addConnection(member.id, 'skill-exchange')}>
                        Add connection
                      </Button>
                    ) : null}
                  </div>
                </Card>
              )
            })}
          </div>

          {extraPairs.length > 0 ? (
            <>
              <SectionHeading
                title="Other pairings Milaap spotted"
                subtitle="Two sample members whose listings complement each other — useful to know when you host a skill swap."
              />
              <div className="grid gap-3 sm:grid-cols-2">
                {extraPairs.slice(0, HOME_SKILL_MATCH_LIMIT).map((pair) => {
                  const offerer = listingOwner(pair.offer)
                  const requester = listingOwner(pair.request)
                  return (
                    <Card key={`${pair.offer.id}-${pair.request.id}`} className="p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-[14.5px] font-bold text-ink">{pair.offer.skill}</h3>
                        <Badge tone="sage" icon={<Sparkles className="h-3 w-3" />}>
                          complementary
                        </Badge>
                      </div>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                        <span className="font-semibold text-ink">{offerer.name}</span> can teach it;{' '}
                        <span className="font-semibold text-ink">{requester.name}</span> wants to learn it. A twenty-minute
                        swap would suit both.
                      </p>
                      <Button
                        className="mt-3"
                        size="sm"
                        variant="secondary"
                        icon={<Wand2 className="h-4 w-4" />}
                        onClick={() => setPlanFor(pair.memberId)}
                      >
                        Plan a swap with {offerer.name.split(' ')[0]}
                      </Button>
                    </Card>
                  )
                })}
              </div>
            </>
          ) : null}

          {skillMatches.length === 0 && extraPairs.length === 0 ? (
            <EmptyState
              icon={<Repeat2 className="h-6 w-6" />}
              title="No complementary matches yet"
              description="Add the skills you can share and want to learn in your profile, or create a listing of your own."
              action={
                <>
                  <Button onClick={() => navigate('/profile/edit')}>Update my skills</Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setTab('offers')
                      resetFilters()
                    }}
                  >
                    Browse listings
                  </Button>
                </>
              }
            />
          ) : null}
        </div>
      ) : (
        <>
          <Card className="p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <SearchInput
                id="skill-search"
                value={query}
                onChange={setQuery}
                label="Search skill listings"
                placeholder="Search skills, people or categories…"
                className="flex-1"
              />
              <div className="flex flex-wrap gap-2">
                <SelectFilter label="Category" value={category} onChange={setCategory} options={SKILL_CATEGORIES} allLabel="All" />
                <SelectFilter label="Format" value={format} onChange={setFormat} options={['In person', 'Online', 'Either']} allLabel="Any" />
                <SelectFilter label="Availability" value={availability} onChange={setAvailability} options={availabilities} allLabel="Any" />
                <div className="flex flex-col gap-1">
                  <label htmlFor="skill-sort" className="sr-only">
                    Sort listings
                  </label>
                  <select
                    id="skill-sort"
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SkillSortKey)}
                    className="ml-input h-10 cursor-pointer py-0 text-[13px] font-medium"
                  >
                    <option value="category">Sort: Category</option>
                    <option value="recent">Sort: Recently added</option>
                    <option value="alphabetical">Sort: A–Z</option>
                  </select>
                </div>
                {hasFilters ? (
                  <Button variant="secondary" icon={<RotateCcw className="h-4 w-4" />} onClick={resetFilters}>
                    Reset
                  </Button>
                ) : null}
              </div>
            </div>
            <p className="mt-3 border-t border-line pt-3 text-[12.5px] text-muted">
              Showing {filtered.length} of {skillListings.length} listings ·{' '}
              {pluralise(counts.mine, 'listing')} created by you
            </p>
          </Card>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<Repeat2 className="h-6 w-6" />}
              title={tab === 'mine' ? 'You have not created a listing yet' : 'No listings match these filters'}
              description={
                tab === 'mine'
                  ? 'Offer something you can explain in twenty minutes, or ask for something you want to learn.'
                  : 'Try a different category or clear the search to see every listing.'
              }
              action={
                <>
                  <Button
                    icon={<Plus className="h-4 w-4" />}
                    onClick={() => {
                      setEditing(null)
                      setFormOpen(true)
                    }}
                  >
                    Create a listing
                  </Button>
                  <Button variant="secondary" onClick={resetFilters}>
                    Reset filters
                  </Button>
                </>
              }
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((listing) => {
                const owner = listingOwner(listing)
                return (
                  <SkillCard
                    key={listing.id}
                    listing={listing}
                    teacherName={owner.name}
                    teacherAvatarId={owner.avatarId}
                    teacherCommunity={owner.community}
                    matchedNames={pairMap[listing.id] ?? []}
                    saved={isSavedSkill(listing.id)}
                    onToggleSave={() => toggleSavedSkill(listing.id)}
                    onOpenProfile={listing.memberId === 'me' ? undefined : () => navigate(`/discover?focus=${listing.memberId}`)}
                    onSuggestSwap={listing.createdBy === 'you' ? undefined : () => setPlanFor(listing.memberId)}
                    onEdit={
                      listing.createdBy === 'you'
                        ? () => {
                            setEditing(listing)
                            setFormOpen(true)
                          }
                        : undefined
                    }
                    onDelete={listing.createdBy === 'you' ? () => setPendingDelete(listing) : undefined}
                  />
                )
              })}
            </div>
          )}
        </>
      )}

      <Notice tone="warning" icon={<Info className="h-4 w-4" />} title="No money, no bookings, no fees">
        Milaap's Skill Exchange has no payments, no booking fees and no paid tiers. Listings are demonstration data stored in
        your browser; creating one does not notify anybody.
      </Notice>

      <SkillFormModal open={formOpen} onClose={() => setFormOpen(false)} editing={editing} defaultType={formType} />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        destructive
        title="Delete this listing?"
        message={<>“{pendingDelete?.skill}” will be removed from your local listings and from your saved skills.</>}
        confirmLabel="Delete listing"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) deleteSkillListing(pendingDelete.id)
          setPendingDelete(null)
        }}
      />

      <PlanActivityModal
        open={Boolean(planFor)}
        memberId={planFor ?? undefined}
        defaultActivityType="Skill Swap"
        defaultTitle="Twenty-minute skill swap"
        defaultDuration={20}
        onClose={() => setPlanFor(null)}
        onCreated={() => navigate('/schedule')}
      />
    </div>
  )
}
