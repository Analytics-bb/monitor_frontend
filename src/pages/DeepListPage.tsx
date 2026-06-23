import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'

import {
  DeepCasesFilters,
  type DeepCasesFilterValues,
} from '@/components/deep/DeepCasesFilters'
import { DeepCasesTable } from '@/components/deep/DeepCasesTable'
import { DeepCasesPagination } from '@/components/deep/DeepCasesPagination'
import { useDeepCasesList } from '@/hooks/useDeepCasesList'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface DeepListZoneProps {
  label: string
  testId: string
  children: React.ReactNode
  className?: string
}

function DeepListZone({
  label,
  testId,
  children,
  className,
}: DeepListZoneProps) {
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
    <div className="space-y-2" data-testid="deep-list-table-skeleton">
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

const EMPTY_FILTERS: DeepCasesFilterValues = {
  audit_id: '',
  gate_id: '',
  from: '',
  to: '',
}

function readFiltersFromSearchParams(
  searchParams: URLSearchParams,
): DeepCasesFilterValues {
  return {
    audit_id: searchParams.get('audit_id') ?? '',
    gate_id: searchParams.get('gate_id') ?? '',
    from: searchParams.get('from') ?? '',
    to: searchParams.get('to') ?? '',
  }
}

function hasServerFilters(filters: DeepCasesFilterValues): boolean {
  return Boolean(filters.gate_id || filters.from || filters.to)
}

function filterItemsByAuditPrefix(
  items: ReturnType<typeof useDeepCasesList>['items'],
  auditIdPrefix: string,
) {
  const prefix = auditIdPrefix.trim().toLowerCase()
  if (!prefix) {
    return items
  }

  return items.filter((item) =>
    item.audit_id.toLowerCase().startsWith(prefix),
  )
}

/**
 * Каталог deep audits: фильтры, загрузка списка и зоны table/pagination.
 */
export function DeepListPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [filterDraft, setFilterDraft] = useState<DeepCasesFilterValues | null>(
    null,
  )

  const page = Number(searchParams.get('page') ?? '1') || 1
  const pageSize = Number(searchParams.get('page_size') ?? '20') || 20
  const appliedFilters = useMemo(
    () => readFiltersFromSearchParams(searchParams),
    [searchParams],
  )
  const draftFilters = filterDraft ?? appliedFilters

  const listParams = useMemo(
    () => ({
      gate_id: appliedFilters.gate_id || undefined,
      from: appliedFilters.from || undefined,
      to: appliedFilters.to || undefined,
      page,
      page_size: pageSize,
    }),
    [
      appliedFilters.from,
      appliedFilters.gate_id,
      appliedFilters.to,
      page,
      pageSize,
    ],
  )

  const { items, total, isLoading, error, refetch } = useDeepCasesList(listParams)

  const visibleItems = useMemo(
    () => filterItemsByAuditPrefix(items, appliedFilters.audit_id),
    [appliedFilters.audit_id, items],
  )

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
    if (draftFilters.audit_id) {
      next.set('audit_id', draftFilters.audit_id)
    }
    if (draftFilters.gate_id) {
      next.set('gate_id', draftFilters.gate_id)
    }
    if (draftFilters.from) {
      next.set('from', draftFilters.from)
    }
    if (draftFilters.to) {
      next.set('to', draftFilters.to)
    }
    next.set('page', '1')
    next.set('page_size', String(pageSize))
    setFilterDraft(null)
    setSearchParams(next)
  }

  const handleReset = () => {
    setFilterDraft(EMPTY_FILTERS)
    setSearchParams(new URLSearchParams({ page: '1', page_size: String(pageSize) }))
  }

  const handleRowClick = (auditId: string) => {
    navigate(`/deep/${auditId}`, {
      state: { deepListSearch: searchParams.toString() },
    })
  }

  const showFilteredEmpty =
    !isLoading &&
    !error &&
    visibleItems.length === 0 &&
    (hasServerFilters(appliedFilters) || Boolean(appliedFilters.audit_id))

  const showGlobalEmpty =
    !isLoading &&
    !error &&
    visibleItems.length === 0 &&
    !hasServerFilters(appliedFilters) &&
    !appliedFilters.audit_id

  return (
    <div
      className="mx-auto flex w-full max-w-[1440px] flex-col gap-4"
      data-testid="deep-list-page"
    >
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          Deep Analytics — каталог audits
        </h1>
      </header>

      <DeepListZone
        label="Фильтры deep cases"
        testId="deep-list-filters"
        className="sticky top-0 z-10 shadow-sm"
      >
        <DeepCasesFilters
          values={draftFilters}
          onChange={setFilterDraft}
          onApply={handleApply}
          onReset={handleReset}
          onAuditNavigate={handleRowClick}
          isLoading={isLoading}
        />
      </DeepListZone>

      <DeepListZone label="Список audits" testId="deep-list-table">
        {isLoading ? <TableSkeletonRows /> : null}

        {!isLoading && error ? (
          <div
            className="border-destructive/30 bg-destructive/5 space-y-3 rounded-md border p-4"
            data-testid="deep-list-error"
            role="alert"
          >
            <p className="text-destructive text-sm">{error}</p>
            <Button type="button" size="sm" variant="outline" onClick={() => void refetch()}>
              Retry
            </Button>
          </div>
        ) : null}

        {showGlobalEmpty ? (
          <p className="text-muted-foreground text-sm" data-testid="deep-list-table-empty">
            Нет deep cases
          </p>
        ) : null}

        {showFilteredEmpty ? (
          <div className="space-y-3" data-testid="deep-list-table-filtered-empty">
            <p className="text-muted-foreground text-sm">Нет audits по фильтру</p>
            <Button type="button" size="sm" variant="outline" onClick={handleReset}>
              Reset
            </Button>
          </div>
        ) : null}

        {!isLoading && !error && visibleItems.length > 0 ? (
          <DeepCasesTable items={visibleItems} onRowClick={handleRowClick} />
        ) : null}
      </DeepListZone>

      <DeepListZone
        label="Pagination"
        testId="deep-list-pagination"
        className="py-3"
      >
        <DeepCasesPagination
          total={total}
          page={page}
          pageSize={pageSize}
          itemsOnPage={items.length}
          onPageChange={(nextPage) => updatePageParams(nextPage)}
          onPageSizeChange={(nextPageSize) => updatePageParams(1, nextPageSize)}
        />
      </DeepListZone>
    </div>
  )
}
