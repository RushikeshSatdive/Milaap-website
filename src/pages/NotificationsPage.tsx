import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Bell,
  BellRing,
  CalendarPlus,
  CheckCheck,
  HeartHandshake,
  Repeat2,
  Sparkles,
  Trash2,
  UserCog,
  Info,
} from 'lucide-react'
import { useMilaap, useDocumentTitle } from '../hooks'
import type { AppNotification, NotificationKind } from '../types'
import { Badge, Button, Card, EmptyState, Notice } from '../components/ui/primitives'
import { PageHeader } from '../components/ui/PageHeader'
import { Tabs } from '../components/ui/Tabs'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { cn } from '../utils/helpers'
import { relativeTime } from '../utils/date'

const KIND_META: Record<NotificationKind, { label: string; icon: typeof Bell; tone: 'sage' | 'blue' | 'amber' | 'neutral' }> = {
  match: { label: 'Suggested match', icon: Sparkles, tone: 'sage' },
  activity: { label: 'Activity', icon: CalendarPlus, tone: 'blue' },
  invitation: { label: 'Demo invitation', icon: CalendarPlus, tone: 'amber' },
  reminder: { label: 'Reminder', icon: BellRing, tone: 'blue' },
  profile: { label: 'Profile tip', icon: UserCog, tone: 'neutral' },
  skill: { label: 'Skill match', icon: Repeat2, tone: 'sage' },
  community: { label: 'Community', icon: HeartHandshake, tone: 'sage' },
}

export function NotificationsPage() {
  useDocumentTitle('Notifications')
  const navigate = useNavigate()
  const {
    notifications,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
  } = useMilaap()

  const [tab, setTab] = useState('all')
  const [kindFilter, setKindFilter] = useState<NotificationKind | ''>('')
  const [confirmClear, setConfirmClear] = useState(false)

  const filtered = useMemo(() => {
    const base = notifications
      .filter((n) => (tab === 'unread' ? !n.read : true))
      .filter((n) => (kindFilter ? n.kind === kindFilter : true))
    return [...base].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [notifications, tab, kindFilter])

  const hasFilters = tab === 'unread' || kindFilter !== ''

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={
          <Badge tone="sage" icon={<Bell className="h-3 w-3" />}>
            Notifications
          </Badge>
        }
        title="Your Milaap inbox"
        description="Gentle nudges from your own actions and a few clearly labelled sample notifications. No push notifications, no messages from real people."
        actions={
          <>
            <Button
              variant="secondary"
              icon={<CheckCheck className="h-4 w-4" />}
              onClick={markAllNotificationsRead}
              disabled={unreadCount === 0}
            >
              Mark all as read
            </Button>
            <Button
              variant="secondary"
              icon={<Trash2 className="h-4 w-4" />}
              onClick={() => setConfirmClear(true)}
              disabled={notifications.length === 0}
            >
              Clear all
            </Button>
          </>
        }
      />

      <Tabs
        value={tab}
        onChange={setTab}
        label="Notification filters"
        options={[
          { id: 'all', label: 'All', count: notifications.length },
          { id: 'unread', label: 'Unread', count: unreadCount },
        ]}
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setKindFilter('')}
          aria-pressed={kindFilter === ''}
          className={cn(
            'rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition',
            kindFilter === '' ? 'border-accent bg-accent-soft text-accent-ink' : 'border-line bg-surface text-muted hover:text-ink',
          )}
        >
          Every kind
        </button>
        {(Object.keys(KIND_META) as NotificationKind[]).map((kind) => {
          const count = notifications.filter((n) => n.kind === kind).length
          if (count === 0) return null
          const Icon = KIND_META[kind].icon
          return (
            <button
              key={kind}
              type="button"
              onClick={() => setKindFilter(kindFilter === kind ? '' : kind)}
              aria-pressed={kindFilter === kind}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition',
                kindFilter === kind
                  ? 'border-accent bg-accent-soft text-accent-ink'
                  : 'border-line bg-surface text-muted hover:text-ink',
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
              {KIND_META[kind].label} ({count})
            </button>
          )
        })}
      </div>

      <Notice tone="info" icon={<Info className="h-4 w-4" />} title="Where these come from">
        Notifications marked <em>sample</em> were seeded with the demonstration data. Everything else was generated by an action
        you took in this browser — adding a connection, joining an activity, creating an invitation, challenge or skill listing.
      </Notice>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-6 w-6" />}
          title={hasFilters ? 'Nothing matches this filter' : 'No notifications'}
          description={
            hasFilters
              ? 'Try switching back to all notifications, or clear the kind filter.'
              : 'Add a connection, join an activity or create an invitation and your updates will appear here.'
          }
          action={
            hasFilters ? (
              <Button
                onClick={() => {
                  setTab('all')
                  setKindFilter('')
                }}
              >
                Show everything
              </Button>
            ) : (
              <Button onClick={() => navigate('/discover')}>Discover people</Button>
            )
          }
        />
      ) : (
        <ul className="space-y-2">
          {filtered.map((notification) => (
            <NotificationRow
              key={notification.id}
              notification={notification}
              onToggleRead={() => markNotificationRead(notification.id, !notification.read)}
            />
          ))}
        </ul>
      )}

      <Card className="p-5">
        <h2 className="text-[15px] font-bold text-ink">How Milaap uses notifications</h2>
        <ul className="mt-2 space-y-1.5 text-[13px] leading-relaxed text-muted">
          <li>· They exist to prompt real-world action, not to pull you back into an app.</li>
          <li>· There is no push notification service and no email — this list only exists on this page.</li>
          <li>· You can switch each category off in Settings, and everything can be cleared at any time.</li>
        </ul>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => navigate('/settings')}>
            Notification preferences
          </Button>
          <Button size="sm" variant="secondary" onClick={() => navigate('/schedule')}>
            Open My Schedule
          </Button>
        </div>
      </Card>

      <ConfirmDialog
        open={confirmClear}
        destructive
        title="Clear all notifications?"
        message={<>All {notifications.length} notifications will be removed from this browser. Your connections, activities and challenges stay exactly as they are.</>}
        confirmLabel="Clear notifications"
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => {
          clearNotifications()
          setConfirmClear(false)
        }}
      />
    </div>
  )
}

function NotificationRow({
  notification,
  onToggleRead,
}: {
  notification: AppNotification
  onToggleRead: () => void
}) {
  const meta = KIND_META[notification.kind]
  const Icon = meta.icon

  return (
    <li>
      <Card
        className={cn(
          'flex flex-wrap items-start gap-3 p-3.5 transition',
          !notification.read && 'border-accent/35 bg-accent-soft/25',
        )}
      >
        <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-ink">
          <Icon className="h-5 w-5" aria-hidden />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={cn('text-[14.5px] leading-snug', notification.read ? 'font-semibold text-ink' : 'font-bold text-ink')}>
              {notification.title}
            </h3>
            {!notification.read ? <Badge tone="sage">Unread</Badge> : null}
            <Badge tone={meta.tone === 'neutral' ? 'neutral' : meta.tone}>{meta.label}</Badge>
            {notification.seeded ? <Badge tone="outline">Sample</Badge> : <Badge tone="blue">From your action</Badge>}
          </div>
          <p className="mt-1 text-[13px] leading-relaxed text-muted">{notification.message}</p>
          <p className="mt-1 text-[11.5px] text-muted">{relativeTime(notification.createdAt)}</p>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <Link
            to={notification.href}
            className="inline-flex h-9 items-center rounded-lg bg-accent px-3 text-[13px] font-semibold text-white transition hover:bg-accent-hover dark:text-[#171a13]"
          >
            Open
          </Link>
          <button
            type="button"
            onClick={onToggleRead}
            className="inline-flex h-9 items-center rounded-lg border border-line bg-surface px-3 text-[13px] font-semibold text-ink transition hover:bg-surface2"
          >
            {notification.read ? 'Mark as unread' : 'Mark as read'}
          </button>
        </div>
      </Card>
    </li>
  )
}
