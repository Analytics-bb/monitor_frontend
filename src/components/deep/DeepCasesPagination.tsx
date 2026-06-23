import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const PAGE_SIZE_OPTIONS = [20, 50] as const

export interface DeepCasesPaginationProps {
  total: number
  page: number
  pageSize: number
  itemsOnPage: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  className?: string
}

function getRangeLabel(
  page: number,
  pageSize: number,
  itemsOnPage: number,
  total: number,
): string {
  if (total === 0 || itemsOnPage === 0) {
    return 'Показано 0 из 0'
  }

  const start = (page - 1) * pageSize + 1
  const end = (page - 1) * pageSize + itemsOnPage
  return `Показано ${start}–${end} из ${total}`
}

/**
 * Server-side pagination footer для списка deep cases.
 */
export function DeepCasesPagination({
  total,
  page,
  pageSize,
  itemsOnPage,
  onPageChange,
  onPageSizeChange,
  className,
}: DeepCasesPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const canGoPrev = page > 1
  const canGoNext = page < totalPages

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-3',
        className,
      )}
      data-testid="deep-cases-pagination"
    >
      <p className="text-muted-foreground text-sm" data-testid="deep-cases-pagination-summary">
        {getRangeLabel(page, pageSize, itemsOnPage, total)}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8"
          aria-label="Предыдущая страница"
          disabled={!canGoPrev}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <span className="min-w-8 text-center text-sm tabular-nums">{page}</span>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8"
          aria-label="Следующая страница"
          disabled={!canGoNext}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <label className="text-muted-foreground flex items-center gap-2 text-sm">
          <span>на стр.</span>
          <select
            className="border-input bg-background h-8 rounded-md border px-2 text-sm"
            value={pageSize}
            aria-label="Размер страницы"
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
          >
            {PAGE_SIZE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  )
}
