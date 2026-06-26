import type { Action, MatchPredicate } from '@/api/fixtures/agentInstruction'
import { cn } from '@/lib/utils'

export const settingsFieldClassName =
  'border-input bg-background focus:border-ring/40 focus:ring-ring/20 h-9 w-full rounded-md border px-3 text-sm transition-colors duration-200 outline-none focus:ring-1 hover:border-border/70 hover:bg-muted/25'

export const settingsTextareaClassName = cn(
  settingsFieldClassName,
  'h-auto min-h-[240px] py-2 font-mono',
)

const fieldsetClassName = 'border-border/60 space-y-3 rounded-md border p-3'

export interface MatchPredicateFieldsProps {
  value: MatchPredicate
  onChange: (value: MatchPredicate) => void
}

/**
 * Поля MatchPredicate для формы instruction.
 */
export function MatchPredicateFields({
  value,
  onChange,
}: MatchPredicateFieldsProps) {
  return (
    <fieldset className={fieldsetClassName} data-testid="match-fields">
      <legend className="text-muted-foreground px-1 text-xs font-medium">
        Match
      </legend>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted-foreground text-xs">gate_id</span>
        <input
          className={settingsFieldClassName}
          value={value.gate_id ?? ''}
          placeholder="пусто = любой"
          onChange={(event) =>
            onChange({
              ...value,
              gate_id: event.target.value.trim() || null,
            })
          }
        />
      </label>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground text-xs">triggered_by</span>
          <select
            className={settingsFieldClassName}
            value={value.triggered_by}
            onChange={(event) =>
              onChange({
                ...value,
                triggered_by: event.target.value as MatchPredicate['triggered_by'],
              })
            }
          >
            <option value="any">any</option>
            <option value="tx_count">tx_count</option>
            <option value="success_rate">success_rate</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground text-xs">direction</span>
          <select
            className={settingsFieldClassName}
            value={value.direction}
            onChange={(event) =>
              onChange({
                ...value,
                direction: event.target.value as MatchPredicate['direction'],
              })
            }
          >
            <option value="any">any</option>
            <option value="LOW">LOW</option>
            <option value="HIGH">HIGH</option>
          </select>
        </label>
      </div>
    </fieldset>
  )
}

export interface ActionFieldsProps {
  value: Action
  onChange: (value: Action) => void
}

/**
 * Поля Action для формы instruction.
 */
export function ActionFields({ value, onChange }: ActionFieldsProps) {
  return (
    <fieldset className={fieldsetClassName} data-testid="action-fields">
      <legend className="text-muted-foreground px-1 text-xs font-medium">
        Action
      </legend>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground text-xs">decision</span>
          <select
            className={settingsFieldClassName}
            value={value.decision}
            onChange={(event) =>
              onChange({
                ...value,
                decision: event.target.value as Action['decision'],
              })
            }
          >
            <option value="escalate">escalate</option>
            <option value="close_fast">close_fast</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground text-xs">severity</span>
          <select
            className={settingsFieldClassName}
            value={value.severity}
            onChange={(event) =>
              onChange({
                ...value,
                severity: event.target.value as Action['severity'],
              })
            }
          >
            <option value="info">info</option>
            <option value="warning">warning</option>
            <option value="critical">critical</option>
          </select>
        </label>
      </div>
    </fieldset>
  )
}
