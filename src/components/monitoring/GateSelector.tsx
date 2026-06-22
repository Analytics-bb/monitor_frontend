import { useState, type FormEvent } from 'react'

import { activateGate } from '@/api/monitoring'
import { mapApiError } from '@/api/errors'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface GateSelectorProps {
  /** Текущий gate из последнего status (`event.gate_id`). */
  currentGateId: string | null | undefined
  /** Refetch status после успешной активации. */
  onActivated: () => Promise<void>
  className?: string
}

/**
 * Ввод номера gate и активация через `POST /api/gates/{gate_id}/activate`.
 */
export function GateSelector({
  currentGateId,
  onActivated,
  className,
}: GateSelectorProps) {
  const [inputValue, setInputValue] = useState('')
  const [pendingGateId, setPendingGateId] = useState<string | null>(null)
  const [isActivating, setIsActivating] = useState(false)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = inputValue.trim()
    if (!trimmed || trimmed === currentGateId) {
      return
    }
    setPendingGateId(trimmed)
  }

  const handleConfirm = async () => {
    if (!pendingGateId) {
      return
    }

    setIsActivating(true)
    try {
      await activateGate(pendingGateId)
      await onActivated()
      setInputValue('')
      setPendingGateId(null)
    } catch (error) {
      mapApiError(error)
    } finally {
      setIsActivating(false)
    }
  }

  return (
    <div className={cn('space-y-3', className)} data-testid="gate-selector">
      <div>
        <h2 className="text-sm font-semibold">Gate</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          {currentGateId ?? '—'}
        </p>
      </div>

      <form className="space-y-2" onSubmit={handleSubmit}>
        <label className="block space-y-1">
          <span className="text-muted-foreground text-xs">Номер gate</span>
          <input
            type="text"
            className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="gate-42"
            aria-label="Номер gate"
          />
        </label>
        <Button type="submit" size="sm" disabled={!inputValue.trim()}>
          Сменить gate
        </Button>
      </form>

      {pendingGateId ? (
        <div
          className="border-border bg-background/95 fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="gate-confirm-title"
        >
          <div className="border-border bg-card w-full max-w-md rounded-lg border p-4 shadow-lg">
            <h3 id="gate-confirm-title" className="font-semibold">
              Подтвердить смену gate
            </h3>
            <p className="text-muted-foreground mt-2 text-sm">
              Активировать gate {pendingGateId}?
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPendingGateId(null)}
                disabled={isActivating}
              >
                Отмена
              </Button>
              <Button
                type="button"
                onClick={() => void handleConfirm()}
                disabled={isActivating}
              >
                Активировать
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
