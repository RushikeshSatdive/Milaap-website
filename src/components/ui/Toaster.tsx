import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react'
import { useMilaap } from '../../hooks'
import { cn } from '../../utils/helpers'

const toneConfig = {
  success: { icon: CheckCircle2, className: 'border-[#CFE3C4] bg-[#EAF3E5] text-[#3F6329] dark:border-[#33462a] dark:bg-[#1e2a19] dark:text-[#B4D69C]' },
  info: { icon: Info, className: 'border-line bg-surface text-ink' },
  warning: { icon: TriangleAlert, className: 'border-[#F0DFBB] bg-[#FBF1DC] text-[#8A6112] dark:border-[#4a3c1c] dark:bg-[#33291577] dark:text-[#E7C87E]' },
}

export function Toaster() {
  const { toasts, dismissToast } = useMilaap()

  return (
    <div
      className="pointer-events-none fixed inset-x-3 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-[60] flex flex-col items-stretch gap-2 sm:inset-x-auto sm:bottom-5 sm:right-5 sm:w-[22rem]"
      role="region"
      aria-label="Activity confirmations"
    >
      {toasts.map((t) => {
        const { icon: Icon, className } = toneConfig[t.tone]
        return (
          <div
            key={t.id}
            role="status"
            aria-live="polite"
            className={cn(
              'pointer-events-auto flex animate-toast-in items-start gap-3 rounded-2xl border p-3.5 shadow-lift',
              className,
            )}
          >
            <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-semibold leading-snug">{t.title}</p>
              {t.description ? <p className="mt-0.5 text-[12.5px] leading-snug opacity-90">{t.description}</p> : null}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(t.id)}
              aria-label="Dismiss message"
              className="-mr-1 -mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-lg opacity-70 transition hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
