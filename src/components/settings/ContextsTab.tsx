import { useCallback, useEffect, useState } from 'react'

import { mapApiError } from '@/api/errors'
import {
  listContexts,
  type AgentContext,
  type AgentKind,
} from '@/api/contexts'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface ContextsTabProps {
  className?: string
}

type ScopeFilter = 'all' | 'global' | 'gate'

interface ContextFilterValues {
  agent_kind: AgentKind
  scope: ScopeFilter
  gate_id: string
}

const inputClassName =
  'border-input bg-background focus:border-ring/40 focus:ring-ring/20 h-9 w-full rounded-md border px-3 text-sm transition-colors duration-200 outline-none focus:ring-1'

function truncatePreview(content: string, maxLength = 120): string {
  if (content.length <= maxLength) {
    return content
  }

  return `${content.slice(0, maxLength)}…`
}

/**
 * Вкладка Contexts: фильтры и список карточек.
 */
export function ContextsTab({ className }: ContextsTabProps) {
  const [filters, setFilters] = useState<ContextFilterValues>({
    agent_kind: 'deep',
    scope: 'all',
    gate_id: '',
  })
  const [appliedFilters, setAppliedFilters] = useState(filters)
  const [items, setItems] = useState<AgentContext[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const loadList = useCallback(async (nextFilters: ContextFilterValues) => {
    setIsLoading(true)
    setLoadError(null)

    const gateId =
      nextFilters.scope === 'global'
        ? null
        : nextFilters.scope === 'gate'
          ? nextFilters.gate_id.trim() || undefined
          : undefined

    try {
      const data = await listContexts({
        agent_kind: nextFilters.agent_kind,
        gate_id: gateId,
      })
      setItems(data)
    } catch (error) {
      mapApiError(error)
      setLoadError('Не удалось загрузить contexts')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadList(appliedFilters)
  }, [appliedFilters, loadList])

  const handleApply = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setAppliedFilters(filters)
  }

  const handleReset = () => {
    const reset: ContextFilterValues = {
      agent_kind: 'deep',
      scope: 'all',
      gate_id: '',
    }
    setFilters(reset)
    setAppliedFilters(reset)
  }

  return (
    <div className={cn('space-y-4', className)} data-testid="contexts-tab">
      <form
        className="border-border bg-card grid grid-cols-1 gap-3 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-4"
        onSubmit={handleApply}
        data-testid="contexts-filters"
      >
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground text-xs">Agent kind</span>
          <select
            className={inputClassName}
            value={filters.agent_kind}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                agent_kind: event.target.value as AgentKind,
              }))
            }
          >
            <option value="hypothesis">hypothesis</option>
            <option value="deep">deep</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground text-xs">Scope</span>
          <select
            className={inputClassName}
            value={filters.scope}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                scope: event.target.value as ScopeFilter,
              }))
            }
          >
            <option value="all">Все</option>
            <option value="global">Global</option>
            <option value="gate">Per-gate</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground text-xs">Gate</span>
          <input
            type="text"
            inputMode="numeric"
            className={cn(inputClassName, 'font-mono')}
            value={filters.gate_id}
            disabled={filters.scope !== 'gate'}
            placeholder="42"
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                gate_id: event.target.value.replace(/\D/g, ''),
              }))
            }
          />
        </label>

        <div className="flex items-end justify-end gap-2 sm:col-span-2 lg:col-span-1">
          <Button type="button" variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button type="submit">Apply</Button>
        </div>
      </form>

      {isLoading ? (
        <div className="space-y-3">
          <div className="bg-muted h-24 animate-pulse rounded-lg" />
          <div className="bg-muted h-24 animate-pulse rounded-lg" />
        </div>
      ) : loadError ? (
        <div className="space-y-3">
          <p className="text-destructive text-sm">{loadError}</p>
          <Button
            type="button"
            variant="outline"
            onClick={() => void loadList(appliedFilters)}
          >
            Повторить
          </Button>
        </div>
      ) : items.length === 0 ? (
        <div className="border-border rounded-lg border border-dashed p-6 text-center">
          <p className="text-muted-foreground text-sm">Нет contexts по фильтру</p>
          <Button type="button" className="mt-3" disabled>
            + Create context
          </Button>
        </div>
      ) : (
        <div className="grid gap-3" data-testid="contexts-card-list">
          {items.map((item) => (
            <article
              key={item.context_id}
              className="border-border bg-card rounded-lg border p-4"
              data-testid="context-card"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-medium">{item.key}</h3>
                <Badge variant="secondary">
                  {item.gate_id === null ? 'Global' : `Gate ${item.gate_id}`}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-2 text-sm">
                {truncatePreview(item.content)}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
