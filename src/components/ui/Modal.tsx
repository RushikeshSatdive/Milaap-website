import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../utils/helpers'
import { useDialogA11y } from '../../hooks'

export interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** Hides the default heading when the content renders its own hero. */
  bare?: boolean
}

const sizeClasses = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-xl',
  lg: 'sm:max-w-3xl',
  xl: 'sm:max-w-5xl',
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  bare = false,
}: ModalProps) {
  const panelRef = useDialogA11y(open, onClose)
  const titleId = React.useId()
  const descId = React.useId()

  useEffect(() => {
    if (open) return
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 animate-fade-in bg-[#20241F]/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={bare ? undefined : titleId}
        aria-describedby={description ? descId : undefined}
        className={cn(
          'relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl border border-line bg-surface shadow-lift',
          'animate-slide-up sm:animate-pop-in sm:rounded-3xl',
          sizeClasses[size],
        )}
      >
        {!bare ? (
          <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
            <div className="min-w-0">
              <h2 id={titleId} className="text-[17px] font-bold text-ink">
                {title}
              </h2>
              {description ? (
                <p id={descId} className="mt-0.5 text-[13px] leading-snug text-muted">
                  {description}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-muted transition hover:bg-surface2 hover:text-ink"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-xl bg-surface/80 text-muted backdrop-blur transition hover:bg-surface2 hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        <div className="ml-scroll min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer ? (
          <div className="border-t border-line bg-surface2/60 px-5 py-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))]">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  )
}
