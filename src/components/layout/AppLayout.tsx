import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation, NavLink } from 'react-router-dom'
import { Bell, Moon, Search, Sun, UserCircle2 } from 'lucide-react'
import { useMilaap } from '../../hooks'
import { cn } from '../../utils/helpers'
import { SidebarNav, Wordmark } from './SidebarNav'
import { BottomNav } from './BottomNav'
import { GlobalSearch } from '../GlobalSearch'
import { Toaster } from '../ui/Toaster'
import { Avatar, ErrorState, PageSkeleton } from '../ui/primitives'

export function AppLayout() {
  const { status, storageOk, unreadCount, profile, settings, updateSettings } = useMilaap()
  const [searchOpen, setSearchOpen] = useState(false)
  const location = useLocation()

  /* Global Ctrl/Cmd+K shortcut for search */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  /* Close search whenever the route changes */
  useEffect(() => {
    setSearchOpen(false)
  }, [location.pathname, location.search])

  /* Scroll to top on navigation (respecting reduced motion) */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: settings.reducedMotion ? 'auto' : 'smooth' })
  }, [location.pathname, settings.reducedMotion])

  const toggleTheme = () => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })

  return (
    <div className="min-h-dvh bg-canvas">
      <a href="#main-content" className="sr-only sr-only-focusable">
        Skip to main content
      </a>

      {/* Desktop / laptop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] border-r border-line bg-surface px-3 py-4 lg:flex lg:flex-col">
        <SidebarNav />
      </aside>

      <div className="lg:pl-[264px]">
        {/* Top bar — compact on mobile, functional on desktop */}
        <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-3 sm:px-5">
            <Link to="/" className="lg:hidden" aria-label="Milaap home">
              <Wordmark />
            </Link>

            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="ml-auto hidden h-10 flex-1 max-w-md items-center gap-2 rounded-xl border border-line bg-surface2/70 px-3 text-[13.5px] text-muted transition hover:border-accent/50 sm:flex lg:ml-0"
            >
              <Search className="h-4 w-4" aria-hidden />
              <span className="truncate">Search people, skills, activities…</span>
              <kbd className="ml-auto hidden rounded border border-line bg-surface px-1.5 py-0.5 text-[11px] font-semibold lg:block">
                Ctrl K
              </kbd>
            </button>

            <div className="ml-auto flex items-center gap-1.5 sm:ml-0">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Open search"
                className="grid h-10 w-10 place-items-center rounded-xl text-muted transition hover:bg-surface2 hover:text-ink sm:hidden"
              >
                <Search className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={toggleTheme}
                aria-label={`Switch to ${settings.theme === 'dark' ? 'light' : 'dark'} theme`}
                className="grid h-10 w-10 place-items-center rounded-xl text-muted transition hover:bg-surface2 hover:text-ink"
              >
                {settings.theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              <NavLink
                to="/notifications"
                aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
                className={({ isActive }) =>
                  cn(
                    'relative grid h-10 w-10 place-items-center rounded-xl transition',
                    isActive ? 'bg-accent-soft text-accent-ink' : 'text-muted hover:bg-surface2 hover:text-ink',
                  )
                }
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 ? (
                  <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-[#B4443A] px-1 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                ) : null}
              </NavLink>

              <NavLink
                to="/profile"
                aria-label="My profile"
                className="rounded-full transition hover:opacity-90"
              >
                <Avatar name={profile.name || 'You'} avatarId={profile.avatarId} size="sm" className="h-9 w-9" />
              </NavLink>
            </div>
          </div>
        </header>

        <main id="main-content" className="mx-auto max-w-6xl px-3 pb-28 pt-4 sm:px-5 sm:pt-6 lg:pb-10">
          {status === 'loading' ? <PageSkeleton /> : null}
          {status === 'error' ? (
            <ErrorState
              message="Your browser blocked access to localStorage, so Milaap ran in a memory-only session. Nothing was saved."
              onRetry={() => window.location.reload()}
            />
          ) : null}
          {status === 'ready' ? (
            <>
              {!storageOk ? (
                <div className="mb-4 rounded-xl border border-[#F0DFBB] bg-[#FBF1DC] p-3 text-[13px] text-[#8A6112] dark:border-[#4a3c1c] dark:bg-[#33291577] dark:text-[#E7C87E]">
                  Storage is unavailable in this browser, so your changes will disappear when you close the tab. The app
                  still works in this session.
                </div>
              ) : null}
              <Outlet />
            </>
          ) : null}
        </main>

        <footer className="mx-auto max-w-6xl px-3 pb-24 text-[11.5px] leading-relaxed text-muted sm:px-5 lg:pb-8">
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4">
            <p>
              Milaap is a frontend demonstration. People, activities and challenges are sample data. Nothing is stored on a
              server and no real invitations are ever sent.
            </p>
            <Link to="/settings" className="flex items-center gap-1 font-semibold transition hover:text-ink">
              <UserCircle2 className="h-3.5 w-3.5" aria-hidden /> Privacy & data settings
            </Link>
          </div>
        </footer>
      </div>

      <BottomNav />
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      <Toaster />
    </div>
  )
}
