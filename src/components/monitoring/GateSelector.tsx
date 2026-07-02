import { useCallback, useEffect, useState, type FormEvent } from 'react'

import { ApiClientError, isApiErrorCode, mapApiError } from '@/api/errors'
import { activateGate, getActiveGate } from '@/api/monitoring'
import type { GateInfo } from '@/api/fixtures/gateInfo'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface GateSelectorProps {
  /** Refetch status после успешной активации (метрики обновятся на следующем тике). */
  onActivated: () => Promise<void>
  className?: string
}

/**
 * Активный gate из `GET /api/gates/active` и смена через `POST /api/gates/{gate_id}/activate`.
 */
export function GateSelector({ onActivated, className }: GateSelectorProps) {
  const [activeGate, setActiveGate] = useState<GateInfo | null>(null)
  const [isLoadingActive, setIsLoadingActive] = useState(true)
  const [inputValue, setInputValue] = useState('')
  const [isActivating, setIsActivating] = useState(false)

  const loadActiveGate = useCallback(async () => {
    setIsLoadingActive(true)
    try {
      const gate = await getActiveGate()
      setActiveGate(gate)
    } catch (error) {
      if (
        !(
          error instanceof ApiClientError &&
          isApiErrorCode(error, 'no_active_gate')
        )
      ) {
        mapApiError(error)
      }
      setActiveGate(null)
    } finally {
      setIsLoadingActive(false)
    }
  }, [])

  useEffect(() => {
    void loadActiveGate()
  }, [loadActiveGate])

  const handleInputChange = (value: string) => {
    setInputValue(value.replace(/\D/g, ''))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = inputValue.trim()
    if (!trimmed) {
      return
    }

    setIsActivating(true)
    try {
      const gate = await activateGate(trimmed)
      setActiveGate(gate)
      await onActivated()
      setInputValue('')
    } catch (error) {
      mapApiError(error)
    } finally {
      setIsActivating(false)
    }
  }

  const displayGateId = isLoadingActive ? '…' : (activeGate?.gate_id ?? '—')
  const displayGateName = isLoadingActive
    ? 'Загрузка…'
    : (activeGate?.gate_name ?? 'Активный гейт не задан')

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-4',
        className,
      )}
      data-testid="gate-selector"
    >
      <div className="min-w-0">
        <p className="font-mono text-2xl font-semibold tabular-nums">
          {displayGateId}
        </p>
        <p className="text-muted-foreground truncate text-sm">{displayGateName}</p>
      </div>

      <form
        className="flex w-full max-w-md flex-1 flex-col gap-1 sm:w-auto"
        onSubmit={(event) => void handleSubmit(event)}
      >
        <span className="text-muted-foreground text-xs">Новый gate</span>
        <div className="flex items-center gap-2">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            className="border-input bg-background focus:border-ring/40 focus:ring-ring/20 h-9 min-w-0 flex-1 rounded-md border px-3 text-sm transition-colors outline-none focus:ring-1"
            value={inputValue}
            onChange={(event) => handleInputChange(event.target.value)}
            placeholder="1001"
            aria-label="Номер gate"
            disabled={isActivating || isLoadingActive}
          />
          <Button
            type="submit"
            className="h-9 shrink-0 px-4"
            disabled={!inputValue.trim() || isActivating || isLoadingActive}
          >
            Сменить
          </Button>
        </div>
      </form>
    </div>
  )
}
