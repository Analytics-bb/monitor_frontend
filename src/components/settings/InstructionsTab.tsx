import { useCallback, useEffect, useState } from 'react'

import { mapApiError } from '@/api/errors'
import {
  listInstructions,
  patchInstruction,
  type AgentInstruction,
} from '@/api/instructions'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

export interface InstructionsTabProps {
  className?: string
}

/**
 * Вкладка Instructions: список и toggle enabled.
 */
export function InstructionsTab({ className }: InstructionsTabProps) {
  const [items, setItems] = useState<AgentInstruction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const loadList = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)
    try {
      const data = await listInstructions()
      setItems(data)
    } catch (error) {
      mapApiError(error)
      setLoadError('Не удалось загрузить instructions')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadList()
  }, [loadList])

  const handleToggleEnabled = async (
    instruction: AgentInstruction,
    nextEnabled: boolean,
  ) => {
    if (togglingId) {
      return
    }

    const previousEnabled = instruction.enabled
    setTogglingId(instruction.id)
    setItems((current) =>
      current.map((item) =>
        item.id === instruction.id
          ? { ...item, enabled: nextEnabled }
          : item,
      ),
    )

    try {
      const updated = await patchInstruction(instruction.id, {
        enabled: nextEnabled,
      })
      setItems((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      )
    } catch (error) {
      setItems((current) =>
        current.map((item) =>
          item.id === instruction.id
            ? { ...item, enabled: previousEnabled }
            : item,
        ),
      )
      mapApiError(error)
    } finally {
      setTogglingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className={cn('space-y-3', className)} data-testid="instructions-tab">
        <div className="bg-muted h-9 w-40 animate-pulse rounded-md" />
        <div className="bg-muted h-48 animate-pulse rounded-lg" />
      </div>
    )
  }

  if (loadError) {
    return (
      <div className={cn('space-y-3', className)} data-testid="instructions-tab">
        <p className="text-destructive text-sm">{loadError}</p>
        <Button type="button" variant="outline" onClick={() => void loadList()}>
          Повторить
        </Button>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)} data-testid="instructions-tab">
      <div className="flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">
          {items.length === 0
            ? 'Нет instructions'
            : `Всего: ${items.length}`}
        </p>
        <Button type="button" disabled aria-label="New instruction">
          + New instruction
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Создание instructions будет доступно в следующей задаче.
        </p>
      ) : (
        <div className="border-border overflow-x-auto rounded-lg border">
          <table
            className="w-full min-w-[640px] border-collapse text-sm"
            aria-label="Agent instructions"
            data-testid="instructions-table"
          >
            <thead className="bg-muted/40">
              <tr className="border-border border-b">
                <th className="px-3 py-2 text-left font-medium">Name</th>
                <th className="px-3 py-2 text-center font-medium">Enabled</th>
                <th className="px-3 py-2 text-left font-medium">Updated</th>
                <th className="px-3 py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="border-border border-b"
                  data-testid="instructions-table-row"
                >
                  <td className="px-3 py-2">{item.name}</td>
                  <td className="px-3 py-2 text-center">
                    <Switch
                      checked={item.enabled}
                      disabled={togglingId === item.id}
                      aria-label={`Enabled: ${item.name}`}
                      onCheckedChange={(checked) =>
                        void handleToggleEnabled(item, checked)
                      }
                    />
                  </td>
                  <td className="text-muted-foreground px-3 py-2 font-mono text-xs">
                    {item.updated_at}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Button type="button" variant="ghost" size="sm" disabled>
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled
                      className="text-destructive"
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
