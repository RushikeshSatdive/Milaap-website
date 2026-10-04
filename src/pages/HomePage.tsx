import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  CalendarPlus,
  Check,
  CheckCircle2,
  Compass,
  HeartHandshake,
  LayoutGrid,
  Repeat2,
  Sparkles,
  UserPlus,
  UsersRound,
  X,
} from 'lucide-react'
import { useMilaap, useDocumentTitle } from '../hooks'
import { Badge, Button, Card, CardHeader, ProgressBar } from '../components/ui/primitives'
import { ActivityIcon, CommunityIllustration } from '../components/ui/CategoryIcon'
import { CommunitySelector } from '../components/CommunitySelector'
import { MemberCard, MatchRing } from '../components/cards/MemberCard'
import { QuickLinkCard, StatCard } from '../components/cards/StatCard'
import { ChallengeCard } from '../components/cards/ChallengeCard'
import { ProfileDetailModal } from '../components/ProfileDetailModal'
import { PlanActivityModal } from '../components/PlanActivityModal'
import { computeProfileCompletion } from '../utils/profile'
import { findListingPairs, findSkillMatches, recommendActivities } from '../utils/matching'
import { formatDateTime, humanDuration, relativeTime } from '../utils/date'
import { pluralise } from '../utils/helpers'

export function HomePage() {
  useDocumentTitle('Home')
  const navigate = useNavigate()
  const {
    profile,
    matches,
    memberById,
    isConnected,
    addConnection,
    removeConnection,
    isSavedMember,
    toggleSavedMember,
    dismissMember,
    activities,
    isJoined,
    joinActivity,
    leaveActivity,
    isSavedActivity,
    toggleSavedActivity,
    challenges,
    toggleChallengeJoin,
    toggleTask,
    toggleSaveChallenge,
    isSavedChallenge,
    skillListings,
    stats,
    invitations,
    members,
    activeCommunity,
    connections,
  } = useMilaap()

  const [focusMemberId, setFocusMemberId] = useState<string | null>(null)
  const [planFor, setPlanFor] = useState<string | null>(null)

  const completion = useMemo(() => computeProfileCompletion(profile), [profile])

  /* Top three "people you might not normally meet" */
  const weekly = useMemo(
    () => matches.filter((m) => !isConnected(m.memberId)).slice(0, 3),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [matches, connections],
  )

  const upcoming = useMemo(() => {
    const list = activities
      .filter((a) => a.scheduledAt)
      .map((a) => ({ a, ts: new Date(a.scheduledAt as string).getTime() }))
      .filter((x) => x.ts > Date.now() || isJoined(x.a.id))
      .sort((x, y) => x.ts - y.ts)
      .slice(0, 3)
      .map((x) => x.a)
    return list
  }, [activities, isJoined])

  const skillMatches = useMemo(() => findSkillMatches(profile, members).slice(0, 2), [profile, members])
  const listingPairs = useMemo(() => findListingPairs(profile, skillListings), [profile, skillListings])
  const suggestedSkills = useMemo(() => {
    return listingPairs
      .map((pair) => ({
        pair,
        listing: pair.kind === 'you-learn' ? pair.request : pair.offer,
      }))
      .slice(0, 2)
  }, [listingPairs])

  const communityChallenges = useMemo(
    () => challenges.filter((c) => c.community === activeCommunity).slice(0, 2),
    [challenges, activeCommunity],
  )

  const personalisedActivities = useMemo(
    () => recommendActivities(profile, activities, memberById(weekly[0]?.memberId ?? '') ?? null, 3),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [profile, activities, weekly],
  )

  const timeline = useMemo(() => {
    const events: Array<{ id: string; at: string; label: string; detail: string; to: string }> = []
    connections.forEach((c) => {
      const m = memberById(c.memberId)
      if (m) {
        events.push({
          id: `conn-${c.memberId}`,
          at: c.addedAt,
          label: `Added ${m.name} to My Connections`,
          detail: m.community,
          to: `/connections?focus=${m.id}`,
        })
      }
    })
    invitations.forEach((i) => {
      const m = memberById(i.memberId)
      events.push({
        id: `inv-${i.id}`,
        at: i.createdAt,
        label: `Demo invitation created: ${i.title}`,
        detail: `${m?.name ?? 'Connection'} · ${i.date} at ${i.time}`,
        to: `/schedule?focus=${i.id}`,
      })
    })
    challenges
      .filter((c) => c.joined)
      .forEach((c) => {
        events.push({
          id: `chal-${c.id}`,
          at: c.createdAt,
          label: `Joined challenge: ${c.title}`,
          detail: `${c.tasks.filter((t) => t.done).length}/${c.tasks.length} tasks done`,
          to: `/community?challenge=${c.id}`,
        })
      })
    return events.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 5)
  }, [connections, invitations, challenges, memberById])

  const focusMember = focusMemberId ? memberById(focusMemberId) : undefined
  const firstName = profile.name?.split(' ')[0] || 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-6">
      {/* ---------------------------- hero ---------------------------- */}
      <section className="overflow-hidden rounded-3xl border border-line bg-surface shadow-soft">
        <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1.35fr_1fr]">
          <div>
            <Badge tone="sage" icon={<Sparkles className="h-3 w-3" />}>
              Demo mode · sample data only
            </Badge>
            <h1 className="mt-3 text-[26px] font-extrabold leading-tight tracking-tight text-ink sm:text-[32px]">
              {greeting}, {firstName}.
            </h1>
            <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-muted">
              <strong className="font-semibold text-ink">Milaap</strong> is not a feed and not a dating app. It gives you a
              reason to meet the people already around you — neighbours, students, colleagues and senior citizens — through
              short, low-pressure, real-world activities.
            </p>
            <p className="mt-3 max-w-xl rounded-xl bg-accent-soft/70 px-3.5 py-2.5 text-[13.5px] leading-relaxed text-accent-ink">
              Most platforms help us connect with people we already know. Milaap helps us discover the people around us — and
              then do something small together.
            </p>

            <div className="mt-4 max-w-sm">
              <CommunitySelector />
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button icon={<Compass className="h-4 w-4" />} onClick={() => navigate('/discover')}>
                Discover People
              </Button>
              <Button variant="secondary" icon={<LayoutGrid className="h-4 w-4" />} onClick={() => navigate('/activities')}>
                Find an Activity
              </Button>
              <Button variant="secondary" icon={<Repeat2 className="h-4 w-4" />} onClick={() => navigate('/skills?tab=create')}>
                Offer a Skill
              </Button>
              <Button variant="ghost" icon={<UsersRound className="h-4 w-4" />} onClick={() => navigate('/community')}>
                Explore Community
              </Button>
            </div>
          </div>

          <div className="relative flex flex-col justify-between gap-4 rounded-2xl border border-accent/25 bg-accent-soft/50 p-4">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-wide text-accent-ink">Your weekly Milaap</p>
              <h2 className="mt-1 text-[19px] font-extrabold leading-snug text-ink">
                Discover 3 people you might not normally meet.
              </h2>
              <p className="mt-1.5 text-[13px] leading-relaxed text-accent-ink/90">
                Chosen from your interests, the skills you can share and the activities you said you enjoy. Every match
                explains itself.
              </p>
            </div>
            <div className="hidden h-28 sm:block">
              <CommunityIllustration />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => navigate('/discover')} icon={<ArrowRight className="h-4 w-4" />}>
                See all matches
              </Button>
              <Button size="sm" variant="secondary" onClick={() => navigate('/activities')}>
                Find a 20-min activity
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------- quick stats --------------------------- */}
      <section aria-label="Your activity at a glance" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Connections"
          value={stats.connections}
          hint="People you added from Discover"
          icon={<UserPlus className="h-4 w-4" />}
          to="/connections"
        />
        <StatCard
          label="Activities joined"
          value={stats.activitiesJoined}
          hint="Locally tracked joins only"
          icon={<CheckCircle2 className="h-4 w-4" />}
          to="/activities"
        />
        <StatCard
          label="Planned meet-ups"
          value={stats.invitationsPlanned}
          hint="Demo invitations in your schedule"
          icon={<CalendarPlus className="h-4 w-4" />}
          to="/schedule"
        />
        <StatCard
          label="Challenges joined"
          value={stats.challengesJoined}
          hint={`${pluralise(stats.tasksCompleted, 'task', 'tasks')} completed locally`}
          icon={<HeartHandshake className="h-4 w-4" />}
          to="/community"
        />
      </section>

      {/* ------------------------- quick actions -------------------------- */}
      <section>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickLinkCard
            to="/discover"
            title="Discover People"
            description="Filter by interest, skill, language and community."
            icon={<Compass className="h-5 w-5" />}
          />
          <QuickLinkCard
            to="/activities"
            title="Find an Activity"
            description="Twelve kinds of short meet-ups, ready to join."
            icon={<LayoutGrid className="h-5 w-5" />}
          />
          <QuickLinkCard
            to="/skills?tab=create"
            title="Offer a Skill"
            description="Teach 20 minutes of something you already know."
            icon={<Repeat2 className="h-5 w-5" />}
          />
          <QuickLinkCard
            to="/community"
            title="Explore Community"
            description="Challenges, volunteering and the local fix board."
            icon={<UsersRound className="h-5 w-5" />}
          />
        </div>
      </section>

      {/* ---------------------- profile completion ------------------------ */}
      <Card className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="flex items-center gap-2 text-[16px] font-bold text-ink">
              Complete your profile
              {completion.complete ? (
                <Badge tone="sage" icon={<Check className="h-3 w-3" />}>
                  All set
                </Badge>
              ) : null}
            </h2>
            <p className="mt-1 text-[13.5px] leading-relaxed text-muted">
              {completion.missing.length > 0
                ? `Still to add: ${completion.missing.slice(0, 4).join(', ')}${completion.missing.length > 4 ? '…' : ''}.`
                : 'Your interests, skills and availability are filled in, so match explanations are as specific as they can be.'}
            </p>
            <ProgressBar
              className="mt-3 max-w-md"
              value={completion.percent}
              label="Profile completion"
              hint={`${completion.percent}%`}
            />
          </div>
          <Button
            variant={completion.complete ? 'secondary' : 'primary'}
            onClick={() => navigate('/profile/edit')}
            icon={<ArrowRight className="h-4 w-4" />}
            className="shrink-0"
          >
            {completion.complete ? 'Review profile' : 'Continue profile'}
          </Button>
        </div>
      </Card>

      {/* ------------------- weekly connection suggestions ---------------- */}
      <section>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-[17px] font-bold text-ink">Weekly connection recommendations</h2>
            <p className="mt-0.5 text-[13px] text-muted">
              Scored from shared interests, complementary skills and preferred activities. Sample profiles, not real people.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => navigate('/discover')} icon={<ArrowRight className="h-4 w-4" />}>
            Open Discover People
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {weekly.map((m) => {
            const member = memberById(m.memberId)
            if (!member) return null
            return (
              <MemberCard
                key={m.memberId}
                member={member}
                match={m}
                connected={isConnected(m.memberId)}
                saved={isSavedMember(m.memberId)}
                onOpen={() => setFocusMemberId(m.memberId)}
                onToggleConnect={() =>
                  isConnected(m.memberId) ? removeConnection(m.memberId) : addConnection(m.memberId, 'home')
                }
                onToggleSave={() => toggleSavedMember(m.memberId)}
                onDismiss={() => dismissMember(m.memberId)}
              />
            )
          })}
          {weekly.length === 0 ? (
            <Card className="p-5 sm:col-span-2 lg:col-span-3">
              <p className="text-[13.5px] text-muted">
                You have connected with everyone Milaap suggested. Open Discover People to restore dismissed suggestions or
                reset your filters.
              </p>
              <Button className="mt-3" size="sm" variant="secondary" onClick={() => navigate('/discover')}>
                Go to Discover People
              </Button>
            </Card>
          ) : null}
        </div>
      </section>

      {/* ------------------------ upcoming activities --------------------- */}
      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Upcoming activities near you"
            subtitle="Titles, places and participants are demonstration data."
            icon={<LayoutGrid className="h-4 w-4" />}
            action={
              <Button size="sm" variant="ghost" onClick={() => navigate('/activities')}>
                View all
              </Button>
            }
          />
          <ul className="divide-y divide-line px-5 pb-2">
            {upcoming.map((a) => (
              <li key={a.id} className="flex items-start gap-3 py-3">
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-ink">
                  <ActivityIcon category={a.category} />
                </span>
                <div className="min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => navigate(`/activities?focus=${a.id}`)}
                    className="text-left text-[14px] font-semibold text-ink hover:underline"
                  >
                    {a.title}
                  </button>
                  <p className="mt-0.5 text-[12.5px] text-muted">
                    {a.scheduledAt ? formatDateTime(a.scheduledAt) : 'Not scheduled'} · {humanDuration(a.durationMins)} ·{' '}
                    {a.community}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    {isJoined(a.id) ? <Badge tone="sage">Joined</Badge> : null}
                    {isSavedActivity(a.id) ? <Badge tone="blue">Saved</Badge> : null}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={isJoined(a.id) ? 'soft' : 'secondary'}
                  onClick={() => (isJoined(a.id) ? leaveActivity(a.id) : joinActivity(a.id))}
                >
                  {isJoined(a.id) ? 'Leave' : 'Join'}
                </Button>
              </li>
            ))}
            {upcoming.length === 0 ? (
              <li className="py-6 text-center text-[13.5px] text-muted">
                Nothing scheduled yet. Browse Activities to find a 20-minute meet-up.
              </li>
            ) : null}
          </ul>
        </Card>

        {/* personalised picks */}
        <Card>
          <CardHeader
            title="Picked for your interests"
            subtitle="Ranked against your interests, skills and preferred activities."
            icon={<Sparkles className="h-4 w-4" />}
            action={
              <Button size="sm" variant="ghost" onClick={() => navigate('/activities')}>
                Browse
              </Button>
            }
          />
          <ul className="divide-y divide-line px-5 pb-2">
            {personalisedActivities.map((a) => (
              <li key={a.id} className="flex items-start gap-3 py-3">
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface2 text-muted">
                  <ActivityIcon category={a.category} />
                </span>
                <div className="min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => navigate(`/activities?focus=${a.id}`)}
                    className="text-left text-[14px] font-semibold text-ink hover:underline"
                  >
                    {a.title}
                  </button>
                  <p className="mt-0.5 text-[12.5px] text-muted">
                    {a.category} · {a.place}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {a.interestTags.slice(0, 3).map((t) => (
                      <Badge key={t} tone={profile.interests.includes(t) ? 'sage' : 'neutral'}>
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => toggleSavedActivity(a.id)}
                  aria-label={isSavedActivity(a.id) ? `Unsave ${a.title}` : `Save ${a.title}`}
                >
                  {isSavedActivity(a.id) ? 'Saved' : 'Save'}
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* --------------------- suggested skill exchanges ------------------ */}
      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader
            title="Suggested skill exchanges"
            subtitle="Complementary pairs from your teach and learn lists."
            icon={<Repeat2 className="h-4 w-4" />}
            action={
              <Button size="sm" variant="ghost" onClick={() => navigate('/skills?tab=matches')}>
                Skill matches
              </Button>
            }
          />
          <div className="space-y-3 px-5 pb-5">
            {skillMatches.map((sm) => {
              const member = memberById(sm.memberId)
              if (!member) return null
              return (
                <div key={sm.memberId} className="rounded-xl border border-line bg-surface2/50 p-3.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[13.5px] font-bold text-ink">{member.name}</span>
                    <Badge tone="sage">{sm.score}% skill fit</Badge>
                  </div>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <p className="text-[12.5px] leading-snug text-muted">
                      <span className="font-semibold text-ink">You teach them: </span>
                      {sm.iTeachThem.join(', ') || '—'}
                    </p>
                    <p className="text-[12.5px] leading-snug text-muted">
                      <span className="font-semibold text-ink">They teach you: </span>
                      {sm.theyTeachMe.join(', ') || '—'}
                    </p>
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    <Button size="sm" variant="secondary" onClick={() => navigate(`/skills?tab=matches`)}>
                      See the swap plan
                    </Button>
                    <Button size="sm" icon={<CalendarPlus className="h-4 w-4" />} onClick={() => setPlanFor(member.id)}>
                      Plan 20 minutes
                    </Button>
                  </div>
                </div>
              )
            })}
            {suggestedSkills.length === 0 && skillMatches.length === 0 ? (
              <p className="text-[13.5px] text-muted">
                Add skills you can teach and want to learn in your profile to unlock complementary matches.
              </p>
            ) : null}
          </div>
        </Card>

        {/* recent connection activity */}
        <Card>
          <CardHeader title="Recent activity" subtitle="Generated by your own local actions." icon={<CheckCircle2 className="h-4 w-4" />} />
          <ol className="space-y-3 px-5 pb-5">
            {timeline.map((event) => (
              <li key={event.id} className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" aria-hidden />
                <div className="min-w-0">
                  <p className="text-[13.5px] font-medium leading-snug text-ink">{event.label}</p>
                  <p className="mt-0.5 text-[12px] text-muted">
                    {event.detail} · {relativeTime(event.at)}
                  </p>
                  <Link to={event.to} className="mt-0.5 inline-block text-[12px] font-semibold text-accent-ink hover:underline">
                    Open
                  </Link>
                </div>
              </li>
            ))}
            {timeline.length === 0 ? (
              <li className="text-[13.5px] text-muted">
                No activity yet. Add a connection or join an activity and it will show up here.
              </li>
            ) : null}
          </ol>
        </Card>
      </section>

      {/* --------------------------- challenges --------------------------- */}
      <section>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-[17px] font-bold text-ink">Community challenges in {activeCommunity.split(',')[0]}</h2>
            <p className="mt-0.5 text-[13px] text-muted">
              Local, finishable projects with a task list you can tick off yourself.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => navigate('/community')} icon={<ArrowRight className="h-4 w-4" />}>
            Community hub
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {communityChallenges.map((c) => (
            <ChallengeCard
              key={c.id}
              challenge={c}
              saved={isSavedChallenge(c.id)}
              onOpen={() => navigate(`/community?challenge=${c.id}`)}
              onToggleJoin={() => toggleChallengeJoin(c.id)}
              onToggleTask={(taskId) => toggleTask(c.id, taskId)}
              onToggleSave={() => toggleSaveChallenge(c.id)}
            />
          ))}
          {communityChallenges.length === 0 ? (
            <Card className="p-5 sm:col-span-2">
              <p className="text-[13.5px] text-muted">
                No sample challenges for this community yet — create the first one from the Community page.
              </p>
              <Button className="mt-3" size="sm" onClick={() => navigate('/community')}>
                Create a challenge
              </Button>
            </Card>
          ) : null}
        </div>
      </section>

      {/* ------------------------- bottom helpers ------------------------- */}
      <section className="grid gap-3 sm:grid-cols-3">
        <Card className="p-5">
          <h3 className="flex items-center gap-2 text-[14px] font-bold text-ink">
            <X className="h-4 w-4 text-muted" aria-hidden /> Not a feed
          </h3>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
            There are no followers, no likes and no infinite scroll. You get a short list of people and a reason to meet.
          </p>
        </Card>
        <Card className="p-5">
          <h3 className="flex items-center gap-2 text-[14px] font-bold text-ink">
            <CalendarPlus className="h-4 w-4 text-muted" aria-hidden /> Twenty minutes is enough
          </h3>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
            Every suggested activity can be done in a short slot — a walk, a chai, one spreadsheet formula, one cake.
          </p>
        </Card>
        <Card className="p-5">
          <h3 className="flex items-center gap-2 text-[14px] font-bold text-ink">
            <MatchRing score={weekly[0]?.score ?? 72} size={18} label="example match" /> Explainable matching
          </h3>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
            Match scores come from a readable local algorithm — shared interests, complementary skills, shared activity
            preferences.
          </p>
        </Card>
      </section>

      <ProfileDetailModal
        member={focusMember ?? null}
        open={Boolean(focusMember)}
        onClose={() => setFocusMemberId(null)}
        onPlanActivity={(id) => {
          setFocusMemberId(null)
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
