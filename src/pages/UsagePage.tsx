import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'

import { listUsageRuns, listUsageDaily } from '@/api/usage'
import { mapApiError } from '@/api/errors'
import { DeepCasesPagination } from '@/components/deep/DeepCasesPagination'
import {
  UsageDailySummary,
  getUsageTodayDateString,
} from '@/components/usage/UsageDailySummary'
import {
  UsageFilters,
  EMPTY_USAGE_FILTERS,
  hasActiveUsageFilters,
  readUsageFiltersFromSearchParams,
  type UsageFiltersState,
} from '@/components/usage/UsageFilters'
import { UsageRunsTable } from '@/components/usage/UsageRunsTable'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface UsageZoneProps {
  label: string
  testId: string
  children: React.ReactNode
  className?: string
}

function UsageZone({ label, testId, children, className }: UsageZoneProps) {
  return (
    <section
      aria-label={label}
      data-testid={testId}
      className={cn('border-border bg-card rounded-lg border p-4', className)}
    >
      {children}
    </section>
  )
}

function TableSkeletonRows({ rows = 8 }: { rows?: number }) {
  return (
    <div className="space-y-2" data-testid="usage-table-skeleton">
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className="bg-muted/60 h-9 animate-pulse rounded-md"
          aria-hidden
        />
      ))}
    </div>
  )
}

/**
 * Страница usage runs: фильтры, таблица M14 и server-side pagination.
 */
export function UsagePage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [filterDraft, setFilterDraft] = useState<UsageFiltersState | null>(
    null,
  )
  const [items, setItems] = useState<Awaited<
    ReturnType<typeof listUsageRuns>
  >['items']>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dailyRollups, setDailyRollups] = useState<
    Awaited<ReturnType<typeof listUsageDaily>>
  >([])
  const [isDailyLoading, setIsDailyLoading] = useState(true)

  const page = Number(searchParams.get('page') ?? '1') || 1
  const pageSize = Number(searchParams.get('page_size') ?? '50') || 50
  const appliedFilters = useMemo(
    () => readUsageFiltersFromSearchParams(searchParams),
    [searchParams],
  )
  const draftFilters = filterDraft ?? appliedFilters

  const listParams = useMemo(
    () => ({
      gate_id: appliedFilters.gate_id || undefined,
      agent_kind: appliedFilters.agent_kind || undefined,
      audit_id: appliedFilters.audit_id || undefined,
      from: appliedFilters.from || undefined,
      to: appliedFilters.to || undefined,
      page,
      page_size: pageSize,
    }),
    [
      appliedFilters.agent_kind,
      appliedFilters.audit_id,
      appliedFilters.from,
      appliedFilters.gate_id,
      appliedFilters.to,
      page,
      pageSize,
    ],
  )

  const refetch = useCallback(async () => {
    setIsLoading(true)

    try {
      const response = await listUsageRuns(listParams)
      setItems(response.items)
      setTotal(response.total)
      setError(null)
    } catch (fetchError) {
      mapApiError(fetchError)
      setError('Не удалось загрузить usage runs')
      setItems([])
      setTotal(0)
    } finally {
      setIsLoading(false)
    }
  }, [listParams])

  const refetchDaily = useCallback(async () => {
    setIsDailyLoading(true)

    try {
      const today = getUsageTodayDateString()
      const rollups = await listUsageDaily({
        gate_id: appliedFilters.gate_id || undefined,
        date_from: today,
        date_to: today,
      })
      setDailyRollups(rollups)
    } catch (fetchError) {
      mapApiError(fetchError)
      setDailyRollups([])
    } finally {
      setIsDailyLoading(false)
    }
  }, [appliedFilters.gate_id])

  useEffect(() => {
    let cancelled = false

    void (async () => {
      setIsLoading(true)

      try {
        const response = await listUsageRuns(listParams)
        if (cancelled) {
          return
        }
        setItems(response.items)
        setTotal(response.total)
        setError(null)
      } catch (fetchError) {
        if (cancelled) {
          return
        }
        mapApiError(fetchError)
        setError('Не удалось загрузить usage runs')
        setItems([])
        setTotal(0)
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [listParams])

  useEffect(() => {
    let cancelled = false

    void (async () => {
      setIsDailyLoading(true)

      try {
        const today = getUsageTodayDateString()
        const rollups = await listUsageDaily({
          gate_id: appliedFilters.gate_id || undefined,
          date_from: today,
          date_to: today,
        })
        if (!cancelled) {
          setDailyRollups(rollups)
        }
      } catch (fetchError) {
        if (!cancelled) {
          mapApiError(fetchError)
          setDailyRollups([])
        }
      } finally {
        if (!cancelled) {
          setIsDailyLoading(false)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [appliedFilters.gate_id])

  useEffect(() => {
    if (isLoading || total === 0) {
      return
    }

    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    if (page > totalPages) {
      const next = new URLSearchParams(searchParams)
      next.set('page', String(totalPages))
      setSearchParams(next, { replace: true })
    }
  }, [isLoading, page, pageSize, searchParams, setSearchParams, total])

  const updatePageParams = (nextPage: number, nextPageSize = pageSize) => {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(nextPage))
    next.set('page_size', String(nextPageSize))
    setSearchParams(next)
  }

  const handleApply = () => {
    const next = new URLSearchParams()
    if (draftFilters.gate_id) {
      next.set('gate_id', draftFilters.gate_id)
    }
    if (draftFilters.agent_kind) {
      next.set('agent_kind', draftFilters.agent_kind)
    }
    if (draftFilters.from) {
      next.set('from', draftFilters.from)
    }
    if (draftFilters.to) {
      next.set('to', draftFilters.to)
    }
    if (draftFilters.audit_id) {
      next.set('audit_id', draftFilters.audit_id)
    }
    next.set('page', '1')
    next.set('page_size', String(pageSize))
    setFilterDraft(null)
    setSearchParams(next)
  }

  const handleReset = () => {
    setFilterDraft(EMPTY_USAGE_FILTERS)
    setSearchParams(
      new URLSearchParams({ page: '1', page_size: String(pageSize) }),
    )
  }

  const handleClearAuditId = () => {
    const next = new URLSearchParams(searchParams)
    next.delete('audit_id')
    next.set('page', '1')
    setFilterDraft(null)
    setSearchParams(next)
  }

  const handleRowClick = (runId: string) => {
    navigate(`/usage/${runId}`, {
      state: { usageListSearch: searchParams.toString() },
    })
  }

  const showFilteredEmpty =
    !isLoading &&
    !error &&
    items.length === 0 &&
    hasActiveUsageFilters(appliedFilters)

  const showGlobalEmpty =
    !isLoading &&
    !error &&
    items.length === 0 &&
    !hasActiveUsageFilters(appliedFilters)

  const emptyMessage = appliedFilters.audit_id
    ? 'Нет runs для этого audit'
    : 'Нет runs за период'

  return (
    <div
      className="mx-auto flex h-[calc(100svh-3rem)] w-full max-w-[1440px] flex-col gap-4 overflow-hidden"
      data-testid="usage-page"
    >
      <header className="flex shrink-0 items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Usage</h1>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isLoading}
          onClick={() => {
            void refetch()
            void refetchDaily()
          }}
        >
          Refresh
        </Button>
      </header>

      <UsageDailySummary rollups={dailyRollups} isLoading={isDailyLoading} />

      <UsageZone
        label="Фильтры usage runs"
        testId="usage-filters-zone"
        className="shrink-0 shadow-sm"
      >
        <UsageFilters
          values={draftFilters}
          onChange={setFilterDraft}
          onApply={handleApply}
          onReset={handleReset}
          onClearAuditId={handleClearAuditId}
          isLoading={isLoading}
        />
      </UsageZone>

      <UsageZone
        label="Список usage runs"
        testId="usage-table-zone"
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        <div className="deep-table-scroll -mr-1 min-h-0 flex-1 overflow-x-auto overflow-y-auto pr-1">
          {isLoading ? <TableSkeletonRows /> : null}

          {!isLoading && error ? (
            <div
              className="border-destructive/30 bg-destructive/5 space-y-3 rounded-md border p-4"
              data-testid="usage-list-error"
              role="alert"
            >
              <p className="text-destructive text-sm">{error}</p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => void refetch()}
              >
                Retry
              </Button>
            </div>
          ) : null}

          {showGlobalEmpty || showFilteredEmpty ? (
            <p
              className="text-muted-foreground text-sm"
              data-testid="usage-table-empty"
            >
              {emptyMessage}
            </p>
          ) : null}

          {!isLoading && !error && items.length > 0 ? (
            <UsageRunsTable items={items} onRowClick={handleRowClick} />
          ) : null}
        </div>
      </UsageZone>

      <UsageZone
        label="Pagination"
        testId="usage-pagination-zone"
        className="shrink-0 py-3"
      >
        <DeepCasesPagination
          total={total}
          page={page}
          pageSize={pageSize}
          itemsOnPage={items.length}
          onPageChange={(nextPage) => updatePageParams(nextPage)}
          onPageSizeChange={(nextPageSize) => updatePageParams(1, nextPageSize)}
        />
      </UsageZone>
    </div>
  )
}
