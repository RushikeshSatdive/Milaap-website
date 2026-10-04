import { useMemo } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  Bell,
  CalendarDays,
  Compass,
  Home,
  LayoutGrid,
  Repeat2,
  Settings,
  UserCircle2,
  Users,
  UsersRound,
} from 'lucide-react'
import { useMilaap } from '../../hooks'
import { cn } from '../../utils/helpers'
import { MilaapMark } from '../ui/CategoryIcon'

export interface NavItem {
  to: string
  label: string
  icon: typeof Home
  badge?: number
}

export function useNavItems(): NavItem[] {
  const { unreadCount, connections, invitations } = useMilaap()
  const plannedUpcoming = invitations.filter((i) => i.status === 'planned').length
  return useMemo(
    () => [
      { to: '/', label: 'Home', icon: Home },
      { to: '/discover', label: 'Discover People', icon: Compass },
      { to: '/activities', label: 'Activities', icon: LayoutGrid },
      { to: '/skills', label: 'Skill Exchange', icon: Repeat2 },
      { to: '/community', label: 'Community', icon: UsersRound },
      { to: '/connections', label: 'My Connections', icon: Users, badge: connections.length },
      { to: '/schedule', label: 'My Schedule', icon: CalendarDays, badge: plannedUpcoming },
      { to: '/notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
      { to: '/profile', label: 'My Profile', icon: UserCircle2 },
      { to: '/settings', label: 'Settings', icon: Settings },
    ],
    [unreadCount, connections.length, plannedUpcoming],
  )
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const items = useNavItems()
  const { profile, activeCommunity } = useMilaap()

  return (
    <div className="flex h-full flex-col gap-4">
      <NavLink to="/" className="flex items-center gap-2.5 px-2" onClick={onNavigate}>
        <MilaapMark className="h-9 w-9" />
        <span className="leading-tight">
          <span className="block text-[17px] font-extrabold tracking-tight text-ink">Milaap</span>
          <span className="block text-[11.5px] text-muted">Small connections. Real belonging.</span>
        </span>
      </NavLink>

      <nav aria-label="Main navigation" className="ml-scroll -mx-1 flex-1 overflow-y-auto px-1">
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-semibold transition',
                    isActive
                      ? 'bg-accent-soft text-accent-ink'
                      : 'text-muted hover:bg-surface2 hover:text-ink',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={cn('h-[18px] w-[18px] shrink-0', isActive && 'text-accent-ink')} aria-hidden />
                    <span className="truncate">{item.label}</span>
                    {item.badge ? (
                      <span className="ml-auto rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-white dark:text-[#171a13]">
                        {item.badge}
                      </span>
                    ) : null}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="rounded-2xl border border-line bg-surface2/70 p-3">
        <p className="text-[11.5px] font-bold uppercase tracking-wide text-muted">Exploring as</p>
        <p className="mt-1 text-[13.5px] font-bold text-ink">{profile.name || 'Unnamed profile'}</p>
        <p className="mt-0.5 text-[12px] leading-snug text-muted">{activeCommunity}</p>
        <p className="mt-2 rounded-lg bg-surface px-2 py-1.5 text-[11.5px] leading-snug text-muted">
          Demo mode · no account, no server. Everything is stored in this browser.
        </p>
      </div>
    </div>
  )
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('flex items-center gap-2', className)}>
      <MilaapMark className="h-8 w-8" />
      <span className="text-[17px] font-extrabold tracking-tight text-ink">Milaap</span>
    </span>
  )
}

export function useIsActive(path: string): boolean {
  const { pathname } = useLocation()
  return path === '/' ? pathname === '/' : pathname.startsWith(path)
}
