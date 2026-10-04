import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type {
  Activity,
  AppData,
  AppNotification,
  AppSettings,
  CommunityChallenge,
  Connection,
  Invitation,
  MatchResult,
  NotificationKind,
  NotificationPreferences,
  SkillListing,
  UserProfile,
} from '../types'
import { buildSeedState, CURRENT_DATA_VERSION } from '../data/seed'
import { loadData, saveData, clearData, storageIsAvailable } from '../utils/storage'
import { rankMembers } from '../utils/matching'
import { uid } from '../utils/helpers'

/* ------------------------------ toasts ----------------------------- */

export interface Toast {
  id: string
  title: string
  description?: string
  tone: 'success' | 'info' | 'warning'
}

/* ------------------------------ context ---------------------------- */

type Status = 'loading' | 'ready' | 'error'

export interface ContributionStats {
  connections: number
  activitiesJoined: number
  invitationsPlanned: number
  invitationsCompleted: number
  skillsOffered: number
  skillsLearning: number
  challengesJoined: number
  tasksCompleted: number
  savedActivities: number
  savedChallenges: number
  savedSkills: number
  activeNotifications: number
}

interface MilaapContextValue {
  status: Status
  storageOk: boolean
  data: AppData
  /* profile */
  profile: UserProfile
  updateProfile: (patch: Partial<UserProfile>) => void
  resetProfile: () => void
  /* settings */
  settings: AppSettings
  activeCommunity: string
  setActiveCommunity: (community: string) => void
  updateSettings: (patch: Partial<AppSettings>) => void
  updateNotificationPrefs: (patch: Partial<NotificationPreferences>) => void
  /* members + matching */
  members: AppData['members']
  memberById: (id: string) => AppData['members'][number] | undefined
  matches: MatchResult[]
  matchFor: (id: string) => MatchResult | undefined
  /* connections */
  connections: Connection[]
  connectionIds: string[]
  isConnected: (id: string) => boolean
  addConnection: (memberId: string, source?: Connection['source']) => void
  removeConnection: (memberId: string) => void
  /* saving & dismissing */
  savedMemberIds: string[]
  isSavedMember: (id: string) => boolean
  toggleSavedMember: (id: string) => void
  dismissMember: (id: string) => void
  restoreDismissed: () => void
  /* activities */
  activities: Activity[]
  joinedActivityIds: string[]
  savedActivityIds: string[]
  completedActivityIds: string[]
  isJoined: (id: string) => boolean
  isSavedActivity: (id: string) => boolean
  isCompletedActivity: (id: string) => boolean
  joinActivity: (id: string) => void
  leaveActivity: (id: string) => void
  toggleSavedActivity: (id: string) => void
  completeActivity: (id: string) => void
  createActivity: (payload: Omit<Activity, 'id' | 'createdAt' | 'createdBy' | 'isSample' | 'popularity'>) => Activity
  updateActivity: (id: string, patch: Partial<Activity>) => void
  deleteActivity: (id: string) => void
  /* invitations */
  invitations: Invitation[]
  createInvitation: (payload: Omit<Invitation, 'id' | 'createdAt' | 'status' | 'isSample'>) => Invitation
  updateInvitation: (id: string, patch: Partial<Invitation>) => void
  cancelInvitation: (id: string) => void
  completeInvitation: (id: string) => void
  deleteInvitation: (id: string) => void
  /* skills */
  skillListings: SkillListing[]
  savedSkillIds: string[]
  isSavedSkill: (id: string) => boolean
  toggleSavedSkill: (id: string) => void
  createSkillListing: (payload: Omit<SkillListing, 'id' | 'createdAt' | 'createdBy' | 'isSample'>) => void
  updateSkillListing: (id: string, patch: Partial<SkillListing>) => void
  deleteSkillListing: (id: string) => void
  /* community */
  challenges: CommunityChallenge[]
  savedChallengeIds: string[]
  isSavedChallenge: (id: string) => boolean
  toggleSaveChallenge: (id: string) => void
  toggleChallengeJoin: (id: string) => void
  toggleTask: (challengeId: string, taskId: string) => void
  createChallenge: (payload: Omit<CommunityChallenge, 'id' | 'createdAt' | 'createdBy' | 'isSample'>) => void
  updateChallenge: (id: string, patch: Partial<CommunityChallenge>) => void
  deleteChallenge: (id: string) => void
  /* notifications */
  notifications: AppNotification[]
  unreadCount: number
  markNotificationRead: (id: string, read?: boolean) => void
  markAllNotificationsRead: () => void
  clearNotifications: () => void
  pushNotification: (
    payload: Pick<AppNotification, 'kind' | 'title' | 'message' | 'href'>,
    options?: { force?: boolean },
  ) => void
  /* data management */
  exportPayload: () => AppData
  resetAllData: () => void
  restoreSampleData: () => void
  /* toasts */
  toasts: Toast[]
  toast: (t: Omit<Toast, 'id'>) => void
  dismissToast: (id: string) => void
  stats: ContributionStats
}

const MilaapContext = createContext<MilaapContextValue | null>(null)

const PREF_BY_KIND: Record<NotificationKind, keyof NotificationPreferences> = {
  match: 'matches',
  activity: 'activities',
  invitation: 'invitations',
  skill: 'skills',
  community: 'community',
  profile: 'profile',
  reminder: 'activities',
}

export function MilaapProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(() => buildSeedState() as AppData)
  const [status, setStatus] = useState<Status>('loading')
  const [storageOk, setStorageOk] = useState(true)
  const [toasts, setToasts] = useState<Toast[]>([])
  const loadedRef = useRef(false)

  /* -- initial load (synchronous read, exposed as a real status flag) -- */
  useEffect(() => {
    try {
      const available = storageIsAvailable()
      setStorageOk(available)
      setData(loadData())
      loadedRef.current = true
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [])

  /* -- persist on every change, but never before the first load -- */
  useEffect(() => {
    if (!loadedRef.current) return
    const ok = saveData(data)
    if (!ok) setStorageOk(false)
  }, [data])

  /* -- theme + reduced motion on <html> -- */
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', data.settings.theme === 'dark')
    root.classList.toggle('reduce-motion', data.settings.reducedMotion)
    root.style.colorScheme = data.settings.theme
    try {
      window.localStorage.setItem('milaap:theme', data.settings.theme)
    } catch {
      /* ignore */
    }
  }, [data.settings.theme, data.settings.reducedMotion])

  const mutate = useCallback((updater: (draft: AppData) => AppData) => {
    setData((prev) => ({ ...updater(prev), lastUpdated: new Date().toISOString() }))
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    (t: Omit<Toast, 'id'>) => {
      const id = uid('toast')
      setToasts((prev) => [...prev.slice(-3), { ...t, id }])
      window.setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4200)
    },
    [],
  )

  const pushNotification = useCallback(
    (payload: Pick<AppNotification, 'kind' | 'title' | 'message' | 'href'>, options?: { force?: boolean }) => {
      mutate((draft) => {
        const prefKey = PREF_BY_KIND[payload.kind]
        if (!options?.force && draft.settings.notify[prefKey] === false) return draft
        const notification: AppNotification = {
          ...payload,
          id: uid('n'),
          createdAt: new Date().toISOString(),
          read: false,
          seeded: false,
        }
        return { ...draft, notifications: [notification, ...draft.notifications].slice(0, 60) }
      })
    },
    [mutate],
  )

  /* ------------------------------ profile ----------------------------- */
  const updateProfile = useCallback(
    (patch: Partial<UserProfile>) => {
      mutate((draft) => ({
        ...draft,
        profile: { ...draft.profile, ...patch, updatedAt: new Date().toISOString() },
      }))
    },
    [mutate],
  )

  const resetProfile = useCallback(() => {
    const seed = buildSeedState()
    mutate((draft) => ({ ...draft, profile: { ...seed.profile, createdAt: draft.profile.createdAt } }))
  }, [mutate])

  /* ------------------------------ settings ---------------------------- */
  const updateSettings = useCallback(
    (patch: Partial<AppSettings>) => {
      mutate((draft) => ({ ...draft, settings: { ...draft.settings, ...patch } }))
    },
    [mutate],
  )

  const updateNotificationPrefs = useCallback(
    (patch: Partial<NotificationPreferences>) => {
      mutate((draft) => ({
        ...draft,
        settings: { ...draft.settings, notify: { ...draft.settings.notify, ...patch } },
      }))
    },
    [mutate],
  )

  const setActiveCommunity = useCallback(
    (community: string) => {
      updateSettings({ activeCommunity: community })
    },
    [updateSettings],
  )

  /* --------------------------- members/matching ----------------------- */
  const members = data.members

  const memberById = useCallback(
    (id: string) => members.find((m) => m.id === id),
    [members],
  )

  const matches = useMemo(
    () =>
      rankMembers(data.profile, members, {
        dismissed: data.dismissedMemberIds,
        preferCommunity: data.settings.activeCommunity,
        considerAvailability: true,
      }),
    [data.profile, members, data.dismissedMemberIds, data.settings.activeCommunity],
  )

  const matchFor = useCallback(
    (id: string) => matches.find((m) => m.memberId === id),
    [matches],
  )

  /* ---------------------------- connections --------------------------- */
  const connectionIds = useMemo(() => data.connections.map((c) => c.memberId), [data.connections])

  const isConnected = useCallback((id: string) => connectionIds.includes(id), [connectionIds])

  const addConnection = useCallback(
    (memberId: string, source: Connection['source'] = 'discover') => {
      let alreadyThere = false
      mutate((draft) => {
        if (draft.connections.some((c) => c.memberId === memberId)) {
          alreadyThere = true
          return draft
        }
        const connection: Connection = { memberId, addedAt: new Date().toISOString(), source }
        return {
          ...draft,
          connections: [connection, ...draft.connections],
          // A person you have connected with should no longer be flagged as dismissed.
          dismissedMemberIds: draft.dismissedMemberIds.filter((id) => id !== memberId),
        }
      })
      const member = members.find((m) => m.id === memberId)
      if (!alreadyThere && member) {
        pushNotification({
          kind: 'match',
          title: `Added to My Connections — ${member.name}`,
          message: `You saved ${member.name.split(' ')[0]} from ${member.community} to your connections. You can plan a short activity from their profile.`,
          href: '/connections',
        })
        toast({
          tone: 'success',
          title: `${member.name} added to My Connections`,
          description: 'Demo data only — nobody has been notified.',
        })
      }
    },
    [mutate, members, pushNotification, toast],
  )

  const removeConnection = useCallback(
    (memberId: string) => {
      mutate((draft) => ({ ...draft, connections: draft.connections.filter((c) => c.memberId !== memberId) }))
      const member = members.find((m) => m.id === memberId)
      toast({
        tone: 'info',
        title: member ? `Removed ${member.name} from My Connections` : 'Connection removed',
        description: 'Demo data only.',
      })
    },
    [mutate, members, toast],
  )

  /* ------------------------ saving & dismissing ----------------------- */
  const isSavedMember = useCallback((id: string) => data.savedMemberIds.includes(id), [data.savedMemberIds])

  const toggleSavedMember = useCallback(
    (id: string) => {
      mutate((draft) => {
        const saved = draft.savedMemberIds.includes(id)
        return {
          ...draft,
          savedMemberIds: saved ? draft.savedMemberIds.filter((x) => x !== id) : [...draft.savedMemberIds, id],
        }
      })
    },
    [mutate],
  )

  const dismissMember = useCallback(
    (id: string) => {
      mutate((draft) => ({
        ...draft,
        dismissedMemberIds: draft.dismissedMemberIds.includes(id)
          ? draft.dismissedMemberIds
          : [...draft.dismissedMemberIds, id],
      }))
      toast({ tone: 'info', title: 'Recommendation dismissed', description: 'Use “Restore dismissed” to bring it back.' })
    },
    [mutate, toast],
  )

  const restoreDismissed = useCallback(() => {
    mutate((draft) => ({ ...draft, dismissedMemberIds: [] }))
    toast({ tone: 'success', title: 'Dismissed recommendations restored' })
  }, [mutate, toast])

  /* ----------------------------- activities --------------------------- */
  const isJoined = useCallback((id: string) => data.joinedActivityIds.includes(id), [data.joinedActivityIds])
  const isSavedActivity = useCallback((id: string) => data.savedActivityIds.includes(id), [data.savedActivityIds])
  const isCompletedActivity = useCallback(
    (id: string) => data.completedActivityIds.includes(id),
    [data.completedActivityIds],
  )

  const completeActivity = useCallback(
    (id: string) => {
      mutate((draft) => ({
        ...draft,
        completedActivityIds: draft.completedActivityIds.includes(id)
          ? draft.completedActivityIds
          : [...draft.completedActivityIds, id],
        // Marking something done implies you were part of it locally.
        joinedActivityIds: draft.joinedActivityIds.includes(id)
          ? draft.joinedActivityIds
          : [...draft.joinedActivityIds, id],
      }))
      const activity = data.activities.find((a) => a.id === id)
      pushNotification(
        {
          kind: 'activity',
          title: `Marked as attended — ${activity?.title ?? 'an activity'}`,
          message: 'Your own bookkeeping only. Nobody else attended as far as Milaap knows.',
          href: '/schedule',
        },
        { force: true },
      )
      toast({
        tone: 'success',
        title: 'Marked as completed',
        description: 'Counted in your local contribution summary.',
      })
    },
    [mutate, data.activities, pushNotification, toast],
  )

  const joinActivity = useCallback(
    (id: string) => {
      mutate((draft) => ({
        ...draft,
        joinedActivityIds: draft.joinedActivityIds.includes(id)
          ? draft.joinedActivityIds
          : [...draft.joinedActivityIds, id],
      }))
      const activity = data.activities.find((a) => a.id === id)
      if (activity) {
        toast({
          tone: 'success',
          title: `Joined “${activity.title}”`,
          description: 'Locally tracked only — no real participant has been added.',
        })
        if (activity.scheduledAt) {
          pushNotification({
            kind: 'activity',
            title: `Activity added to your schedule — ${activity.title}`,
            message: `${new Date(activity.scheduledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })} at ${activity.place}.`,
            href: '/schedule',
          })
        }
      }
    },
    [mutate, data.activities, pushNotification, toast],
  )

  const leaveActivity = useCallback(
    (id: string) => {
      mutate((draft) => ({ ...draft, joinedActivityIds: draft.joinedActivityIds.filter((x) => x !== id) }))
      toast({ tone: 'info', title: 'Left the activity', description: 'Your local participant count was updated.' })
    },
    [mutate, toast],
  )

  const toggleSavedActivity = useCallback(
    (id: string) => {
      mutate((draft) => {
        const saved = draft.savedActivityIds.includes(id)
        return {
          ...draft,
          savedActivityIds: saved ? draft.savedActivityIds.filter((x) => x !== id) : [...draft.savedActivityIds, id],
        }
      })
    },
    [mutate],
  )

  const createActivity = useCallback<MilaapContextValue['createActivity']>(
    (payload) => {
      const activity: Activity = {
        ...payload,
        id: uid('a'),
        popularity: 0,
        createdBy: 'you',
        isSample: false,
        createdAt: new Date().toISOString(),
      }
      mutate((draft) => ({ ...draft, activities: [activity, ...draft.activities] }))
      pushNotification({
        kind: 'activity',
        title: `Your activity is live in your list — ${activity.title}`,
        message: 'Created locally in this browser. It is visible only in your demo data.',
        href: '/activities',
      })
      toast({ tone: 'success', title: 'Activity created', description: 'Saved locally to your demo data.' })
      return activity
    },
    [mutate, pushNotification, toast],
  )

  const updateActivity = useCallback(
    (id: string, patch: Partial<Activity>) => {
      mutate((draft) => ({
        ...draft,
        activities: draft.activities.map((a) => (a.id === id ? { ...a, ...patch } : a)),
      }))
      toast({ tone: 'success', title: 'Activity updated' })
    },
    [mutate, toast],
  )

  const deleteActivity = useCallback(
    (id: string) => {
      mutate((draft) => ({
        ...draft,
        activities: draft.activities.filter((a) => a.id !== id),
        joinedActivityIds: draft.joinedActivityIds.filter((x) => x !== id),
        savedActivityIds: draft.savedActivityIds.filter((x) => x !== id),
      }))
      toast({ tone: 'info', title: 'Activity deleted' })
    },
    [mutate, toast],
  )

  /* ---------------------------- invitations --------------------------- */
  const createInvitation = useCallback<MilaapContextValue['createInvitation']>(
    (payload) => {
      const invitation: Invitation = {
        ...payload,
        id: uid('inv'),
        status: 'planned',
        isSample: false,
        createdAt: new Date().toISOString(),
      }
      mutate((draft) => ({ ...draft, invitations: [invitation, ...draft.invitations] }))
      const member = members.find((m) => m.id === payload.memberId)
      pushNotification({
        kind: 'invitation',
        title: `Demo invitation created with ${member?.name ?? 'a connection'}`,
        message: `${payload.title} · ${payload.date} at ${payload.time}, ${payload.place}. Stored locally — no message was sent.`,
        href: '/schedule',
      })
      toast({
        tone: 'success',
        title: 'Demo invitation created locally',
        description: 'No real message has been sent to anyone.',
      })
      return invitation
    },
    [mutate, members, pushNotification, toast],
  )

  const updateInvitation = useCallback(
    (id: string, patch: Partial<Invitation>) => {
      mutate((draft) => ({
        ...draft,
        invitations: draft.invitations.map((i) => (i.id === id ? { ...i, ...patch } : i)),
      }))
      toast({ tone: 'success', title: 'Invitation updated' })
    },
    [mutate, toast],
  )

  const cancelInvitation = useCallback(
    (id: string) => {
      mutate((draft) => ({
        ...draft,
        invitations: draft.invitations.map((i) => (i.id === id ? { ...i, status: 'cancelled' } : i)),
      }))
      toast({ tone: 'warning', title: 'Invitation cancelled', description: 'It now appears under Past & cancelled.' })
    },
    [mutate, toast],
  )

  const completeInvitation = useCallback(
    (id: string) => {
      mutate((draft) => ({
        ...draft,
        invitations: draft.invitations.map((i) => (i.id === id ? { ...i, status: 'completed' } : i)),
      }))
      toast({ tone: 'success', title: 'Marked as completed', description: 'Counted in your contribution summary.' })
    },
    [mutate, toast],
  )

  const deleteInvitation = useCallback(
    (id: string) => {
      mutate((draft) => ({ ...draft, invitations: draft.invitations.filter((i) => i.id !== id) }))
      toast({ tone: 'info', title: 'Invitation removed from your schedule' })
    },
    [mutate, toast],
  )

  /* ------------------------------- skills ----------------------------- */
  const isSavedSkill = useCallback((id: string) => data.savedSkillIds.includes(id), [data.savedSkillIds])

  const toggleSavedSkill = useCallback(
    (id: string) => {
      mutate((draft) => {
        const saved = draft.savedSkillIds.includes(id)
        return {
          ...draft,
          savedSkillIds: saved ? draft.savedSkillIds.filter((x) => x !== id) : [...draft.savedSkillIds, id],
        }
      })
    },
    [mutate],
  )

  const createSkillListing = useCallback<MilaapContextValue['createSkillListing']>(
    (payload) => {
      const listing: SkillListing = {
        ...payload,
        id: uid('s'),
        createdBy: 'you',
        isSample: false,
        createdAt: new Date().toISOString(),
      }
      mutate((draft) => ({ ...draft, skillListings: [listing, ...draft.skillListings] }))
      pushNotification({
        kind: 'skill',
        title: payload.type === 'offer' ? `New skill offer: ${payload.skill}` : `New learning request: ${payload.skill}`,
        message: 'Created locally in your demo data. Milaap will surface complementary listings.',
        href: '/skills',
      })
      toast({
        tone: 'success',
        title: payload.type === 'offer' ? 'Skill offer saved' : 'Learning request saved',
        description: 'Stored locally in this browser.',
      })
    },
    [mutate, pushNotification, toast],
  )

  const updateSkillListing = useCallback(
    (id: string, patch: Partial<SkillListing>) => {
      mutate((draft) => ({
        ...draft,
        skillListings: draft.skillListings.map((s) => (s.id === id ? { ...s, ...patch } : s)),
      }))
      toast({ tone: 'success', title: 'Listing updated' })
    },
    [mutate, toast],
  )

  const deleteSkillListing = useCallback(
    (id: string) => {
      mutate((draft) => ({
        ...draft,
        skillListings: draft.skillListings.filter((s) => s.id !== id),
        savedSkillIds: draft.savedSkillIds.filter((x) => x !== id),
      }))
      toast({ tone: 'info', title: 'Listing deleted' })
    },
    [mutate, toast],
  )

  /* ------------------------------ community --------------------------- */
  const isSavedChallenge = useCallback((id: string) => data.savedChallengeIds.includes(id), [data.savedChallengeIds])

  const toggleSaveChallenge = useCallback(
    (id: string) => {
      mutate((draft) => {
        const saved = draft.savedChallengeIds.includes(id)
        return {
          ...draft,
          savedChallengeIds: saved ? draft.savedChallengeIds.filter((x) => x !== id) : [...draft.savedChallengeIds, id],
        }
      })
    },
    [mutate],
  )

  const toggleChallengeJoin = useCallback(
    (id: string) => {
      let joinedNow = false
      mutate((draft) => ({
        ...draft,
        challenges: draft.challenges.map((c) => {
          if (c.id !== id) return c
          joinedNow = !c.joined
          return { ...c, joined: !c.joined }
        }),
      }))
      const challenge = data.challenges.find((c) => c.id === id)
      if (challenge) {
        toast({
          tone: joinedNow ? 'success' : 'info',
          title: joinedNow ? `Joined “${challenge.title}”` : `Left “${challenge.title}”`,
          description: 'Sample participants are demonstration data; your own join is stored locally.',
        })
        if (joinedNow) {
          pushNotification({
            kind: 'community',
            title: `You joined the challenge: ${challenge.title}`,
            message: `${challenge.tasks.filter((t) => !t.done).length} tasks still open. Tick them off as you go.`,
            href: '/community',
          })
        }
      }
    },
    [mutate, data.challenges, pushNotification, toast],
  )

  const toggleTask = useCallback(
    (challengeId: string, taskId: string) => {
      mutate((draft) => {
        const challenge = draft.challenges.find((c) => c.id === challengeId)
        const willBeDone = challenge ? !challenge.tasks.find((t) => t.id === taskId)?.done : false
        const alreadyLogged = draft.completedTaskIds.includes(taskId)
        return {
          ...draft,
          challenges: draft.challenges.map((c) =>
            c.id === challengeId
              ? { ...c, tasks: c.tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)) }
              : c,
          ),
          completedTaskIds:
            willBeDone && !alreadyLogged
              ? [...draft.completedTaskIds, taskId]
              : !willBeDone
                ? draft.completedTaskIds.filter((x) => x !== taskId)
                : draft.completedTaskIds,
        }
      })
    },
    [mutate],
  )

  const createChallenge = useCallback<MilaapContextValue['createChallenge']>(
    (payload) => {
      const challenge: CommunityChallenge = {
        ...payload,
        id: uid('c'),
        createdBy: 'you',
        isSample: false,
        createdAt: new Date().toISOString(),
      }
      mutate((draft) => ({ ...draft, challenges: [challenge, ...draft.challenges] }))
      pushNotification({
        kind: 'community',
        title: `Challenge created: ${challenge.title}`,
        message: 'Stored locally in this browser. Sample participants are demonstration data only.',
        href: '/community',
      })
      toast({ tone: 'success', title: 'Community challenge created' })
    },
    [mutate, pushNotification, toast],
  )

  const updateChallenge = useCallback(
    (id: string, patch: Partial<CommunityChallenge>) => {
      mutate((draft) => ({
        ...draft,
        challenges: draft.challenges.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      }))
      toast({ tone: 'success', title: 'Challenge updated' })
    },
    [mutate, toast],
  )

  const deleteChallenge = useCallback(
    (id: string) => {
      mutate((draft) => ({
        ...draft,
        challenges: draft.challenges.filter((c) => c.id !== id),
        savedChallengeIds: draft.savedChallengeIds.filter((x) => x !== id),
      }))
      toast({ tone: 'info', title: 'Challenge deleted' })
    },
    [mutate, toast],
  )

  /* ---------------------------- notifications ------------------------- */
  const unreadCount = useMemo(() => data.notifications.filter((n) => !n.read).length, [data.notifications])

  const markNotificationRead = useCallback(
    (id: string, read = true) => {
      mutate((draft) => ({
        ...draft,
        notifications: draft.notifications.map((n) => (n.id === id ? { ...n, read } : n)),
      }))
    },
    [mutate],
  )

  const markAllNotificationsRead = useCallback(() => {
    mutate((draft) => ({ ...draft, notifications: draft.notifications.map((n) => ({ ...n, read: true })) }))
    toast({ tone: 'success', title: 'All notifications marked as read' })
  }, [mutate, toast])

  const clearNotifications = useCallback(() => {
    mutate((draft) => ({ ...draft, notifications: [] }))
    toast({ tone: 'info', title: 'Notifications cleared' })
  }, [mutate, toast])

  /* --------------------------- data management ------------------------ */
  const resetAllData = useCallback(() => {
    const empty = buildSeedState() as AppData
    const blank: AppData = {
      ...empty,
      version: CURRENT_DATA_VERSION,
      connections: [],
      invitations: [],
      joinedActivityIds: [],
      savedActivityIds: [],
      completedActivityIds: [],
      savedSkillIds: [],
      savedChallengeIds: [],
      completedTaskIds: [],
      savedMemberIds: [],
      dismissedMemberIds: [],
      notifications: [],
      challenges: empty.challenges.map((c) => ({ ...c, joined: false, tasks: c.tasks.map((t) => ({ ...t, done: false })) })),
      profile: {
        ...empty.profile,
        name: '',
        bio: '',
        interests: [],
        hobbies: [],
        languages: [],
        teachSkills: [],
        learnSkills: [],
        preferredActivities: [],
        availability: [],
        accessibility: '',
      },
    }
    setData(blank)
    toast({
      tone: 'warning',
      title: 'Local demo data cleared',
      description: 'Sample members, activities and skills were kept so the app stays explorable.',
    })
  }, [toast])

  const restoreSampleData = useCallback(() => {
    clearData()
    const fresh = buildSeedState() as AppData
    setData(fresh)
    toast({
      tone: 'success',
      title: 'Sample data restored',
      description: 'Everything is back to the original demonstration state.',
    })
  }, [toast])

  const exportPayload = useCallback(() => data, [data])

  /* ------------------------------- stats ------------------------------ */
  const stats = useMemo<ContributionStats>(
    () => ({
      connections: data.connections.length,
      activitiesJoined: data.joinedActivityIds.length,
      invitationsPlanned: data.invitations.filter((i) => i.status === 'planned').length,
      invitationsCompleted: data.invitations.filter((i) => i.status === 'completed').length,
      skillsOffered: data.skillListings.filter((s) => s.createdBy === 'you' && s.type === 'offer').length,
      skillsLearning: data.skillListings.filter((s) => s.createdBy === 'you' && s.type === 'request').length,
      challengesJoined: data.challenges.filter((c) => c.joined).length,
      tasksCompleted: data.challenges.reduce((sum, c) => sum + c.tasks.filter((t) => t.done).length, 0),
      savedActivities: data.savedActivityIds.length,
      savedChallenges: data.savedChallengeIds.length,
      savedSkills: data.savedSkillIds.length,
      activeNotifications: data.notifications.filter((n) => !n.read).length,
    }),
    [data],
  )

  /* -- one-time gentle nudge when the profile is incomplete -- */
  useEffect(() => {
    if (status !== 'ready') return
    if (data.flags.profileNudgeSent) return
    const complete = data.profile.name && data.profile.bio && data.profile.interests.length > 0
    if (complete) return
    mutate((draft) => ({
      ...draft,
      flags: { ...draft.flags, profileNudgeSent: true },
      notifications: [
        {
          id: uid('n'),
          kind: 'profile',
          title: 'Finish your Milaap profile',
          message: 'Add your interests and the skills you can share — matches get noticeably better.',
          createdAt: new Date().toISOString(),
          read: false,
          href: '/profile/edit',
          seeded: false,
        },
        ...draft.notifications,
      ],
    }))
  }, [status, data.flags.profileNudgeSent, data.profile, mutate])

  const value = useMemo<MilaapContextValue>(
    () => ({
      status,
      storageOk,
      data,
      profile: data.profile,
      updateProfile,
      resetProfile,
      settings: data.settings,
      activeCommunity: data.settings.activeCommunity,
      setActiveCommunity,
      updateSettings,
      updateNotificationPrefs,
      members,
      memberById,
      matches,
      matchFor,
      connections: data.connections,
      connectionIds,
      isConnected,
      addConnection,
      removeConnection,
      savedMemberIds: data.savedMemberIds,
      isSavedMember,
      toggleSavedMember,
      dismissMember,
      restoreDismissed,
      activities: data.activities,
      joinedActivityIds: data.joinedActivityIds,
      savedActivityIds: data.savedActivityIds,
      completedActivityIds: data.completedActivityIds,
      isJoined,
      isSavedActivity,
      isCompletedActivity,
      joinActivity,
      leaveActivity,
      toggleSavedActivity,
      completeActivity,
      createActivity,
      updateActivity,
      deleteActivity,
      invitations: data.invitations,
      createInvitation,
      updateInvitation,
      cancelInvitation,
      completeInvitation,
      deleteInvitation,
      skillListings: data.skillListings,
      savedSkillIds: data.savedSkillIds,
      isSavedSkill,
      toggleSavedSkill,
      createSkillListing,
      updateSkillListing,
      deleteSkillListing,
      challenges: data.challenges,
      savedChallengeIds: data.savedChallengeIds,
      isSavedChallenge,
      toggleSaveChallenge,
      toggleChallengeJoin,
      toggleTask,
      createChallenge,
      updateChallenge,
      deleteChallenge,
      notifications: data.notifications,
      unreadCount,
      markNotificationRead,
      markAllNotificationsRead,
      clearNotifications,
      pushNotification,
      exportPayload,
      resetAllData,
      restoreSampleData,
      toasts,
      toast,
      dismissToast,
      stats,
    }),
    [
      status,
      storageOk,
      data,
      updateProfile,
      resetProfile,
      setActiveCommunity,
      updateSettings,
      updateNotificationPrefs,
      members,
      memberById,
      matches,
      matchFor,
      connectionIds,
      isConnected,
      addConnection,
      removeConnection,
      isSavedMember,
      toggleSavedMember,
      dismissMember,
      restoreDismissed,
      isJoined,
      isSavedActivity,
      isCompletedActivity,
      joinActivity,
      leaveActivity,
      toggleSavedActivity,
      completeActivity,
      createActivity,
      updateActivity,
      deleteActivity,
      createInvitation,
      updateInvitation,
      cancelInvitation,
      completeInvitation,
      deleteInvitation,
      isSavedSkill,
      toggleSavedSkill,
      createSkillListing,
      updateSkillListing,
      deleteSkillListing,
      isSavedChallenge,
      toggleSaveChallenge,
      toggleChallengeJoin,
      toggleTask,
      createChallenge,
      updateChallenge,
      deleteChallenge,
      unreadCount,
      markNotificationRead,
      markAllNotificationsRead,
      clearNotifications,
      pushNotification,
      exportPayload,
      resetAllData,
      restoreSampleData,
      toasts,
      toast,
      dismissToast,
      stats,
    ],
  )

  return <MilaapContext.Provider value={value}>{children}</MilaapContext.Provider>
}

export function useMilaapContext(): MilaapContextValue {
  const ctx = useContext(MilaapContext)
  if (!ctx) throw new Error('useMilaap must be used inside <MilaapProvider>')
  return ctx
}

export { MilaapContext }
