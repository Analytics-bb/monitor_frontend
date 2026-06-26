import { useCallback, useEffect, useState } from 'react'

import { formatContextScope } from '@/api/fixtures/agentContext'
import { listContexts, type AgentContext, type AgentKind } from '@/api/contexts'
import { settingsFieldClassName } from '@/components/settings/InstructionFormFields'
import { ContextEditor } from '@/components/settings/ContextEditor'
import { SettingsInlineError } from '@/components/settings/SettingsInlineError'
import { resolveSettingsError } from '@/components/settings/settingsErrors'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface ContextsTabProps {
  className?: string
}

type AgentKindFilter = AgentKind | 'all'
type ScopeFilter = 'all' | 'global' | 'gate'

interface ContextFilterValues {
  agent_kind: AgentKindFilter
  scope: ScopeFilter
  gate_id: string
}

type EditorState =
  | { mode: 'closed' }
  | { mode: 'edit'; context: AgentContext }

const defaultFilters: ContextFilterValues = {
  agent_kind: 'all',
  scope: 'all',
  gate_id: '',
}

function truncatePreview(body: string, maxLength = 120): string {
  if (body.length <= maxLength) {
    return body
  }
  return `${body.slice(0, maxLength)}…`
}

function resolveListGateId(
  filters: ContextFilterValues,
): string | undefined {
  if (filters.scope === 'global') {
    return undefined
  }

  const trimmed = filters.gate_id.trim()
  return trimmed || undefined
}

/**
 * Вкладка Contexts: фильтры, список и editor (только правка).
 */
export function ContextsTab({ className }: ContextsTabProps) {
  const [filters, setFilters] = useState<ContextFilterValues>(defaultFilters)
  const [appliedFilters, setAppliedFilters] = useState(filters)
  const [items, setItems] = useState<AgentContext[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [editor, setEditor] = useState<EditorState>({ mode: 'closed' })

  const loadList = useCallback(async (nextFilters: ContextFilterValues) => {
    setIsLoading(true)
    setLoadError(null)

    try {
      const gateId = resolveListGateId(nextFilters)
      const response = await listContexts({
        agent_kind:
          nextFilters.agent_kind === 'all' ? undefined : nextFilters.agent_kind,
        gate_id: gateId,
        page: 1,
        page_size: 50,
      })

      let nextItems = response.items
      if (nextFilters.scope === 'global') {
        nextItems = nextItems.filter((item) => item.gate_id === null)
      } else if (nextFilters.scope === 'gate' && !gateId) {
        nextItems = nextItems.filter((item) => item.gate_id !== null)
      }

      setItems(nextItems)
      setTotal(
        nextFilters.scope === 'global' || (nextFilters.scope === 'gate' && !gateId)
          ? nextItems.length
          : response.total,
      )
    } catch (error) {
      setLoadError(resolveSettingsError(error).message)
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
    setFilters(defaultFilters)
    setAppliedFilters(defaultFilters)
  }

  const isGateInputDisabled = filters.scope === 'global'

  return (
    <div className={cn('space-y-4', className)} data-testid="contexts-tab">
      <form
        className="border-border bg-card space-y-3 rounded-lg border p-4"
        onSubmit={handleApply}
        data-testid="contexts-filters"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted-foreground text-xs">Agent kind</span>
            <select
              className={settingsFieldClassName}
              value={filters.agent_kind}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  agent_kind: event.target.value as AgentKindFilter,
                }))
              }
            >
              <option value="all">all</option>
              <option value="hypothesis">hypothesis</option>
              <option value="deep">deep</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted-foreground text-xs">Scope</span>
            <select
              className={settingsFieldClassName}
              value={filters.scope}
              onChange={(event) => {
                const scope = event.target.value as ScopeFilter
                setFilters((current) => ({
                  ...current,
                  scope,
                  gate_id: scope === 'global' ? '' : current.gate_id,
                }))
              }}
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
              className={cn(settingsFieldClassName, 'font-mono')}
              value={filters.gate_id}
              disabled={isGateInputDisabled}
              placeholder="42"
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  gate_id: event.target.value.replace(/\D/g, ''),
                }))
              }
            />
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
            disabled={isLoading}
            onClick={handleReset}
          >
            Сбросить
          </Button>
        </div>
      </form>

      {editor.mode === 'edit' ? (
        <ContextEditor
          context={editor.context}
          onClose={() => setEditor({ mode: 'closed' })}
          onSaved={async () => loadList(appliedFilters)}
        />
      ) : null}

      {isLoading ? (
        <div className="space-y-3">
          <div className="bg-muted h-24 animate-pulse rounded-lg" />
          <div className="bg-muted h-24 animate-pulse rounded-lg" />
        </div>
      ) : loadError ? (
        <div className="space-y-3">
          <SettingsInlineError message={loadError} />
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
        </div>
      ) : (
        <>
          <p className="text-muted-foreground text-xs">Всего: {total}</p>
          <div className="grid gap-3" data-testid="contexts-card-list">
            {items.map((item) => (
              <article
                key={item.context_id}
                className="border-border bg-card hover:bg-muted/20 cursor-pointer rounded-lg border p-4 transition-colors"
                data-testid="context-card"
                onClick={() => setEditor({ mode: 'edit', context: item })}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    setEditor({ mode: 'edit', context: item })
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-medium capitalize">{item.agent_kind}</h3>
                  <Badge variant="secondary">{formatContextScope(item)}</Badge>
                </div>
                <p className="text-muted-foreground mt-2 text-sm">
                  {truncatePreview(item.context_body)}
                </p>
                <p className="text-muted-foreground mt-2 font-mono text-xs">
                  updated {item.updated_at}
                </p>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
