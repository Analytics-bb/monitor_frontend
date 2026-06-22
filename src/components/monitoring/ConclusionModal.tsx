import { useEffect, useId, useRef } from 'react'
import { Minimize2 } from 'lucide-react'
import { Link } from 'react-router'

import type { StatusResponse } from '@/api/monitoring'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'

export interface ConclusionModalProps {
  open: boolean
  data: Pick<
    StatusResponse,
    'conclusion' | 'last_status' | 'report_error' | 'audit_id'
  > | null
  onClose: () => void
}

/**
 * Полноэкранный modal conclusion; backdrop click не закрывает.
 */
export function ConclusionModal({ open, data, onClose }: ConclusionModalProps) {
  const titleId = useId()
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) {
      return
    }

    if (open && !dialog.open) {
      dialog.showModal()
    }
    if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) {
      return
    }

    const onCancel = (event: Event) => {
      event.preventDefault()
      onClose()
    }

    dialog.addEventListener('cancel', onCancel)
    return () => dialog.removeEventListener('cancel', onCancel)
  }, [onClose])

  return (
    <dialog
      ref={dialogRef}
      className="bg-background/80 fixed inset-0 z-50 m-0 h-full max-h-none w-full max-w-none backdrop-blur-sm"
      aria-labelledby={titleId}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          event.stopPropagation()
        }
      }}
    >
      <div className="flex h-full items-center justify-center p-4">
        <div
          className="border-border bg-card flex max-h-[85vh] w-full max-w-4xl flex-col rounded-lg border shadow-lg"
          data-testid="conclusion-modal"
        >
          <div className="border-border flex items-center justify-between gap-2 border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <h2 id={titleId} className="font-semibold">
                Conclusion
              </h2>
              {data?.last_status ? (
                <StatusBadge status={data.last_status} />
              ) : null}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              aria-label="Свернуть conclusion"
            >
              <Minimize2 className="size-4" />
              Свернуть
            </Button>
          </div>

          <div className="overflow-y-auto px-4 py-4 text-sm leading-relaxed">
            <p className="whitespace-pre-wrap">
              {data?.conclusion ?? 'Нет вывода'}
            </p>
            {data?.report_error ? (
              <p className="text-status-error mt-4">{data.report_error}</p>
            ) : null}
            {data?.audit_id ? (
              <Link
                to={`/deep/${data.audit_id}`}
                className="text-primary mt-4 inline-block text-sm hover:underline"
              >
                Deep analysis →
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </dialog>
  )
}
