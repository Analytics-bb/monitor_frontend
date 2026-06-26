import { useCallback, useEffect, useState } from 'react'

import type { DetectorConfig, DetectorConfigPatch } from '@/api/detector'
import {
  getGlobalDetectorConfig,
  patchGlobalDetectorConfig,
  resetGlobalDetectorConfig,
} from '@/api/detector'
import { mapApiError } from '@/api/errors'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface DetectorConfigTabProps {
  className?: string
}

const inputClassName =
  'border-input bg-background h-9 w-full rounded-md border px-3 text-sm'

/**
 * Вкладка Detector: редактирование global config (M2).
 */
export function DetectorConfigTab({ className }: DetectorConfigTabProps) {
  const [config, setConfig] = useState<DetectorConfig | null>(null)
  const [form, setForm] = useState<Required<DetectorConfigPatch> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  const loadConfig = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)
    try {
      const data = await getGlobalDetectorConfig()
      setConfig(data)
      setForm({
        slice_minutes: data.slice_minutes,
        window_slices: data.window_slices,
        quantile_low: data.quantile_low,
        quantile_high: data.quantile_high,
        persistence: data.persistence,
        mode: data.mode,
      })
    } catch (error) {
      mapApiError(error)
      setLoadError('Не удалось загрузить detector config')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadConfig()
  }, [loadConfig])

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!form || isSaving) {
      return
    }

    setIsSaving(true)
    try {
      const updated = await patchGlobalDetectorConfig(form)
      setConfig(updated)
      setForm({
        slice_minutes: updated.slice_minutes,
        window_slices: updated.window_slices,
        quantile_low: updated.quantile_low,
        quantile_high: updated.quantile_high,
        persistence: updated.persistence,
        mode: updated.mode,
      })
    } catch (error) {
      mapApiError(error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = async () => {
    if (isResetting) {
      return
    }

    setIsResetting(true)
    try {
      await resetGlobalDetectorConfig()
      await loadConfig()
    } catch (error) {
      mapApiError(error)
    } finally {
      setIsResetting(false)
    }
  }

  if (isLoading) {
    return (
      <div className={cn('space-y-3', className)} data-testid="detector-config-tab">
        <div className="bg-muted h-48 animate-pulse rounded-lg" />
      </div>
    )
  }

  if (loadError || !form || !config) {
    return (
      <div className={cn('space-y-3', className)} data-testid="detector-config-tab">
        <p className="text-destructive text-sm">{loadError ?? 'Config unavailable'}</p>
        <Button type="button" variant="outline" onClick={() => void loadConfig()}>
          Повторить
        </Button>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)} data-testid="detector-config-tab">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Global detector config</h2>
          <p className="text-muted-foreground text-xs">
            Per-gate overrides — позже. updated {config.updated_at}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={isResetting || isSaving}
          onClick={() => void handleReset()}
        >
          {isResetting ? 'Resetting…' : 'Reset to default'}
        </Button>
      </div>

      <form
        className="border-border bg-card grid max-w-xl grid-cols-1 gap-4 rounded-lg border p-4 sm:grid-cols-2"
        onSubmit={(event) => void handleSave(event)}
      >
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground text-xs">slice_minutes</span>
          <input
            type="number"
            min={1}
            className={inputClassName}
            value={form.slice_minutes ?? ''}
            onChange={(event) =>
              setForm((current) =>
                current
                  ? {
                      ...current,
                      slice_minutes: Number(event.target.value),
                    }
                  : current,
              )
            }
            required
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground text-xs">window_slices</span>
          <input
            type="number"
            min={1}
            className={inputClassName}
            value={form.window_slices ?? ''}
            onChange={(event) =>
              setForm((current) =>
                current
                  ? {
                      ...current,
                      window_slices: Number(event.target.value),
                    }
                  : current,
              )
            }
            required
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground text-xs">quantile_low</span>
          <input
            type="number"
            step="0.01"
            min={0}
            max={1}
            className={inputClassName}
            value={form.quantile_low ?? ''}
            onChange={(event) =>
              setForm((current) =>
                current
                  ? {
                      ...current,
                      quantile_low: Number(event.target.value),
                    }
                  : current,
              )
            }
            required
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground text-xs">quantile_high</span>
          <input
            type="number"
            step="0.01"
            min={0}
            max={1}
            className={inputClassName}
            value={form.quantile_high ?? ''}
            onChange={(event) =>
              setForm((current) =>
                current
                  ? {
                      ...current,
                      quantile_high: Number(event.target.value),
                    }
                  : current,
              )
            }
            required
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground text-xs">persistence</span>
          <input
            type="number"
            min={1}
            className={inputClassName}
            value={form.persistence ?? ''}
            onChange={(event) =>
              setForm((current) =>
                current
                  ? {
                      ...current,
                      persistence: Number(event.target.value),
                    }
                  : current,
              )
            }
            required
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground text-xs">mode</span>
          <select
            className={inputClassName}
            value={form.mode ?? 'anomaly'}
            onChange={(event) =>
              setForm((current) =>
                current
                  ? {
                      ...current,
                      mode: event.target.value as NonNullable<
                        DetectorConfigPatch['mode']
                      >,
                    }
                  : current,
              )
            }
          >
            <option value="anomaly">anomaly</option>
            <option value="full">full</option>
          </select>
        </label>

        <div className="flex justify-end sm:col-span-2">
          <Button type="submit" disabled={isSaving || isResetting}>
            {isSaving ? 'Saving…' : 'Save global config'}
          </Button>
        </div>
      </form>
    </div>
  )
}
