import { useState, type FormEvent } from 'react'

import { activateGate } from '@/api/monitoring'
import { mapApiError } from '@/api/errors'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface GateSelectorProps {
  /** Текущий gate из последнего status (`event.gate_id`). */
  currentGateId: string | null | undefined
  /** Имя gate из последнего status (`event.gate_name`). */
  currentGateName?: string | null | undefined
  /** Refetch status после успешной активации. */
  onActivated: () => Promise<void>
  className?: string
}

/**
 * Ввод номера gate и активация через `POST /api/gates/{gate_id}/activate`.
 */
export function GateSelector({
  currentGateId,
  currentGateName,
  onActivated,
  className,
}: GateSelectorProps) {
  const [inputValue, setInputValue] = useState('')
  const [isActivating, setIsActivating] = useState(false)

  const handleInputChange = (value: string) => {
    setInputValue(value.replace(/\D/g, ''))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = inputValue.trim()
    if (!trimmed || trimmed === currentGateId) {
      return
    }

    setIsActivating(true)
    try {
      await activateGate(trimmed)
      await onActivated()
      setInputValue('')
    } catch (error) {
      mapApiError(error)
    } finally {
      setIsActivating(false)
    }
  }

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
          {currentGateId ?? '—'}
        </p>
        <p className="text-muted-foreground truncate text-sm">
          {currentGateName ?? '—'}
        </p>
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
            disabled={isActivating}
          />
          <Button
            type="submit"
            className="h-9 shrink-0 px-4"
            disabled={!inputValue.trim() || isActivating}
          >
            Сменить
          </Button>
        </div>
      </form>
    </div>
  )
}
