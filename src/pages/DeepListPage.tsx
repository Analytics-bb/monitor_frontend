import { useEffect, useState } from 'react'

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

/**
 * Каталог deep audits: filter bar, таблица и pagination (shell).
 */
export function DeepListPage() {
  const [showSkeleton, setShowSkeleton] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowSkeleton(false)
    }, 0)

    return () => {
      window.clearTimeout(timer)
    }
  }, [])

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
        <div
          className="text-muted-foreground grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          data-testid="deep-list-filters-placeholder"
        >
          <div className="bg-muted/40 h-9 animate-pulse rounded-md" />
          <div className="bg-muted/40 h-9 animate-pulse rounded-md" />
          <div className="bg-muted/40 h-9 animate-pulse rounded-md" />
          <div className="bg-muted/40 h-9 animate-pulse rounded-md" />
        </div>
      </DeepListZone>

      <DeepListZone label="Список audits" testId="deep-list-table">
        {showSkeleton ? (
          <TableSkeletonRows />
        ) : (
          <p
            className="text-muted-foreground text-sm"
            data-testid="deep-list-table-empty"
          >
            Нет deep cases
          </p>
        )}
      </DeepListZone>

      <DeepListZone
        label="Pagination"
        testId="deep-list-pagination"
        className="py-3"
      >
        <div
          className="bg-muted/40 h-8 max-w-md animate-pulse rounded-md"
          data-testid="deep-list-pagination-placeholder"
          aria-hidden
        />
      </DeepListZone>
    </div>
  )
}
