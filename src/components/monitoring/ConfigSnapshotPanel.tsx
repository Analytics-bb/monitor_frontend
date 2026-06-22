import { useState } from 'react'
import { Copy } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface ConfigSnapshotPanelProps {
  configSnapshot: Record<string, unknown> | null | undefined
  className?: string
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '—'
  }
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2)
  }
  return String(value)
}

function isEmptySnapshot(
  configSnapshot: Record<string, unknown> | null | undefined,
): boolean {
  return !configSnapshot || Object.keys(configSnapshot).length === 0
}

/**
 * Read-only просмотр `config_snapshot` с accordion и copy.
 */
export function ConfigSnapshotPanel({
  configSnapshot,
  className,
}: ConfigSnapshotPanelProps) {
  const [openKey, setOpenKey] = useState<string | null>(null)

  if (isEmptySnapshot(configSnapshot)) {
    return (
      <p className="text-muted-foreground text-sm" data-testid="config-empty">
        Нет snapshot
      </p>
    )
  }

  const entries = Object.entries(configSnapshot!)

  const copyField = async (key: string, value: unknown) => {
    await navigator.clipboard.writeText(formatValue(value))
    toast.success('Скопировано', { description: key })
  }

  return (
    <div className={cn('space-y-2', className)} data-testid="config-snapshot">
      <h2 className="text-sm font-semibold">Config snapshot</h2>
      <div className="space-y-1">
        {entries.map(([key, value]) => {
          const isOpen = openKey === key
          const display = formatValue(value)
          const truncated =
            display.length > 80 ? `${display.slice(0, 80)}…` : display

          return (
            <div key={key} className="border-border rounded-md border">
              <button
                type="button"
                className="hover:bg-muted/50 flex w-full items-center justify-between px-3 py-2 text-left text-sm"
                aria-expanded={isOpen}
                onClick={() => setOpenKey(isOpen ? null : key)}
              >
                <span className="font-medium">{key}</span>
                <span className="text-muted-foreground font-mono text-xs tabular-nums">
                  {isOpen ? display : truncated}
                </span>
              </button>
              {isOpen ? (
                <div className="border-border flex items-start justify-between gap-2 border-t px-3 py-2">
                  <pre className="font-mono text-xs break-all whitespace-pre-wrap">
                    {display}
                  </pre>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="outline"
                    aria-label={`Копировать ${key}`}
                    onClick={() => void copyField(key, value)}
                  >
                    <Copy className="size-3.5" />
                  </Button>
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
