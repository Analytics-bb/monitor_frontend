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

function parseGateDisplay(gateId: string | null | undefined): {
  number: string
  name: string
} {
  if (!gateId) {
    return { number: '—', name: '—' }
  }

  const match = /^gate-(.+)$/i.exec(gateId)
  return {
    number: match?.[1] ?? gateId,
    name: gateId,
  }
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
  const [isActivating, setIsActivating] = useState(false)
  const { number, name } = parseGateDisplay(currentGateId)

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
        <p className="text-muted-foreground text-xs">Gate</p>
        <p className="font-mono text-2xl font-semibold tabular-nums">{number}</p>
        <p className="text-muted-foreground truncate text-sm">{name}</p>
      </div>

      <form
        className="flex w-full max-w-md flex-1 items-end justify-end gap-2 sm:w-auto"
        onSubmit={(event) => void handleSubmit(event)}
      >
        <label className="min-w-0 flex-1 space-y-1">
          <span className="text-muted-foreground text-xs">Новый gate</span>
          <input
            type="text"
            className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="gate-42"
            aria-label="Номер gate"
            disabled={isActivating}
          />
        </label>
        <Button
          type="submit"
          size="sm"
          disabled={!inputValue.trim() || isActivating}
        >
          Сменить
        </Button>
      </form>
    </div>
  )
}
