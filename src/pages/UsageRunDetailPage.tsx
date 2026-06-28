import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router'

import { getUsageRun, type AgentUsageRun } from '@/api/usage'
import { ApiClientError, isApiErrorCode, mapApiError } from '@/api/errors'
import { UsageRunDetail } from '@/components/usage/UsageRunDetail'
import { Button } from '@/components/ui/button'

interface UsageRunDetailLocationState {
  usageListSearch?: string
}

function UsageRunDetailError({
  errorCode,
  backHref,
}: {
  errorCode: string
  backHref: string
}) {
  return (
    <section
      className="border-destructive/30 bg-destructive/5 space-y-3 rounded-md border p-4"
      data-testid="usage-run-detail-error"
      role="alert"
    >
      <p className="text-destructive font-mono text-sm">{errorCode}</p>
      <Button asChild size="sm" variant="outline">
        <Link to={backHref}>← Usage</Link>
      </Button>
    </section>
  )
}

/**
 * Страница детализации usage run по `/usage/:runId`.
 */
export function UsageRunDetailPage() {
  const { runId } = useParams<{ runId: string }>()
  const location = useLocation()
  const [run, setRun] = useState<AgentUsageRun | null>(null)
  const [isLoading, setIsLoading] = useState(Boolean(runId))
  const [errorCode, setErrorCode] = useState<string | null>(null)

  const backHref = useMemo(() => {
    const search = (location.state as UsageRunDetailLocationState | null)
      ?.usageListSearch
    return search ? `/usage?${search}` : '/usage'
  }, [location.state])

  useEffect(() => {
    if (!runId) {
      return
    }

    let cancelled = false

    void (async () => {
      setIsLoading(true)
      setErrorCode(null)

      try {
        const response = await getUsageRun(runId)
        if (!cancelled) {
          setRun(response)
        }
      } catch (fetchError) {
        if (cancelled) {
          return
        }

        mapApiError(fetchError)

        if (
          fetchError instanceof ApiClientError &&
          isApiErrorCode(fetchError, 'usage_run_not_found')
        ) {
          setErrorCode('usage_run_not_found')
        } else {
          setErrorCode('unexpected_error')
        }
        setRun(null)
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [runId])

  if (!runId) {
    return (
      <UsageRunDetailError
        errorCode="usage_run_not_found"
        backHref={backHref}
      />
    )
  }

  if (isLoading) {
    return (
      <section className="space-y-4" data-testid="usage-run-detail-loading">
        <div className="bg-muted/60 h-8 w-40 animate-pulse rounded-md" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="bg-muted/60 h-20 animate-pulse rounded-md"
            />
          ))}
        </div>
      </section>
    )
  }

  if (errorCode) {
    return <UsageRunDetailError errorCode={errorCode} backHref={backHref} />
  }

  if (!run) {
    return null
  }

  return (
    <section data-testid="usage-run-detail-page">
      <header className="mb-4">
        <h1 className="text-2xl font-semibold tracking-tight">Usage run</h1>
      </header>
      <UsageRunDetail run={run} backHref={backHref} />
    </section>
  )
}
