import { useCallback, useEffect, useState, type ChangeEvent } from 'react'

import {
  activateGate,
  getActiveGate,
  getGates,
  type GateInfo,
} from '@/api/monitoring'
import { mapApiError } from '@/api/errors'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface GateSelectorProps {
  /** Refetch status после успешной активации. */
  onActivated: () => Promise<void>
  className?: string
}

/**
 * Выбор и активация gate с confirm-dialog.
 */
export function GateSelector({ onActivated, className }: GateSelectorProps) {
  const [gates, setGates] = useState<GateInfo[]>([])
  const [activeGateId, setActiveGateId] = useState<string>('')
  const [pendingGateId, setPendingGateId] = useState<string | null>(null)
  const [isActivating, setIsActivating] = useState(false)

  const loadGates = useCallback(async () => {
    const [list, active] = await Promise.all([getGates(), getActiveGate()])
    setGates(list)
    setActiveGateId(active.gate_id)
  }, [])

  useEffect(() => {
    let cancelled = false

    void Promise.all([getGates(), getActiveGate()]).then(([list, active]) => {
      if (!cancelled) {
        setGates(list)
        setActiveGateId(active.gate_id)
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  const activeGate = gates.find((gate) => gate.gate_id === activeGateId)
  const pendingGate = gates.find((gate) => gate.gate_id === pendingGateId)

  const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextId = event.target.value
    if (nextId === activeGateId) {
      return
    }
    setPendingGateId(nextId)
  }

  const handleConfirm = async () => {
    if (!pendingGateId) {
      return
    }

    setIsActivating(true)
    try {
      await activateGate(pendingGateId)
      await loadGates()
      await onActivated()
      setActiveGateId(pendingGateId)
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
          {activeGate
            ? `${activeGate.gate_id} — ${activeGate.label ?? activeGate.name}`
            : '—'}
        </p>
      </div>

      <label className="block space-y-1">
        <span className="text-muted-foreground text-xs">Сменить gate</span>
        <select
          className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
          value={activeGateId}
          onChange={handleSelectChange}
          aria-label="Выбор gate"
        >
          {gates.map((gate) => (
            <option key={gate.gate_id} value={gate.gate_id}>
              {gate.gate_id} — {gate.label ?? gate.name}
            </option>
          ))}
        </select>
      </label>

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
              Активировать gate {pendingGate?.gate_id} (
              {pendingGate?.label ?? pendingGate?.name})?
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
