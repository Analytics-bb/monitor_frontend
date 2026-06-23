import { useState } from 'react'

import type { DeepCaseSummary } from '@/api/deep'
import { Button } from '@/components/ui/button'
import {
  hasDeepCasesFilterErrors,
  validateDeepCasesFilters,
  type DeepCasesFilterErrors,
} from '@/lib/deepCasesFiltersValidation'
import { cn } from '@/lib/utils'

export type DeepChatStateFilter = DeepCaseSummary['deep_chat_state'] | ''

export interface DeepCasesFilterValues {
  gate_id: string
  state: DeepChatStateFilter
  from: string
  to: string
}

export interface DeepCasesFiltersProps {
  values: DeepCasesFilterValues
  onChange: (values: DeepCasesFilterValues) => void
  onApply: () => void
  onReset: () => void
  className?: string
  isLoading?: boolean
}

const STATE_OPTIONS: { value: DeepChatStateFilter; label: string }[] = [
  { value: '', label: 'Все' },
  { value: 'not_started', label: 'Не начат' },
  { value: 'active', label: 'Активен' },
  { value: 'awaiting_approval', label: 'Ожидает подтверждения' },
  { value: 'completed', label: 'Завершён' },
  { value: 'cancelled', label: 'Отменён' },
  { value: 'error', label: 'Ошибка' },
]

const inputClassName =
  'border-input bg-background focus:border-ring/40 focus:ring-ring/20 h-9 w-full rounded-md border px-3 text-sm transition-colors duration-200 outline-none focus:ring-1'

const dateInputClassName = cn(
  inputClassName,
  'text-foreground placeholder:text-muted-foreground/70',
  'hover:border-border/70 hover:bg-muted/25',
  'disabled:hover:border-input disabled:hover:bg-background',
)

const invalidInputClassName =
  'border-destructive/60 focus:border-destructive/60 focus:ring-destructive/20'

function sanitizeDateInput(value: string): string {
  return value.replace(/[^\d-]/g, '').slice(0, 10)
}

/**
 * Панель фильтров списка deep cases: gate, state, период.
 */
export function DeepCasesFilters({
  values,
  onChange,
  onApply,
  onReset,
  className,
  isLoading = false,
}: DeepCasesFiltersProps) {
  const [errors, setErrors] = useState<DeepCasesFilterErrors>({})

  const clearFieldError = (field: keyof DeepCasesFilterErrors) => {
    setErrors((current) => {
      if (!current[field]) {
        return current
      }

      const next = { ...current }
      delete next[field]
      return next
    })
  }

  const handleGateChange = (value: string) => {
    clearFieldError('gate_id')
    onChange({ ...values, gate_id: value.replace(/\D/g, '') })
  }

  const handleDateChange = (field: 'from' | 'to', value: string) => {
    clearFieldError(field)
    onChange({ ...values, [field]: sanitizeDateInput(value) })
  }

  const handleApply = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validateDeepCasesFilters(values)

    if (hasDeepCasesFilterErrors(nextErrors)) {
      setErrors(nextErrors)
      return
    }

    setErrors({})
    onApply()
  }

  return (
    <form
      className={cn('flex w-full flex-col gap-4', className)}
      onSubmit={handleApply}
      data-testid="deep-cases-filters"
    >
      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex w-full flex-col gap-1 text-sm">
          <span className="text-muted-foreground text-xs">Gate</span>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            className={cn(
              inputClassName,
              'font-mono hover:border-border/70 hover:bg-muted/25',
              errors.gate_id && invalidInputClassName,
            )}
            value={values.gate_id}
            onChange={(event) => handleGateChange(event.target.value)}
            placeholder="42"
            aria-label="Gate ID"
            aria-invalid={Boolean(errors.gate_id)}
            disabled={isLoading}
          />
          {errors.gate_id ? (
            <span className="text-destructive text-xs">{errors.gate_id}</span>
          ) : null}
        </label>

        <label className="flex w-full flex-col gap-1 text-sm">
          <span className="text-muted-foreground text-xs">State</span>
          <select
            className={cn(inputClassName, 'hover:border-border/70 hover:bg-muted/25')}
            value={values.state}
            onChange={(event) =>
              onChange({
                ...values,
                state: event.target.value as DeepChatStateFilter,
              })
            }
            aria-label="Статус чата"
            disabled={isLoading}
          >
            {STATE_OPTIONS.map((option) => (
              <option key={option.value || 'all'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex w-full flex-col gap-1 text-sm">
          <span className="text-muted-foreground text-xs">From</span>
          <input
            type="text"
            inputMode="numeric"
            className={cn(dateInputClassName, errors.from && invalidInputClassName)}
            value={values.from}
            onChange={(event) => handleDateChange('from', event.target.value)}
            placeholder="yyyy-mm-dd"
            aria-label="Период от"
            aria-invalid={Boolean(errors.from)}
            disabled={isLoading}
          />
          {errors.from ? (
            <span className="text-destructive text-xs">{errors.from}</span>
          ) : null}
        </label>

        <label className="flex w-full flex-col gap-1 text-sm">
          <span className="text-muted-foreground text-xs">To</span>
          <input
            type="text"
            inputMode="numeric"
            className={cn(dateInputClassName, errors.to && invalidInputClassName)}
            value={values.to}
            onChange={(event) => handleDateChange('to', event.target.value)}
            placeholder="yyyy-mm-dd"
            aria-label="Период до"
            aria-invalid={Boolean(errors.to)}
            disabled={isLoading}
          />
          {errors.to ? (
            <span className="text-destructive text-xs">{errors.to}</span>
          ) : null}
        </label>
      </div>

      <div className="flex w-full justify-end gap-2">
        <Button type="submit" size="sm" className="min-w-28" disabled={isLoading}>
          Применить
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="min-w-28 hover:bg-muted/60"
          onClick={() => {
            setErrors({})
            onReset()
          }}
          disabled={isLoading}
        >
          Сбросить
        </Button>
      </div>
    </form>
  )
}
