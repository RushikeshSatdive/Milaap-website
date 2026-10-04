import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Accessibility,
  CalendarPlus,
  Check,
  Clock,
  HeartHandshake,
  Languages,
  Pencil,
  Repeat2,
  RotateCcw,
  Sparkles,
  UserCircle2,
  Users,
} from 'lucide-react'
import { useMilaap, useDocumentTitle } from '../hooks'
import { Avatar, Badge, Button, Card, CardHeader, EmptyState, Notice, ProgressBar, SectionHeading } from '../components/ui/primitives'
import { StatCard } from '../components/cards/StatCard'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { computeProfileCompletion } from '../utils/profile'
import { findSkillMatches } from '../utils/matching'
import { formatDayLabel, formatTime24, relativeTime } from '../utils/date'

export function ProfilePage() {
  useDocumentTitle('My Profile')
  const navigate = useNavigate()
  const {
    profile,
    stats,
    resetProfile,
    skillListings,
    members,
    memberById,
    connections,
    invitations,
    challenges,
    activities,
    isJoined,
    savedMemberIds,
    savedActivityIds,
    savedChallengeIds,
  } = useMilaap()

  const [confirmReset, setConfirmReset] = useState(false)

  const completion = useMemo(() => computeProfileCompletion(profile), [profile])
  const swappedSkills = useMemo(
    () =>
      members.map((m) => ({ member: m, match: findSkillMatches(profile, [m])[0] })).filter((x) => x.match),
    [members, profile],
  )

  const myListings = skillListings.filter((l) => l.createdBy === 'you')
  const plannedInvites = invitations.filter((i) => i.status === 'planned')

  return (
    <div className="space-y-5">
      {/* ---------------- header ---------------- */}
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-5 bg-gradient-to-br from-accent-soft/70 to-transparent p-5 sm:flex-row sm:items-start">
          <Avatar name={profile.name || 'You'} avatarId={profile.avatarId} size="xl" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-ink">{profile.name || 'Unnamed profile'}</h1>
              {completion.complete ? (
                <Badge tone="sage" icon={<Check className="h-3 w-3" />}>
                  Profile complete
                </Badge>
              ) : (
                <Badge tone="amber">{completion.percent}% complete</Badge>
              )}
            </div>
            <p className="mt-1 text-[13.5px] text-muted">
              {profile.community}
              {profile.ageRange ? ` · ${profile.ageRange}` : ''}
            </p>
            {profile.bio ? (
              <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-muted">{profile.bio}</p>
            ) : (
              <p className="mt-2 text-[14px] text-muted">
                No introduction yet. Two sentences about what you would like to do around here is plenty.
              </p>
            )}
            <p className="mt-1.5 text-[12px] text-muted">
              Last updated {relativeTime(profile.updatedAt)} · stored only in this browser
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button icon={<Pencil className="h-4 w-4" />} onClick={() => navigate('/profile/edit')}>
                Edit profile
              </Button>
              <Button variant="secondary" icon={<CalendarPlus className="h-4 w-4" />} onClick={() => navigate('/schedule')}>
                My schedule
              </Button>
              <Button variant="ghost" icon={<RotateCcw className="h-4 w-4" />} onClick={() => setConfirmReset(true)}>
                Restore sample profile
              </Button>
            </div>
          </div>

          <div className="w-full shrink-0 rounded-2xl border border-line bg-surface/80 p-4 sm:w-64">
            <ProgressBar
              value={completion.percent}
              label="Profile completion"
              hint={`${completion.percent}%`}
            />
            <ul className="mt-3 space-y-1.5">
              {completion.checks.slice(0, 6).map((c) => (
                <li key={c.key} className="flex items-center gap-2 text-[12.5px] text-muted">
                  <span className={c.done ? 'text-accent' : 'text-muted/60'}>
                    {c.done ? <Check className="h-3.5 w-3.5" /> : <span className="block h-3.5 w-3.5 rounded-full border border-line" />}
                  </span>
                  <span className={c.done ? 'line-through' : undefined}>{c.label}</span>
                </li>
              ))}
            </ul>
            {completion.missing.length > 0 ? (
              <Button className="mt-3" size="sm" variant="secondary" fullWidth onClick={() => navigate('/profile/edit')}>
                Finish the rest
              </Button>
            ) : null}
          </div>
        </div>
      </Card>

      {/* ---------------- contribution ---------------- */}
      <section>
        <SectionHeading
          title="Your contribution, counted locally"
          subtitle="Every number below is derived from your own browser data — nothing is measured on a server."
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Connections" value={stats.connections} hint={`${savedMemberIds.length} bookmarked`} icon={<Users className="h-4 w-4" />} to="/connections" />
          <StatCard label="Activities joined" value={stats.activitiesJoined} hint={`${savedActivityIds.length} saved for later`} icon={<CalendarPlus className="h-4 w-4" />} to="/activities" />
          <StatCard label="Meet-ups planned" value={stats.invitationsPlanned} hint={`${stats.invitationsCompleted} already completed`} icon={<Clock className="h-4 w-4" />} to="/schedule" />
          <StatCard label="Community tasks done" value={stats.tasksCompleted} hint={`${stats.challengesJoined} challenges joined`} icon={<HeartHandshake className="h-4 w-4" />} to="/community" />
        </div>
      </section>

      {/* ---------------- profile details ---------------- */}
      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Interests & hobbies"
            subtitle="Used by the matching engine when it ranks people and activities."
            icon={<Sparkles className="h-4 w-4" />}
            action={
              <Button size="sm" variant="ghost" onClick={() => navigate('/profile/edit')}>
                Edit
              </Button>
            }
          />
          <div className="flex flex-wrap gap-1.5 px-5 pb-5">
            {profile.interests.map((i) => (
              <Badge key={i} tone="sage">
                {i}
              </Badge>
            ))}
            {profile.hobbies
              .filter((h) => !profile.interests.includes(h))
              .map((h) => (
                <Badge key={h} tone="neutral">
                  {h}
                </Badge>
              ))}
            {profile.interests.length === 0 && profile.hobbies.length === 0 ? (
              <p className="text-[13.5px] text-muted">No interests added yet.</p>
            ) : null}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Skills"
            subtitle="You can teach these, and these are the things you want to learn."
            icon={<Repeat2 className="h-4 w-4" />}
            action={
              <Button size="sm" variant="ghost" onClick={() => navigate('/skills')}>
                Skill Exchange
              </Button>
            }
          />
          <div className="space-y-3 px-5 pb-5">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-wide text-muted">I can share</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {profile.teachSkills.map((s) => (
                  <Badge key={s} tone="sage">
                    {s}
                  </Badge>
                ))}
                {profile.teachSkills.length === 0 ? <span className="text-[13px] text-muted">Nothing yet.</span> : null}
              </div>
            </div>
            <div>
              <p className="text-[12px] font-bold uppercase tracking-wide text-muted">I want to learn</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {profile.learnSkills.map((s) => (
                  <Badge key={s} tone="blue">
                    {s}
                  </Badge>
                ))}
                {profile.learnSkills.length === 0 ? <span className="text-[13px] text-muted">Nothing yet.</span> : null}
              </div>
            </div>
            <p className="text-[12.5px] leading-relaxed text-muted">
              {swappedSkills.length > 0
                ? `Milaap found ${swappedSkills.length} complementary ${swappedSkills.length === 1 ? 'match' : 'matches'} — open the Skill Exchange to see the swap plans.`
                : 'No complementary matches yet. Adding one more skill to either list usually fixes that.'}
            </p>
          </div>
        </Card>

        <Card>
          <CardHeader title="Languages & activity preferences" icon={<Languages className="h-4 w-4" />} />
          <div className="space-y-3 px-5 pb-5">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-wide text-muted">Languages</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {profile.languages.map((l) => (
                  <Badge key={l} tone="neutral">
                    {l}
                  </Badge>
                ))}
                {profile.languages.length === 0 ? <span className="text-[13px] text-muted">Not specified.</span> : null}
              </div>
            </div>
            <div>
              <p className="text-[12px] font-bold uppercase tracking-wide text-muted">Preferred activities</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {profile.preferredActivities.map((a) => (
                  <Badge key={a} tone="sage">
                    {a}
                  </Badge>
                ))}
                {profile.preferredActivities.length === 0 ? <span className="text-[13px] text-muted">Not specified.</span> : null}
              </div>
            </div>
            <div>
              <p className="text-[12px] font-bold uppercase tracking-wide text-muted">Usual availability</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {profile.availability.map((a) => (
                  <Badge key={a} tone="outline">
                    {a}
                  </Badge>
                ))}
                {profile.availability.length === 0 ? <span className="text-[13px] text-muted">Not specified.</span> : null}
              </div>
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-muted">
                <Accessibility className="h-3.5 w-3.5" aria-hidden /> Accessibility preferences
              </p>
              <p className="mt-1 text-[13px] text-ink">{profile.accessibility?.trim() || 'Not specified'}</p>
              <p className="mt-1 text-[11.5px] text-muted">
                Optional. Milaap uses this only to suggest suitable venues — it never asks for a home address.
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="My local listings & plans" subtitle="Created by you, editable at any time." icon={<UserCircle2 className="h-4 w-4" />} />
          <div className="space-y-3 px-5 pb-5">
            {myListings.length === 0 ? (
              <p className="text-[13.5px] text-muted">You have not created a skill listing yet.</p>
            ) : (
              <ul className="space-y-2">
                {myListings.slice(0, 4).map((l) => (
                  <li key={l.id} className="flex items-center gap-2 rounded-xl border border-line bg-surface2/50 p-2.5">
                    <Badge tone={l.type === 'offer' ? 'sage' : 'blue'}>{l.type === 'offer' ? 'Teaching' : 'Learning'}</Badge>
                    <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-ink">{l.skill}</span>
                    <Link to="/skills?tab=mine" className="text-[12.5px] font-semibold text-accent-ink hover:underline">
                      Manage
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            <div className="rounded-xl border border-line bg-surface2/50 p-3">
              <p className="text-[12.5px] font-bold uppercase tracking-wide text-muted">Upcoming demo invitations</p>
              {plannedInvites.length === 0 ? (
                <p className="mt-1 text-[13px] text-muted">Nothing planned. Create one from My Schedule.</p>
              ) : (
                <ul className="mt-1.5 space-y-1.5">
                  {plannedInvites.slice(0, 3).map((inv) => (
                    <li key={inv.id} className="text-[13px] text-muted">
                      <Link to={`/schedule?focus=${inv.id}`} className="font-medium text-ink hover:underline">
                        {inv.title}
                      </Link>{' '}
                      · {formatDayLabel(inv.date)} at {formatTime24(inv.time)} with{' '}
                      {memberById(inv.memberId)?.name ?? 'a connection'}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-xl border border-line bg-surface2/50 p-3">
              <p className="text-[12.5px] font-bold uppercase tracking-wide text-muted">Challenges you joined</p>
              {challenges.filter((c) => c.joined).length === 0 ? (
                <p className="mt-1 text-[13px] text-muted">No challenges joined yet.</p>
              ) : (
                <ul className="mt-1.5 space-y-1.5">
                  {challenges
                    .filter((c) => c.joined)
                    .slice(0, 3)
                    .map((c) => (
                      <li key={c.id} className="text-[13px] text-muted">
                        <Link to={`/community?challenge=${c.id}`} className="font-medium text-ink hover:underline">
                          {c.title}
                        </Link>{' '}
                        · {c.tasks.filter((t) => t.done).length}/{c.tasks.length} tasks done
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </div>
        </Card>
      </section>

      <Notice tone="warning" title="What this page does not claim">
        These figures only count what you clicked in this browser. Milaap does not claim social impact, does not report
        outcomes to anyone, and does not know whether a meet-up actually happened. Marking something complete is your own
        bookkeeping — it is never presented as proof that another person attended.
      </Notice>

      {connections.length === 0 && activities.length > 0 ? (
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title="No connections yet"
          description="Your profile is set up. The quickest next step is adding two or three people from Discover People."
          action={
            <>
              <Button onClick={() => navigate('/discover')}>Discover People</Button>
              <Button variant="secondary" onClick={() => navigate('/activities')}>
                Find an activity
              </Button>
            </>
          }
        />
      ) : null}

      <Card className="p-5">
        <h2 className="text-[15px] font-bold text-ink">Data facts for this profile</h2>
        <ul className="mt-2 grid gap-1.5 text-[13px] leading-relaxed text-muted sm:grid-cols-2">
          <li>· Stored under the localStorage key <code className="rounded bg-surface2 px-1">milaap:data:v1</code></li>
          <li>· No account, no password, no email address collected</li>
          <li>· No precise home address is ever requested</li>
          <li>· Saved activities: {savedActivityIds.length} · saved challenges: {savedChallengeIds.length}</li>
          <li>· Unread notifications: {stats.activeNotifications}</li>
          <li>· Joined activities: {activities.filter((a) => isJoined(a.id)).length} of {activities.length} sample activities</li>
        </ul>
        <p className="mt-3 text-[12px] text-muted">
          You can export all of this as JSON or wipe it from{' '}
          <Link to="/settings" className="font-semibold text-accent-ink underline decoration-dotted">
            Settings
          </Link>
          . Browser storage is not encrypted, so please do not put sensitive information in it.
        </p>
      </Card>

      <ConfirmDialog
        open={confirmReset}
        destructive
        title="Restore the sample profile?"
        message="Your name, bio, interests, skills and preferences will be replaced with the original demonstration profile. Connections, activities and challenges are not affected."
        confirmLabel="Restore sample profile"
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          resetProfile()
          setConfirmReset(false)
        }}
      />
    </div>
  )
}
