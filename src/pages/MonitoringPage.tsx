import type { ReactNode } from 'react'

import { useMonitoringPolling } from '@/hooks/useMonitoringPolling'
import { cn } from '@/lib/utils'

import { StatusPanel } from './StatusPanel'

interface MonitoringZoneProps {
  label: string
  testId: string
  children: ReactNode
  className?: string
}

function MonitoringZone({
  label,
  testId,
  children,
  className,
}: MonitoringZoneProps) {
  return (
    <section
      aria-label={label}
      data-testid={testId}
      className={cn(
        'border-border bg-card rounded-lg border p-4',
        className,
      )}
    >
      {children}
    </section>
  )
}

interface ZoneSkeletonProps {
  lines?: number
  tall?: boolean
}

function ZoneSkeleton({ lines = 3, tall = false }: ZoneSkeletonProps) {
  return (
    <div aria-hidden="true" className="space-y-2">
      <div
        className={cn(
          'bg-muted animate-pulse rounded',
          tall ? 'h-32' : 'h-5 w-1/3',
        )}
      />
      {Array.from({ length: lines }, (_, index) => (
        <div
          key={index}
          className="bg-muted h-4 animate-pulse rounded"
          style={{ width: `${65 + (index % 3) * 10}%` }}
        />
      ))}
    </div>
  )
}

/**
 * Live-дашборд последнего тика scheduler: grid из 7 зон.
 */
export function MonitoringPage() {
  const { data, isStale, isDegraded, refetch } = useMonitoringPolling()

  return (
    <div
      className="mx-auto flex w-full max-w-[1440px] flex-col gap-4"
      data-testid="monitoring-page"
    >
      <MonitoringZone label="Status" testId="monitoring-status">
        <StatusPanel
          data={data}
          isStale={isStale}
          isDegraded={isDegraded}
          onRefresh={refetch}
        />
      </MonitoringZone>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(280px,1fr)_2fr]">
        <MonitoringZone label="Gate" testId="monitoring-gate">
          <ZoneSkeleton lines={2} />
        </MonitoringZone>
        <MonitoringZone label="Config snapshot" testId="monitoring-config">
          <ZoneSkeleton lines={4} />
        </MonitoringZone>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <MonitoringZone label="TX state" testId="monitoring-tx-state">
          <ZoneSkeleton lines={3} />
        </MonitoringZone>
        <MonitoringZone label="SR state" testId="monitoring-sr-state">
          <ZoneSkeleton lines={3} />
        </MonitoringZone>
      </div>

      <MonitoringZone label="Metrics charts" testId="monitoring-charts">
        <ZoneSkeleton lines={2} tall />
      </MonitoringZone>

      <MonitoringZone label="Conclusion" testId="monitoring-conclusion">
        <ZoneSkeleton lines={6} />
      </MonitoringZone>
    </div>
  )
}
