import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CalendarPlus, Check, Compass, Filter, RotateCcw, Trash2, Users } from 'lucide-react'
import { useMilaap, useDocumentTitle } from '../hooks'
import type { CommunityMember } from '../types'
import { Avatar, Badge, Button, Card, CardHeader, EmptyState, SectionHeading } from '../components/ui/primitives'
import { SearchInput, SelectFilter } from '../components/ui/SearchInput'
import { PageHeader } from '../components/ui/PageHeader'
import { Tabs } from '../components/ui/Tabs'
import { MemberCard, MemberRow, MatchRing } from '../components/cards/MemberCard'
import { ProfileDetailModal } from '../components/ProfileDetailModal'
import { PlanActivityModal } from '../components/PlanActivityModal'
import { StatCard } from '../components/cards/StatCard'
import { findSkillMatches } from '../utils/matching'
import { formatDayLabel, formatTime24, relativeTime } from '../utils/date'
import { unique } from '../utils/helpers'

export function ConnectionsPage() {
  useDocumentTitle('My Connections')
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const {
    connections,
    memberById,
    removeConnection,
    isSavedMember,
    toggleSavedMember,
    isConnected,
    addConnection,
    profile,
    members,
    matchFor,
    invitations,
    activeCommunity,
  } = useMilaap()

  const [query, setQuery] = useState('')
  const [sharedInterest, setSharedInterest] = useState('')
  const [tab, setTab] = useState('all')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [focusId, setFocusId] = useState<string | null>(params.get('focus'))
  const [planFor, setPlanFor] = useState<string | null>(null)

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

  const rows = useMemo(
    () =>
      connections
        .map((c) => ({ connection: c, member: memberById(c.memberId) }))
        .filter((row): row is { connection: (typeof connections)[number]; member: CommunityMember } => Boolean(row.member))
        .sort((a, b) => b.connection.addedAt.localeCompare(a.connection.addedAt)),
    [connections, memberById],
  )

  const sharedOptions = useMemo(() => {
    const list = rows.flatMap(({ member }) => member.interests.filter((i) => profile.interests.includes(i)))
    return unique(list).sort()
  }, [rows, profile.interests])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter(({ member }) => {
      if (tab === 'bookmarked' && !isSavedMember(member.id)) return false
      if (tab === 'skillswap' && findSkillMatches(profile, [member]).length === 0) return false
      if (q) {
        const haystack = [
          member.name,
          member.bio,
          member.community,
          ...member.interests,
          ...member.teachSkills,
          ...member.learnSkills,
        ]
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(q)) return false
      }
      if (sharedInterest && !member.interests.includes(sharedInterest)) return false
      return true
    })
  }, [rows, query, sharedInterest, tab, isSavedMember, profile])

  const focusMember = focusId ? memberById(focusId) : undefined

  const suggestedNext = useMemo(
    () =>
      members
        .filter((m) => !isConnected(m.id))
        .map((m) => ({ member: m, match: matchFor(m.id) }))
        .sort((a, b) => (b.match?.score ?? 0) - (a.match?.score ?? 0))
        .slice(0, 3),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [members, connections],
  )

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={
          <Badge tone="sage" icon={<Users className="h-3 w-3" />}>
            My Connections
          </Badge>
        }
        title="Your people, in one place"
        description="Saved connections, why each one was recommended, the skills you could swap, and a one-tap way to plan a twenty-minute meet-up."
        actions={
          <Button variant="secondary" icon={<Compass className="h-4 w-4" />} onClick={() => navigate('/discover')}>
            Discover more people
          </Button>
        }
      />

      {connections.length === 0 ? (
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title="No connections yet"
          description="Discover People shows sample community profiles ranked by your interests, complementary skills and preferred activities. Add anyone you would like to meet."
          action={
            <>
              <Button icon={<Compass className="h-4 w-4" />} onClick={() => navigate('/discover')}>
                Discover People
              </Button>
              <Button variant="secondary" onClick={() => navigate('/activities')}>
                Browse activities instead
              </Button>
            </>
          }
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard
              label="Connections"
              value={connections.length}
              hint="Added from Discover, Community and Skill Exchange"
              icon={<Users className="h-4 w-4" />}
            />
            <StatCard
              label="Bookmarked"
              value={rows.filter((r) => isSavedMember(r.member.id)).length}
              hint="Profiles you saved for later"
              icon={<Check className="h-4 w-4" />}
              tone="neutral"
            />
            <StatCard
              label="Meet-ups planned"
              value={invitations.length}
              hint="Demo invitations stored locally"
              icon={<CalendarPlus className="h-4 w-4" />}
              to="/schedule"
            />
          </div>

          <Tabs
            value={tab}
            onChange={setTab}
            label="Connection lists"
            options={[
              { id: 'all', label: 'All connections', count: connections.length },
              { id: 'skillswap', label: 'Could swap skills' },
              { id: 'bookmarked', label: 'Bookmarked' },
            ]}
          />

          <Card className="p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <SearchInput
                id="connection-search"
                value={query}
                onChange={setQuery}
                label="Search connections"
                placeholder="Search your connections by name, area or skill…"
                className="flex-1"
              />
              <div className="flex flex-wrap gap-2">
                <SelectFilter
                  label="Shared interest"
                  value={sharedInterest}
                  onChange={setSharedInterest}
                  options={sharedOptions}
                  allLabel="Any"
                />
                <div className="inline-flex rounded-xl border border-line bg-surface p-0.5">
                  {(['grid', 'list'] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setView(v)}
                      aria-pressed={view === v}
                      className={
                        view === v
                          ? 'rounded-[10px] bg-accent-soft px-3 py-1.5 text-[12.5px] font-semibold text-accent-ink'
                          : 'rounded-[10px] px-3 py-1.5 text-[12.5px] font-semibold text-muted hover:text-ink'
                      }
                    >
                      {v === 'grid' ? 'Cards' : 'List'}
                    </button>
                  ))}
                </div>
                {query || sharedInterest ? (
                  <Button
                    variant="secondary"
                    icon={<RotateCcw className="h-4 w-4" />}
                    onClick={() => {
                      setQuery('')
                      setSharedInterest('')
                    }}
                  >
                    Reset
                  </Button>
                ) : null}
              </div>
            </div>
            <p className="mt-3 flex items-center gap-1.5 border-t border-line pt-3 text-[12.5px] text-muted">
              <Filter className="h-3.5 w-3.5" aria-hidden />
              {filtered.length} of {rows.length} connections shown
            </p>
          </Card>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<Users className="h-6 w-6" />}
              title="No connections match these filters"
              description="Try a different search term, or clear the shared-interest filter."
              action={
                <Button
                  onClick={() => {
                    setQuery('')
                    setSharedInterest('')
                    setTab('all')
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          ) : view === 'grid' ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map(({ member, connection }) => {
                const memberInvites = invitations.filter((i) => i.memberId === member.id)
                const skillMatch = findSkillMatches(profile, [member])[0]
                return (
                  <div key={member.id} className="flex flex-col gap-3">
                    <MemberCard
                      member={member}
                      match={matchFor(member.id)}
                      connected
                      saved={isSavedMember(member.id)}
                      onOpen={() => setFocusId(member.id)}
                      onToggleConnect={() => removeConnection(member.id)}
                      onToggleSave={() => toggleSavedMember(member.id)}
                    />
                    <Card className="p-3.5">
                      <p className="text-[12px] font-bold uppercase tracking-wide text-muted">
                        Connected {relativeTime(connection.addedAt)}
                      </p>
                      {skillMatch ? (
                        <p className="mt-1.5 text-[12.5px] leading-snug text-muted">
                          <span className="font-semibold text-ink">Skill swap possible: </span>
                          {skillMatch.iTeachThem.length > 0
                            ? `you teach ${skillMatch.iTeachThem.join(', ')}`
                            : 'you could learn from them'}
                          {skillMatch.theyTeachMe.length > 0 ? ` · they teach ${skillMatch.theyTeachMe.join(', ')}` : ''}
                        </p>
                      ) : (
                        <p className="mt-1.5 text-[12.5px] leading-snug text-muted">
                          No direct skill swap yet — shared interests are the bridge here.
                        </p>
                      )}
                      {memberInvites.length > 0 ? (
                        <div className="mt-2 space-y-1">
                          {memberInvites.slice(0, 2).map((inv) => (
                            <button
                              key={inv.id}
                              type="button"
                              onClick={() => navigate(`/schedule?focus=${inv.id}`)}
                              className="block w-full text-left text-[12.5px] text-muted hover:text-ink"
                            >
                              {formatDayLabel(inv.date)} · {formatTime24(inv.time)} · {inv.title}
                            </button>
                          ))}
                        </div>
                      ) : null}
                      <div className="mt-2.5 flex flex-wrap gap-2">
                        <Button size="sm" icon={<CalendarPlus className="h-4 w-4" />} onClick={() => setPlanFor(member.id)}>
                          Plan an activity
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => setFocusId(member.id)}>
                          Why this match
                        </Button>
                        <button
                          type="button"
                          onClick={() => removeConnection(member.id)}
                          aria-label={`Remove ${member.name}`}
                          className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-surface text-muted transition hover:text-[#B4443A]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </Card>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(({ member }) => (
                <MemberRow
                  key={member.id}
                  member={member}
                  match={matchFor(member.id)}
                  connected
                  onOpen={() => setFocusId(member.id)}
                  onToggleConnect={() => removeConnection(member.id)}
                />
              ))}
            </div>
          )}

          <SectionHeading
            className="mt-2"
            title="Suggested next"
            subtitle="People you have not added yet, ranked for your profile."
          />
          <div className="grid gap-3 sm:grid-cols-3">
            {suggestedNext.map(({ member, match }) => (
              <Card key={member.id} className="flex items-center gap-3 p-3.5">
                <Avatar name={member.name} avatarId={member.avatarId} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-bold text-ink">{member.name}</p>
                  <p className="truncate text-[12px] text-muted">{member.community}</p>
                </div>
                {match ? <MatchRing score={match.score} size={38} /> : null}
                <Button size="sm" variant="secondary" onClick={() => addConnection(member.id, 'discover')}>
                  Add
                </Button>
              </Card>
            ))}
          </div>
        </>
      )}

      <Card>
        <CardHeader
          title="How connections affect the rest of Milaap"
          subtitle="Adding or removing someone updates these places immediately."
          icon={<Compass className="h-4 w-4" />}
        />
        <ul className="grid gap-2 px-5 pb-5 text-[13px] leading-relaxed text-muted sm:grid-cols-2">
          <li>· Home stops suggesting them as a new match and mentions them in your recent activity.</li>
          <li>· My Profile counts them in your contribution summary.</li>
          <li>· Auto-scored suggestions in Discover recalculate and re-rank.</li>
          <li>· They appear first in the “who is this with?” list when you plan an activity.</li>
          <li>· Your active community is {activeCommunity}.</li>
        </ul>
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

      <PlanActivityModal
        open={Boolean(planFor)}
        memberId={planFor ?? undefined}
        onClose={() => setPlanFor(null)}
        onCreated={() => navigate('/schedule')}
      />
    </div>
  )
}
