import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  CalendarDays,
  CheckCircle2,
  HeartHandshake,
  Info,
  Lightbulb,
  MessagesSquare,
  Plus,
  RotateCcw,
  Search,
  Users,
  UsersRound,
  Wrench,
} from 'lucide-react'
import { useMilaap, useDocumentTitle } from '../hooks'
import type { ActivityCategory, CommunityChallenge } from '../types'
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  Notice,
  SectionHeading,
} from '../components/ui/primitives'
import { Tabs } from '../components/ui/Tabs'
import { ChallengeCard } from '../components/cards/ChallengeCard'
import { ChallengeBoardModal } from '../components/ChallengeBoardModal'
import { ChallengeFormModal } from '../components/forms/ChallengeFormModal'
import { CommunityCalendar } from '../components/CommunityCalendar'
import { CommunitySelector } from '../components/CommunitySelector'
import { ActivityIcon } from '../components/ui/CategoryIcon'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { PlanActivityModal } from '../components/PlanActivityModal'
import { StatCard } from '../components/cards/StatCard'
import { formatDateTime, humanDuration, relativeTime } from '../utils/date'
import { percent, pluralise } from '../utils/helpers'

interface DiscussionPrompt {
  id: string
  prompt: string
  why: string
  interestTag: string
  activityType: ActivityCategory
}

const DISCUSSION_PROMPTS: DiscussionPrompt[] = [
  {
    id: 'p1',
    prompt: 'What is one thing in our lane that everybody complains about but nobody has fixed?',
    why: 'Turns grumbling into a short, finishable local fix with a clear owner.',
    interestTag: 'Environment',
    activityType: 'Fix One Local Problem',
  },
  {
    id: 'p2',
    prompt: 'Which elder in your building has a skill nobody has bothered to learn from?',
    why: 'A gentle way to start an intergenerational skill swap.',
    interestTag: 'Storytelling',
    activityType: 'Skill Swap',
  },
  {
    id: 'p3',
    prompt: 'What is one dish from your family that should be written down before it is forgotten?',
    why: 'Food is the lowest-pressure reason to sit down with a stranger.',
    interestTag: 'Cooking',
    activityType: 'Recipe Exchange',
  },
  {
    id: 'p4',
    prompt: 'Name a place within a ten-minute walk where you feel genuinely welcome.',
    why: 'Useful for suggesting meeting places that already work for people.',
    interestTag: 'Walking',
    activityType: 'Community Walk',
  },
  {
    id: 'p5',
    prompt: 'What would make the evenings here feel safer for everyone?',
    why: 'Feeds the street-light and safe-walk challenges with concrete tasks.',
    interestTag: 'Fitness',
    activityType: 'Neighbourhood Volunteering',
  },
  {
    id: 'p6',
    prompt: 'If you taught one twenty-minute thing to your neighbours, what would it be?',
    why: 'The fastest way to fill the Skill Exchange with real offers.',
    interestTag: 'Technology',
    activityType: 'Digital Help Hour',
  },
]

export function CommunityPage() {
  useDocumentTitle('Community')
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const {
    challenges,
    toggleChallengeJoin,
    toggleTask,
    toggleSaveChallenge,
    isSavedChallenge,
    deleteChallenge,
    activities,
    isJoined,
    joinActivity,
    isSavedActivity,
    toggleSavedActivity,
    activeCommunity,
    stats,
    members,
    leaveActivity,
  } = useMilaap()

  const [tab, setTab] = useState(params.get('tab') ?? 'overview')
  const [boardId, setBoardId] = useState<string | null>(params.get('challenge'))
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<CommunityChallenge | null>(null)
  const [pendingDelete, setPendingDelete] = useState<CommunityChallenge | null>(null)
  const [challengeQuery, setChallengeQuery] = useState('')
  const [planPrompt, setPlanPrompt] = useState<DiscussionPrompt | null>(null)

  useEffect(() => {
    const focus = params.get('challenge')
    if (focus) setBoardId(focus)
    const t = params.get('tab')
    if (t) setTab(t)
  }, [params])

  const closeBoard = () => {
    setBoardId(null)
    if (params.get('challenge')) {
      params.delete('challenge')
      setParams(params, { replace: true })
    }
  }

  const communityChallenges = useMemo(
    () => challenges.filter((c) => c.community === activeCommunity),
    [challenges, activeCommunity],
  )

  const communityActivities = useMemo(
    () => activities.filter((a) => a.community === activeCommunity),
    [activities, activeCommunity],
  )

  const filteredChallenges = useMemo(() => {
    const q = challengeQuery.trim().toLowerCase()
    const base = tab === 'volunteering' ? communityChallenges.filter((c) => isVolunteeringCategory(c.category)) : communityChallenges
    if (!q) return base
    return base.filter((c) => `${c.title} ${c.goal} ${c.description} ${c.category}`.toLowerCase().includes(q))
  }, [communityChallenges, challengeQuery, tab])

  const volunteeringActivities = useMemo(
    () =>
      communityActivities.filter(
        (a) => a.category === 'Neighbourhood Volunteering' || a.category === 'Fix One Local Problem',
      ),
    [communityActivities],
  )

  const overviewEvents = useMemo(() => {
    const fromActivities = communityActivities
      .filter((a) => a.scheduledAt)
      .map((a) => ({ id: `a-${a.id}`, title: a.title, at: a.scheduledAt as string, type: 'activity' as const }))
    const all = [...fromActivities].sort((x, y) => x.at.localeCompare(y.at))
    return all.slice(0, 4)
  }, [communityActivities])

  const board = boardId ? challenges.find((c) => c.id === boardId) ?? null : null

  const contributors = useMemo(
    () => members.filter((m) => m.community === activeCommunity).slice(0, 6),
    [members, activeCommunity],
  )

  const tasksCompleted = stats.tasksCompleted
  const sampleParticipants = communityChallenges.reduce((sum, c) => sum + c.sampleParticipants, 0)

  const promptMembers = (prompt: DiscussionPrompt) =>
    members
      .filter((m) => m.interests.includes(prompt.interestTag) || m.preferredActivities.includes(prompt.activityType))
      .slice(0, 4)

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge tone="sage" icon={<UsersRound className="h-3 w-3" />}>
            Community
          </Badge>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-ink sm:text-[28px]">Your neighbourhood, together</h1>
          <p className="mt-1.5 max-w-2xl text-[14px] leading-relaxed text-muted">
            Local events, volunteering, discussion prompts and a board of small problems worth fixing. Everything here is
            demonstration data you can join, tick off and reshape.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <CommunitySelector className="min-w-[15rem]" compact />
          <Button
            icon={<Plus className="h-4 w-4" />}
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
          >
            Create challenge
          </Button>
        </div>
      </header>

      <Tabs
        value={tab}
        onChange={setTab}
        label="Community sections"
        options={[
          { id: 'overview', label: 'Overview' },
          { id: 'challenges', label: 'Challenges', count: communityChallenges.length },
          { id: 'calendar', label: 'Calendar' },
          { id: 'volunteering', label: 'Volunteering', count: volunteeringActivities.length },
          { id: 'board', label: 'Discussion & local board' },
        ]}
      />

      {tab === 'overview' ? (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Challenges in this area" value={communityChallenges.length} hint="Sample projects you can join" icon={<Lightbulb className="h-4 w-4" />} />
            <StatCard label="Challenges you joined" value={stats.challengesJoined} hint="Stored in this browser" icon={<HeartHandshake className="h-4 w-4" />} />
            <StatCard label="Tasks you completed" value={tasksCompleted} hint={`${pluralise(stats.activitiesJoined, 'activity', 'activities')} joined`} icon={<CheckCircle2 className="h-4 w-4" />} />
            <StatCard label="Sample participants" value={sampleParticipants} hint="Seeded demonstration numbers" icon={<Users className="h-4 w-4" />} tone="neutral" />
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
            <Card>
              <CardHeader
                title={`What ${activeCommunity.split(',')[0]} is doing next`}
                subtitle="From the sample community calendar."
                icon={<CalendarDays className="h-4 w-4" />}
                action={
                  <Button size="sm" variant="ghost" onClick={() => setTab('calendar')}>
                    Open calendar
                  </Button>
                }
              />
              <ul className="divide-y divide-line px-5 pb-4">
                {overviewEvents.map((event) => (
                  <li key={event.id} className="flex items-start gap-3 py-3">
                    <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-ink">
                      <CalendarDays className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-semibold text-ink">{event.title}</p>
                      <p className="mt-0.5 text-[12.5px] text-muted">{formatDateTime(event.at)}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => toggleSavedActivity(event.id.replace('a-', ''))}
                      >
                        {isSavedActivity(event.id.replace('a-', '')) ? 'Saved' : 'Save'}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => navigate(`/activities?focus=${event.id.replace('a-', '')}`)}>
                        View
                      </Button>
                    </div>
                  </li>
                ))}
                {overviewEvents.length === 0 ? (
                  <li className="py-6 text-center text-[13.5px] text-muted">
                    Nothing scheduled in this community yet — browse all activities.
                  </li>
                ) : null}
              </ul>
            </Card>

            <Card>
              <CardHeader title="Community at a glance" subtitle="Demonstration data for this area." icon={<Info className="h-4 w-4" />} />
              <div className="space-y-3 px-5 pb-5">
                <div className="rounded-xl border border-line bg-surface2/50 p-3.5">
                  <p className="text-[13px] font-bold text-ink">Sample members nearby</p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {contributors.map((m) => (
                      <Link
                        key={m.id}
                        to={`/discover?focus=${m.id}`}
                        className="flex items-center gap-1.5 rounded-full border border-line bg-surface px-2 py-1 text-[12px] font-medium text-ink transition hover:border-accent/60"
                      >
                        <Avatar name={m.name} avatarId={m.avatarId} size="xs" className="h-6 w-6 text-[9px]" />
                        {m.name.split(' ')[0]}
                      </Link>
                    ))}
                    {contributors.length === 0 ? (
                      <p className="text-[12.5px] text-muted">No sample members in this community yet.</p>
                    ) : null}
                  </div>
                </div>
                <div className="rounded-xl border border-line bg-surface2/50 p-3.5">
                  <p className="text-[13px] font-bold text-ink">Your contribution so far</p>
                  <ul className="mt-1.5 space-y-1 text-[12.5px] text-muted">
                    <li>· {stats.connections} connections added</li>
                    <li>· {stats.activitiesJoined} activities joined</li>
                    <li>· {stats.tasksCompleted} community tasks completed</li>
                    <li>· {stats.skillsOffered} skills offered, {stats.skillsLearning} learning requests</li>
                  </ul>
                  <p className="mt-2 text-[11.5px] leading-relaxed text-muted">
                    Calculated from your own local data. Milaap does not measure or claim any real-world impact.
                  </p>
                </div>
                <div className="rounded-xl border border-line bg-surface2/50 p-3.5">
                  <p className="text-[13px] font-bold text-ink">Switch area</p>
                  <div className="mt-2">
                    <CommunitySelector />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <SectionHeading
            title="Challenges people are working on"
            subtitle="Join one, tick off tasks, or create your own version for this area."
            action={
              <Button size="sm" variant="secondary" onClick={() => setTab('challenges')}>
                See all challenges
              </Button>
            }
          />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {communityChallenges.slice(0, 3).map((c) => (
              <ChallengeCard
                key={c.id}
                challenge={c}
                saved={isSavedChallenge(c.id)}
                onOpen={() => setBoardId(c.id)}
                onToggleJoin={() => toggleChallengeJoin(c.id)}
                onToggleTask={(taskId) => toggleTask(c.id, taskId)}
                onToggleSave={() => toggleSaveChallenge(c.id)}
                onEdit={
                  c.createdBy === 'you'
                    ? () => {
                        setEditing(c)
                        setFormOpen(true)
                      }
                    : undefined
                }
                onDelete={c.createdBy === 'you' ? () => setPendingDelete(c) : undefined}
              />
            ))}
          </div>
        </div>
      ) : null}

      {tab === 'challenges' ? (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label htmlFor="challenge-search" className="sr-only">
                Search challenges
              </label>
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
                <input
                  id="challenge-search"
                  value={challengeQuery}
                  onChange={(e) => setChallengeQuery(e.target.value)}
                  placeholder="Search challenges in this community…"
                  className="ml-input pl-10"
                />
              </div>
              {challengeQuery ? (
                <Button variant="secondary" icon={<RotateCcw className="h-4 w-4" />} onClick={() => setChallengeQuery('')}>
                  Clear
                </Button>
              ) : null}
            </div>
            <p className="mt-3 border-t border-line pt-3 text-[12.5px] text-muted">
              {filteredChallenges.length} of {communityChallenges.length} challenges ·{' '}
              {communityChallenges.filter((c) => c.joined).length} joined by you
            </p>
          </Card>

          {filteredChallenges.length === 0 ? (
            <EmptyState
              icon={<Lightbulb className="h-6 w-6" />}
              title="No challenges here yet"
              description={`Nothing matches that search in ${activeCommunity}. Create the first local challenge for this area.`}
              action={
                <Button
                  icon={<Plus className="h-4 w-4" />}
                  onClick={() => {
                    setEditing(null)
                    setFormOpen(true)
                  }}
                >
                  Create challenge
                </Button>
              }
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {filteredChallenges.map((c) => (
                <ChallengeCard
                  key={c.id}
                  challenge={c}
                  saved={isSavedChallenge(c.id)}
                  onOpen={() => setBoardId(c.id)}
                  onToggleJoin={() => toggleChallengeJoin(c.id)}
                  onToggleTask={(taskId) => toggleTask(c.id, taskId)}
                  onToggleSave={() => toggleSaveChallenge(c.id)}
                  onEdit={
                    c.createdBy === 'you'
                      ? () => {
                          setEditing(c)
                          setFormOpen(true)
                        }
                      : undefined
                  }
                  onDelete={c.createdBy === 'you' ? () => setPendingDelete(c) : undefined}
                />
              ))}
            </div>
          )}
        </div>
      ) : null}

      {tab === 'calendar' ? <CommunityCalendar community={activeCommunity} /> : null}

      {tab === 'volunteering' ? (
        <div className="space-y-4">
          <Notice tone="info" icon={<HeartHandshake className="h-4 w-4" />} title="Volunteering with no strings">
            These are the sample volunteering and local-fix opportunities in {activeCommunity}. Joining one only updates your
            own browser data — no organiser is contacted.
          </Notice>

          <SectionHeading title="Volunteering activities" subtitle="Short, practical and usually over in ninety minutes." />
          {volunteeringActivities.length === 0 ? (
            <EmptyState
              icon={<HeartHandshake className="h-6 w-6" />}
              title="No volunteering activities in this area yet"
              description="Try another community, or create your own clean-up, help desk or repair clinic."
              action={
                <Button icon={<Plus className="h-4 w-4" />} onClick={() => navigate('/activities')}>
                  Create an activity
                </Button>
              }
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {volunteeringActivities.map((a) => (
                <Card key={a.id} className="flex flex-col p-4">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-ink">
                      <ActivityIcon category={a.category} className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[15px] font-bold leading-snug text-ink">{a.title}</h3>
                      <p className="mt-0.5 text-[12.5px] text-muted">
                        {a.scheduledAt ? formatDateTime(a.scheduledAt) : 'Not scheduled'} · {humanDuration(a.durationMins)} ·{' '}
                        {a.place}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 line-clamp-3 text-[13.5px] leading-relaxed text-muted">{a.description}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3">
                    <Button
                      size="sm"
                      variant={isJoined(a.id) ? 'soft' : 'primary'}
                      onClick={() => (isJoined(a.id) ? leaveActivity(a.id) : joinActivity(a.id))}
                    >
                      {isJoined(a.id) ? 'Joined' : 'Join demo activity'}
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => navigate(`/activities?focus=${a.id}`)}>
                      Details
                    </Button>
                    <Badge tone="neutral">{a.sampleParticipants} sample participants</Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <SectionHeading title="Volunteering task lists" subtitle="Tick off what you have actually finished." />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {communityChallenges
              .filter((c) => c.category === 'Environment' || c.category === 'Local Fix' || c.category === 'Digital Inclusion')
              .map((c) => (
                <ChallengeCard
                  key={c.id}
                  challenge={c}
                  saved={isSavedChallenge(c.id)}
                  onOpen={() => setBoardId(c.id)}
                  onToggleJoin={() => toggleChallengeJoin(c.id)}
                  onToggleTask={(taskId) => toggleTask(c.id, taskId)}
                  onToggleSave={() => toggleSaveChallenge(c.id)}
                />
              ))}
          </div>
        </div>
      ) : null}

      {tab === 'board' ? (
        <div className="space-y-5">
          <Notice tone="info" icon={<MessagesSquare className="h-4 w-4" />} title="Discussion prompts">
            Pick a prompt, see which sample neighbours it might interest, and turn it into a real twenty-minute conversation.
            Milaap never posts anything anywhere.
          </Notice>

          <div className="grid gap-3 sm:grid-cols-2">
            {DISCUSSION_PROMPTS.map((prompt) => {
              const interested = promptMembers(prompt)
              return (
                <Card key={prompt.id} className="flex flex-col p-4">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-ink">
                      <MessagesSquare className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="text-[14.5px] font-bold leading-snug text-ink">{prompt.prompt}</h3>
                      <p className="mt-1 text-[12.5px] leading-relaxed text-muted">{prompt.why}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    {interested.map((m) => (
                      <Link
                        key={m.id}
                        to={`/discover?focus=${m.id}`}
                        className="flex items-center gap-1.5 rounded-full border border-line bg-surface2 px-2 py-1 text-[11.5px] font-medium text-ink transition hover:border-accent/60"
                      >
                        <Avatar name={m.name} avatarId={m.avatarId} size="xs" className="h-5 w-5 text-[8px]" />
                        {m.name.split(' ')[0]}
                      </Link>
                    ))}
                    {interested.length === 0 ? (
                      <span className="text-[12px] text-muted">No sample members match this interest yet.</span>
                    ) : null}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 border-t border-line pt-3">
                    <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setPlanPrompt(prompt)}>
                      Plan a 20-minute table talk
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => navigate(`/activities?category=${encodeURIComponent(prompt.activityType)}`)}
                    >
                      See {prompt.activityType}
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>

          <SectionHeading
            title="Local problem-solving board"
            subtitle="Small, specific problems with a task list — the kind that actually get finished."
          />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {communityChallenges
              .filter((c) => c.category === 'Local Fix' || c.category === 'Environment')
              .map((c) => (
                <ChallengeCard
                  key={c.id}
                  challenge={c}
                  saved={isSavedChallenge(c.id)}
                  onOpen={() => setBoardId(c.id)}
                  onToggleJoin={() => toggleChallengeJoin(c.id)}
                  onToggleTask={(taskId) => toggleTask(c.id, taskId)}
                  onToggleSave={() => toggleSaveChallenge(c.id)}
                  onEdit={
                    c.createdBy === 'you'
                      ? () => {
                          setEditing(c)
                          setFormOpen(true)
                        }
                      : undefined
                  }
                  onDelete={c.createdBy === 'you' ? () => setPendingDelete(c) : undefined}
                />
              ))}
          </div>
          <Card className="p-5">
            <h3 className="flex items-center gap-2 text-[15px] font-bold text-ink">
              <Wrench className="h-4 w-4 text-accent" aria-hidden /> Add your own local problem
            </h3>
            <p className="mt-1 text-[13px] leading-relaxed text-muted">
              Turn it into a challenge with a measurable goal and a task list. Anything you add stays in this browser and is
              clearly labelled as created by you.
            </p>
            <Button
              className="mt-3"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => {
                setEditing(null)
                setFormOpen(true)
              }}
            >
              Add a local problem
            </Button>
          </Card>
        </div>
      ) : null}

      <ChallengeBoardModal
        challenge={board}
        open={Boolean(board)}
        onClose={closeBoard}
        onEdit={(c) => {
          closeBoard()
          setEditing(c)
          setFormOpen(true)
        }}
        onDelete={(c) => {
          closeBoard()
          setPendingDelete(c)
        }}
      />

      <ChallengeFormModal open={formOpen} onClose={() => setFormOpen(false)} editing={editing} />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        destructive
        title="Delete this challenge?"
        message={<>“{pendingDelete?.title}” and its task list will be removed from your local data.</>}
        confirmLabel="Delete challenge"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) deleteChallenge(pendingDelete.id)
          setPendingDelete(null)
        }}
      />

      <PlanActivityModal
        open={Boolean(planPrompt)}
        onClose={() => setPlanPrompt(null)}
        defaultActivityType={planPrompt?.activityType ?? 'Chai & Chat'}
        defaultTitle={planPrompt ? planPrompt.prompt.slice(0, 60) : undefined}
        defaultDuration={20}
        onCreated={() => navigate('/schedule')}
      />

      <Card className="p-5">
        <h3 className="text-[15px] font-bold text-ink">Recently active in your community</h3>
        <ul className="mt-3 space-y-3">
          {[...challenges]
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            .slice(0, 3)
            .map((c) => (
              <li key={c.id} className="flex items-start gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" aria-hidden />
                <div>
                  <p className="text-[13.5px] font-medium text-ink">{c.title}</p>
                  <p className="text-[12px] text-muted">
                    {c.tasks.filter((t) => t.done).length}/{c.tasks.length} tasks ·{' '}
                    {percent(c.tasks.filter((t) => t.done).length, c.tasks.length || 1)}% · added {relativeTime(c.createdAt)}
                  </p>
                </div>
                <Button size="sm" variant="ghost" className="ml-auto" onClick={() => setBoardId(c.id)}>
                  Open
                </Button>
              </li>
            ))}
        </ul>
      </Card>
    </div>
  )
}

function isVolunteeringCategory(category: CommunityChallenge['category']): boolean {
  return category === 'Environment' || category === 'Digital Inclusion' || category === 'Local Fix'
}

