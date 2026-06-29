import { useCallback, useEffect, useState } from 'react'

import type { DetectorConfig, DetectorConfigPatch } from '@/api/detector'
import {
  getGlobalDetectorConfig,
  patchGlobalDetectorConfig,
  resetGlobalDetectorConfig,
} from '@/api/detector'
import { CONFIG_FIELD_LABELS } from '@/components/monitoring/ConfigSnapshotPanel'
import { settingsFieldClassName } from '@/components/settings/InstructionFormFields'
import { SettingsInlineError } from '@/components/settings/SettingsInlineError'
import { resolveSettingsError } from '@/components/settings/settingsErrors'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface DetectorConfigTabProps {
  className?: string
}

const resetButtonClassName =
  'text-muted-foreground hover:bg-muted/40 hover:text-foreground focus-visible:ring-1 focus-visible:ring-ring/25 focus-visible:ring-offset-0'

/**
 * Вкладка Detector: редактирование global config (M2).
 */
export function DetectorConfigTab({ className }: DetectorConfigTabProps) {
  const [config, setConfig] = useState<DetectorConfig | null>(null)
  const [form, setForm] = useState<Required<DetectorConfigPatch> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [resetError, setResetError] = useState<string | null>(null)
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
      setLoadError(resolveSettingsError(error).message)
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
    setFormError(null)
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
      setFormError(resolveSettingsError(error).message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = async () => {
    if (isResetting) {
      return
    }

    setIsResetting(true)
    setResetError(null)
    try {
      await resetGlobalDetectorConfig()
      await loadConfig()
    } catch (error) {
      setResetError(resolveSettingsError(error).message)
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
        <SettingsInlineError message={loadError ?? 'Конфиг недоступен'} />
        <Button type="button" size="sm" className="min-w-28" onClick={() => void loadConfig()}>
          Повторить
        </Button>
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)} data-testid="detector-config-tab">
      <SettingsInlineError message={resetError} />

      <form
        className="border-border bg-card grid w-full grid-cols-1 gap-4 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-3"
        onSubmit={(event) => void handleSave(event)}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2 lg:col-span-3">
          <h2 className="text-sm font-semibold">Global Detector Config</h2>
          <Button
            type="button"
            variant="ghost"
            className={resetButtonClassName}
            disabled={isResetting || isSaving}
            onClick={() => void handleReset()}
          >
            {isResetting ? 'Resetting…' : 'Reset'}
          </Button>
        </div>

        <SettingsInlineError className="sm:col-span-2 lg:col-span-3" message={formError} />

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground text-xs">
            {CONFIG_FIELD_LABELS.slice_minutes}
          </span>
          <input
            type="number"
            min={1}
            className={settingsFieldClassName}
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
          <span className="text-muted-foreground text-xs">
            {CONFIG_FIELD_LABELS.window_slices}
          </span>
          <input
            type="number"
            min={1}
            className={settingsFieldClassName}
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
          <span className="text-muted-foreground text-xs">
            {CONFIG_FIELD_LABELS.quantile_low}
          </span>
          <input
            type="number"
            step="0.01"
            min={0}
            max={1}
            className={settingsFieldClassName}
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
          <span className="text-muted-foreground text-xs">
            {CONFIG_FIELD_LABELS.quantile_high}
          </span>
          <input
            type="number"
            step="0.01"
            min={0}
            max={1}
            className={settingsFieldClassName}
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
          <span className="text-muted-foreground text-xs">
            {CONFIG_FIELD_LABELS.persistence}
          </span>
          <input
            type="number"
            min={1}
            className={settingsFieldClassName}
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
          <span className="text-muted-foreground text-xs">
            {CONFIG_FIELD_LABELS.mode}
          </span>
          <select
            className={settingsFieldClassName}
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

        <div className="flex justify-end sm:col-span-2 lg:col-span-3">
          <Button type="submit" disabled={isSaving || isResetting}>
            {isSaving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </form>
    </div>
  )
}
