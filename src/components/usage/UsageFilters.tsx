import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  hasUsageFilterErrors,
  validateUsageFilters,
  type UsageFilterErrors,
  type UsageFiltersState,
} from '@/lib/usageFilters'
import { cn } from '@/lib/utils'

export type { AgentKindFilter, UsageFiltersState } from '@/lib/usageFilters'
export {
  EMPTY_USAGE_FILTERS,
  hasActiveUsageFilters,
  readUsageFiltersFromSearchParams,
  writeUsageFiltersToSearchParams,
} from '@/lib/usageFilters'

export interface UsageFiltersProps {
  values: UsageFiltersState
  onChange: (values: UsageFiltersState) => void
  onApply: () => void
  onReset: () => void
  onClearAuditId?: () => void
  className?: string
  isLoading?: boolean
}

const AGENT_KIND_OPTIONS: {
  value: UsageFiltersState['agent_kind']
  label: string
}[] = [
  { value: '', label: 'Все' },
  { value: 'hypothesis', label: 'Hypothesis' },
  { value: 'deep', label: 'Deep' },
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
 * Панель фильтров страницы usage: gate, agent kind, период, audit_id chip.
 */
export function UsageFilters({
  values,
  onChange,
  onApply,
  onReset,
  onClearAuditId,
  className,
  isLoading = false,
}: UsageFiltersProps) {
  const [errors, setErrors] = useState<UsageFilterErrors>({})

  const clearFieldError = (field: keyof UsageFilterErrors) => {
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
    const nextErrors = validateUsageFilters(values)

    if (hasUsageFilterErrors(nextErrors)) {
      setErrors(nextErrors)
      return
    }

    setErrors({})
    onApply()
  }

  const handleClearAuditId = () => {
    clearFieldError('audit_id')
    onChange({ ...values, audit_id: '' })
    onClearAuditId?.()
  }

  return (
    <form
      className={cn('flex w-full flex-col gap-4', className)}
      onSubmit={handleApply}
      data-testid="usage-filters"
    >
      {values.audit_id ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground text-xs">Audit</span>
          <span
            className="bg-muted text-foreground inline-flex items-center gap-2 rounded-full px-3 py-1 font-mono text-xs"
            data-testid="usage-audit-id-chip"
          >
            {values.audit_id}
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground"
              onClick={handleClearAuditId}
              aria-label="Убрать фильтр audit_id"
              disabled={isLoading}
            >
              ×
            </button>
          </span>
        </div>
      ) : null}

      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex w-full flex-col gap-1 text-sm">
          <span className="text-muted-foreground text-xs">Gate</span>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            className={cn(
              inputClassName,
              'hover:border-border/70 hover:bg-muted/25 font-mono',
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
          <span className="text-muted-foreground text-xs">Agent kind</span>
          <select
            className={cn(
              inputClassName,
              'hover:border-border/70 hover:bg-muted/25',
            )}
            value={values.agent_kind}
            onChange={(event) =>
              onChange({
                ...values,
                agent_kind: event.target
                  .value as UsageFiltersState['agent_kind'],
              })
            }
            aria-label="Тип агента"
            disabled={isLoading}
          >
            {AGENT_KIND_OPTIONS.map((option) => (
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
            className={cn(
              dateInputClassName,
              errors.from && invalidInputClassName,
            )}
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
            className={cn(
              dateInputClassName,
              errors.to && invalidInputClassName,
            )}
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
        <Button
          type="submit"
          size="sm"
          className="min-w-28"
          disabled={isLoading}
        >
          Применить
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="hover:bg-muted/60 min-w-28"
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
