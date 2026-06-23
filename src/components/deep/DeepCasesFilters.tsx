import type { DeepCaseSummary } from '@/api/deep'
import { Button } from '@/components/ui/button'
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
  'border-input bg-background focus:border-ring/40 focus:ring-ring/20 h-9 rounded-md border px-3 text-sm transition-colors outline-none focus:ring-1'

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
  const handleGateChange = (value: string) => {
    onChange({ ...values, gate_id: value.replace(/\D/g, '') })
  }

  const handleApply = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onApply()
  }

  return (
    <form
      className={cn(
        'flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between',
        className,
      )}
      onSubmit={handleApply}
      data-testid="deep-cases-filters"
    >
      <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground text-xs">Gate</span>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            className={cn(inputClassName, 'font-mono')}
            value={values.gate_id}
            onChange={(event) => handleGateChange(event.target.value)}
            placeholder="42"
            aria-label="Gate ID"
            disabled={isLoading}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground text-xs">State</span>
          <select
            className={inputClassName}
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

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground text-xs">From</span>
          <input
            type="date"
            className={inputClassName}
            value={values.from}
            onChange={(event) =>
              onChange({ ...values, from: event.target.value })
            }
            aria-label="Период от"
            disabled={isLoading}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground text-xs">To</span>
          <input
            type="date"
            className={inputClassName}
            value={values.to}
            onChange={(event) =>
              onChange({ ...values, to: event.target.value })
            }
            aria-label="Период до"
            disabled={isLoading}
          />
        </label>
      </div>

      <div className="flex shrink-0 justify-end gap-2 lg:ml-4">
        <Button type="submit" size="sm" disabled={isLoading}>
          Применить
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="hover:bg-muted/60"
          onClick={onReset}
          disabled={isLoading}
        >
          Сбросить
        </Button>
      </div>
    </form>
  )
}
