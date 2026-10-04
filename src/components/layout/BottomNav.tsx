import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { CalendarDays, Compass, Home, LayoutGrid, Menu, X } from 'lucide-react'
import { useMilaap } from '../../hooks'
import { cn } from '../../utils/helpers'
import { useNavItems } from './SidebarNav'

const primary = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/discover', label: 'Discover', icon: Compass },
  { to: '/activities', label: 'Activities', icon: LayoutGrid },
  { to: '/schedule', label: 'Schedule', icon: CalendarDays },
]

export function BottomNav() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const items = useNavItems()
  const { unreadCount } = useMilaap()

  return (
    <>
      <nav
        aria-label="Primary mobile navigation"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      >
        <ul className="mx-auto flex max-w-lg items-stretch">
          {primary.map((item) => (
            <li key={item.to} className="flex-1">
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center gap-1 px-2 py-2.5 text-[11px] font-semibold transition',
                    isActive ? 'text-accent-ink' : 'text-muted',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        'grid h-8 w-12 place-items-center rounded-xl transition',
                        isActive && 'bg-accent-soft',
                      )}
                    >
                      <item.icon className="h-[18px] w-[18px]" aria-hidden />
                    </span>
                    {item.label}
                  </>
                )}
              </NavLink>
            </li>
          ))}
          <li className="flex-1">
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="flex w-full flex-col items-center gap-1 px-2 py-2.5 text-[11px] font-semibold text-muted"
              aria-haspopup="dialog"
              aria-expanded={sheetOpen}
            >
              <span className="relative grid h-8 w-12 place-items-center rounded-xl">
                <Menu className="h-[18px] w-[18px]" aria-hidden />
                {unreadCount > 0 ? (
                  <span className="absolute right-2.5 top-0.5 h-2 w-2 rounded-full bg-accent ring-2 ring-surface" />
                ) : null}
              </span>
              More
            </button>
          </li>
        </ul>
      </nav>

      {sheetOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-[#20241F]/50" onClick={() => setSheetOpen(false)} aria-hidden />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="All sections"
            className="absolute inset-x-0 bottom-0 animate-slide-up rounded-t-3xl border-t border-line bg-surface p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[15px] font-bold text-ink">All sections</h2>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                aria-label="Close"
                className="grid h-9 w-9 place-items-center rounded-xl text-muted hover:bg-surface2 hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <ul className="grid grid-cols-2 gap-2">
              {items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    onClick={() => setSheetOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2.5 rounded-xl border px-3 py-3 text-[13.5px] font-semibold transition',
                        isActive ? 'border-accent bg-accent-soft text-accent-ink' : 'border-line bg-surface text-ink',
                      )
                    }
                  >
                    <item.icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
                    <span className="truncate">{item.label}</span>
                    {item.badge ? (
                      <span className="ml-auto rounded-full bg-accent px-1.5 py-0.5 text-[10.5px] font-bold text-white dark:text-[#171a13]">
                        {item.badge}
                      </span>
                    ) : null}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  )
}
