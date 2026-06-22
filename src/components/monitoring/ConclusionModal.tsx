import { useEffect, useId, useRef } from 'react'
import { Link } from 'react-router'

import type { StatusResponse } from '@/api/monitoring'
import {
  getStatusConclusion,
  getStatusReportError,
  getStatusReportStatus,
} from '@/api/fixtures/statusResponse'
import { AgentConclusionContent } from '@/components/monitoring/AgentConclusionContent'
import { ConclusionHeader } from '@/components/monitoring/ConclusionHeader'
import { ConclusionScrollArea } from '@/components/monitoring/ConclusionScrollArea'

export interface ConclusionModalProps {
  open: boolean
  data: StatusResponse | null
  onClose: () => void
}

/**
 * Modal вывода агента по центру экрана; backdrop click не закрывает.
 */
export function ConclusionModal({ open, data, onClose }: ConclusionModalProps) {
  const titleId = useId()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const conclusion = getStatusConclusion(data)
  const reportStatus = getStatusReportStatus(data)
  const reportError = getStatusReportError(data)

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
          <div className="border-border border-b px-4 py-3">
            <ConclusionHeader
              titleId={titleId}
              reportStatus={reportStatus}
              action="collapse"
              onAction={onClose}
            />
          </div>

          <ConclusionScrollArea variant="modal" className="px-4 py-4">
            <AgentConclusionContent content={conclusion ?? 'Нет вывода'} />
            {reportError ? (
              <p className="text-status-error mt-4 text-sm">{reportError}</p>
            ) : null}
            {data?.audit_id ? (
              <Link
                to={`/deep/${data.audit_id}`}
                className="text-primary mt-4 inline-block text-sm hover:underline"
              >
                Deep analysis →
              </Link>
            ) : null}
          </ConclusionScrollArea>
        </div>
      </div>
    </dialog>
  )
}
