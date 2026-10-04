import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Bookmark,
  BookmarkCheck,
  CalendarPlus,
  Check,
  Clock,
  Languages,
  MapPin,
  MessageCircleQuestion,
  Repeat,
  Sparkles,
  UserMinus,
  UserPlus,
  Wand2,
} from 'lucide-react'
import type { Activity, CommunityMember } from '../types'
import { useMilaap } from '../hooks'
import { Avatar, Badge, Button, Card, Notice } from './ui/primitives'
import { Modal } from './ui/Modal'
import { MatchRing } from './cards/MemberCard'
import { ActivityIcon } from './ui/CategoryIcon'
import { conversationStarters, swapPlan } from '../utils/conversation'
import { recommendActivities } from '../utils/matching'
import { formatDateTime } from '../utils/date'

export interface ProfileDetailModalProps {
  member: CommunityMember | null
  open: boolean
  onClose: () => void
  onPlanActivity: (memberId: string) => void
  /** Optional callback when a shift to another profile happens from inside. */
  onNavigate?: (memberId: string) => void
}

export function ProfileDetailModal({
  member,
  open,
  onClose,
  onPlanActivity,
}: ProfileDetailModalProps) {
  const {
    profile,
    matchFor,
    isConnected,
    addConnection,
    removeConnection,
    isSavedMember,
    toggleSavedMember,
    activities,
    skillListings,
  } = useMilaap()

  const match = member ? matchFor(member.id) : undefined

  const starters = useMemo(
    () => (member ? conversationStarters(profile, member, match) : []),
    [member, profile, match],
  )

  const recommended: Activity[] = useMemo(
    () => (member ? recommendActivities(profile, activities, member, 3) : []),
    [member, profile, activities],
  )

  const complementary = useMemo(() => {
    if (!member || !match) return []
    return [
      ...match.theyTeachIWant.map((s) => ({ skill: s, direction: 'they teach you' as const })),
      ...match.iTeachTheyWant.map((s) => ({ skill: s, direction: 'you teach them' as const })),
    ]
  }, [member, match])

  const theirListings = useMemo(
    () => (member ? skillListings.filter((l) => l.memberId === member.id) : []),
    [member, skillListings],
  )

  if (!member) return null

  const connected = isConnected(member.id)
  const saved = isSavedMember(member.id)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={member.name}
      description="Sample community profile — demonstration data only."
      size="lg"
      bare
      footer={
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            className="sm:flex-1"
            icon={<CalendarPlus className="h-4 w-4" />}
            onClick={() => onPlanActivity(member.id)}
          >
            Plan an activity with {member.name.split(' ')[0]}
          </Button>
          <Button
            variant={connected ? 'secondary' : 'soft'}
            icon={connected ? <UserMinus className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
            onClick={() => (connected ? removeConnection(member.id) : addConnection(member.id, 'discover'))}
          >
            {connected ? 'Remove connection' : 'Add to My Connections'}
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={() => toggleSavedMember(member.id)}
            aria-label={saved ? 'Remove bookmark' : 'Bookmark this profile'}
            icon={saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          />
        </div>
      }
    >
      <div className="space-y-4">
        {/* header */}
        <div className="rounded-2xl border border-line bg-gradient-to-br from-accent-soft/70 to-transparent p-4">
          <div className="flex flex-wrap items-start gap-4">
            <Avatar name={member.name} avatarId={member.avatarId} size="lg" />
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-extrabold text-ink">{member.name}</h2>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" aria-hidden /> {member.community}
                </span>
                {member.ageRange ? (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" aria-hidden /> {member.ageRange}
                  </span>
                ) : null}
                <span className="flex items-center gap-1">
                  <Languages className="h-3.5 w-3.5" aria-hidden /> {member.languages.join(', ')}
                </span>
              </p>
              <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{member.bio}</p>
            </div>
            {match ? (
              <div className="flex flex-col items-center gap-1">
                <MatchRing score={match.score} size={62} />
                <span className="text-[11px] font-semibold text-muted">match score</span>
              </div>
            ) : null}
          </div>
          {member.accessibility && member.accessibility !== 'None needed' ? (
            <p className="mt-3 text-[12.5px] text-muted">
              <span className="font-semibold text-ink">Accessibility: </span>
              {member.accessibility}
            </p>
          ) : null}
        </div>

        {/* why this match */}
        <Card className="p-4">
          <h3 className="flex items-center gap-2 text-[14px] font-bold text-ink">
            <Sparkles className="h-4 w-4 text-accent" aria-hidden /> Why this match?
          </h3>
          {match ? (
            <>
              <ul className="mt-2 space-y-1.5">
                {match.reasons.map((r) => (
                  <li key={r} className="flex items-start gap-2 text-[13.5px] leading-relaxed text-muted">
                    <Check className="mt-[3px] h-4 w-4 shrink-0 text-accent" aria-hidden />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-line bg-surface2/60 p-3">
                  <p className="text-[12px] font-bold uppercase tracking-wide text-muted">Shared interests</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {match.sharedInterests.length > 0 ? (
                      match.sharedInterests.map((i) => (
                        <Badge key={i} tone="sage">
                          {i}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-[13px] text-muted">No direct overlap — a good reason to try something new.</span>
                    )}
                  </div>
                </div>
                <div className="rounded-xl border border-line bg-surface2/60 p-3">
                  <p className="text-[12px] font-bold uppercase tracking-wide text-muted">Complementary skills</p>
                  {complementary.length > 0 ? (
                    <ul className="mt-1.5 space-y-1">
                      {complementary.map((c) => (
                        <li key={`${c.skill}-${c.direction}`} className="text-[13px] text-muted">
                          <Badge tone={c.direction === 'they teach you' ? 'sage' : 'blue'}>{c.direction}</Badge>{' '}
                          <span className="font-medium text-ink">{c.skill}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-1.5 text-[13px] text-muted">
                      No direct skill swap yet — shared interests are doing the work here.
                    </p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <p className="mt-2 text-[13.5px] text-muted">
              You have already connected with {member.name.split(' ')[0]}, so this person is no longer scored as a new
              recommendation.
            </p>
          )}
        </Card>

        {/* conversation starters */}
        <Card className="p-4">
          <h3 className="flex items-center gap-2 text-[14px] font-bold text-ink">
            <MessageCircleQuestion className="h-4 w-4 text-accent" aria-hidden /> Suggested conversation starters
          </h3>
          <p className="mt-1 text-[12.5px] text-muted">
            Generated from the overlap between your demo profile and theirs — useful for the first two minutes.
          </p>
          <ul className="mt-2.5 space-y-2">
            {starters.map((s) => (
              <li key={s} className="rounded-xl border border-line bg-surface2/50 px-3 py-2 text-[13.5px] leading-relaxed text-ink">
                {s}
              </li>
            ))}
          </ul>
        </Card>

        {/* skills + exchanges */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="p-4">
            <h3 className="text-[14px] font-bold text-ink">Can teach</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {member.teachSkills.map((s) => (
                <Badge key={s} tone="sage">
                  {s}
                </Badge>
              ))}
            </div>
            <h3 className="mt-4 text-[14px] font-bold text-ink">Wants to learn</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {member.learnSkills.map((s) => (
                <Badge key={s} tone="blue">
                  {s}
                </Badge>
              ))}
            </div>
            {theirListings.length > 0 ? (
              <p className="mt-4 text-[12.5px] text-muted">
                Listed in Skill Exchange: {theirListings.map((l) => `${l.skill} (${l.type === 'offer' ? 'teaches' : 'wants'})`).join(', ')}.{' '}
                <Link to="/skills" className="font-semibold text-accent-ink underline decoration-dotted">
                  Open Skill Exchange
                </Link>
              </p>
            ) : null}
          </Card>

          <Card className="p-4">
            <h3 className="text-[14px] font-bold text-ink">Interests & hobbies</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {Array.from(new Set([...member.interests, ...member.hobbies])).map((i) => (
                <Badge key={i} tone={match?.sharedInterests.includes(i) ? 'sage' : 'neutral'}>
                  {i}
                </Badge>
              ))}
            </div>
            <h3 className="mt-4 text-[14px] font-bold text-ink">Usually free</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {member.availability.map((a) => (
                <Badge key={a} tone="outline">
                  {a}
                </Badge>
              ))}
            </div>
          </Card>
        </div>

        {complementary.length > 0 ? (
          <Notice tone="info" icon={<Repeat className="h-4 w-4" />} title="Twenty-minute skill swap plan">
            {swapPlan(match?.iTeachTheyWant ?? [], match?.theyTeachIWant ?? [])}
          </Notice>
        ) : null}

        {/* recommended activities */}
        <Card className="p-4">
          <h3 className="text-[14px] font-bold text-ink">Recommended activities for the two of you</h3>
          <ul className="mt-2.5 space-y-2">
            {recommended.map((a) => (
              <li key={a.id} className="flex items-start gap-3 rounded-xl border border-line bg-surface2/50 p-3">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent-ink">
                  <ActivityIcon category={a.category} className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-semibold text-ink">{a.title}</p>
                  <p className="mt-0.5 text-[12.5px] text-muted">
                    {a.category} · {a.scheduledAt ? formatDateTime(a.scheduledAt) : 'not scheduled'} · {a.place}
                  </p>
                </div>
              </li>
            ))}
            {recommended.length === 0 ? (
              <li className="text-[13.5px] text-muted">No activities loaded yet — add one from the Activities page.</li>
            ) : null}
          </ul>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" icon={<Wand2 className="h-4 w-4" />} onClick={() => onPlanActivity(member.id)}>
              Use one of these as a plan
            </Button>
          </div>
        </Card>
      </div>
    </Modal>
  )
}
