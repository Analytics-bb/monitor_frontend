import { toast } from 'sonner'

import { isFullAuditId } from '@/lib/auditId'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface DeepCasesFilterValues {
  audit_id: string
  gate_id: string
  from: string
  to: string
}

export interface DeepCasesFiltersProps {
  values: DeepCasesFilterValues
  onChange: (values: DeepCasesFilterValues) => void
  onApply: () => void
  onReset: () => void
  onAuditNavigate: (auditId: string) => void
  className?: string
  isLoading?: boolean
}

/**
 * Панель фильтров списка deep cases: audit shortcut, gate, период.
 */
export function DeepCasesFilters({
  values,
  onChange,
  onApply,
  onReset,
  onAuditNavigate,
  className,
  isLoading = false,
}: DeepCasesFiltersProps) {
  const handleGateChange = (value: string) => {
    onChange({ ...values, gate_id: value.replace(/\D/g, '') })
  }

  const handleApply = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedAuditId = values.audit_id.trim()
    if (trimmedAuditId) {
      if (isFullAuditId(trimmedAuditId)) {
        onAuditNavigate(trimmedAuditId)
        return
      }

      if (trimmedAuditId.includes('-')) {
        toast.error('invalid_audit_id', {
          description: 'Некорректный audit_id',
        })
        return
      }
    }

    onApply()
  }

  return (
    <form
      className={cn('space-y-4', className)}
      onSubmit={handleApply}
      data-testid="deep-cases-filters"
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground text-xs">Audit ID</span>
          <input
            type="text"
            className="border-input bg-background focus:border-ring/40 focus:ring-ring/20 h-9 rounded-md border px-3 text-sm transition-colors outline-none focus:ring-1"
            value={values.audit_id}
            onChange={(event) =>
              onChange({ ...values, audit_id: event.target.value })
            }
            placeholder="UUID или prefix"
            aria-label="Audit ID"
            disabled={isLoading}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground text-xs">Gate</span>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            className="border-input bg-background focus:border-ring/40 focus:ring-ring/20 h-9 rounded-md border px-3 font-mono text-sm transition-colors outline-none focus:ring-1"
            value={values.gate_id}
            onChange={(event) => handleGateChange(event.target.value)}
            placeholder="42"
            aria-label="Gate ID"
            disabled={isLoading}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground text-xs">From</span>
          <input
            type="date"
            className="border-input bg-background focus:border-ring/40 focus:ring-ring/20 h-9 rounded-md border px-3 text-sm transition-colors outline-none focus:ring-1"
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
            className="border-input bg-background focus:border-ring/40 focus:ring-ring/20 h-9 rounded-md border px-3 text-sm transition-colors outline-none focus:ring-1"
            value={values.to}
            onChange={(event) =>
              onChange({ ...values, to: event.target.value })
            }
            aria-label="Период до"
            disabled={isLoading}
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm" disabled={isLoading}>
          Apply
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onReset}
          disabled={isLoading}
        >
          Reset
        </Button>
      </div>
    </form>
  )
}
