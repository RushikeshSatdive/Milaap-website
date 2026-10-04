import React from 'react'
import { STORAGE_KEY } from '../../utils/storage'

interface Props {
  children: React.ReactNode
}

interface State {
  error: Error | null
}

/**
 * Last line of defence: if anything throws while rendering, the demo user sees a
 * clear explanation and two recovery actions instead of a blank page.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Kept as a console error on purpose — this is a frontend prototype with no logging service.
    console.error('Milaap crashed while rendering:', error, info.componentStack)
  }

  private reload = () => {
    this.setState({ error: null })
    window.location.reload()
  }

  private resetAndReload = () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
    this.setState({ error: null })
    window.location.reload()
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="flex min-h-dvh items-center justify-center bg-canvas p-4">
        <div className="w-full max-w-lg rounded-2xl border border-line bg-surface p-6 shadow-lift">
          <p className="text-[12px] font-bold uppercase tracking-wide text-muted">Milaap · demonstration build</p>
          <h1 className="mt-2 text-xl font-extrabold text-ink">Something went wrong on this screen</h1>
          <p className="mt-2 text-[14px] leading-relaxed text-muted">
            Your data is stored in this browser, so nothing has been lost by a server. Try reloading; if it keeps happening,
            reset the local demo data to return to the original sample state.
          </p>
          <pre className="mt-3 max-h-32 overflow-auto rounded-xl bg-surface2 p-3 text-[12px] leading-snug text-muted">
            {this.state.error.message}
          </pre>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={this.reload}
              className="inline-flex h-11 items-center rounded-xl bg-accent px-4 text-sm font-semibold text-white transition hover:bg-accent-hover dark:text-[#171a13]"
            >
              Reload Milaap
            </button>
            <button
              type="button"
              onClick={this.resetAndReload}
              className="inline-flex h-11 items-center rounded-xl border border-line bg-surface px-4 text-sm font-semibold text-ink transition hover:bg-surface2"
            >
              Reset local demo data
            </button>
          </div>
        </div>
      </div>
    )
  }
}
