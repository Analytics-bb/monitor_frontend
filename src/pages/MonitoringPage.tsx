import { useState } from 'react'

import { useMonitoringPolling } from '@/hooks/useMonitoringPolling'
import { cn } from '@/lib/utils'

import {
  ConfigSnapshotPanel,
  ConclusionModal,
  ConclusionPanel,
  DegradedBanner,
  GateSelector,
  MetricsChartsSlider,
  StatusPanel,
  SrStatePanel,
  TxStatePanel,
} from '@/components/monitoring'

interface MonitoringZoneProps {
  label: string
  testId: string
  children: React.ReactNode
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

/**
 * Live-дашборд последнего тика scheduler: grid из 7 зон.
 */
export function MonitoringPage() {
  const { data, isStale, isDegraded, refetch } = useMonitoringPolling()
  const [conclusionOpen, setConclusionOpen] = useState(false)

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

      <DegradedBanner visible={isDegraded} onRetry={refetch} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(280px,1fr)_2fr]">
        <MonitoringZone label="Gate" testId="monitoring-gate">
          <GateSelector onActivated={refetch} />
        </MonitoringZone>
        <MonitoringZone label="Config snapshot" testId="monitoring-config">
          <ConfigSnapshotPanel configSnapshot={data?.config_snapshot} />
        </MonitoringZone>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <MonitoringZone label="TX state" testId="monitoring-tx-state">
          <TxStatePanel txState={data?.tx_state} />
        </MonitoringZone>
        <MonitoringZone label="SR state" testId="monitoring-sr-state">
          <SrStatePanel srState={data?.sr_state} />
        </MonitoringZone>
      </div>

      <MonitoringZone label="Metrics charts" testId="monitoring-charts">
        <MetricsChartsSlider metricsCharts={data?.metrics_charts} />
      </MonitoringZone>

      <MonitoringZone label="Conclusion" testId="monitoring-conclusion">
        <ConclusionPanel
          data={data}
          onExpand={() => setConclusionOpen(true)}
        />
      </MonitoringZone>

      <ConclusionModal
        open={conclusionOpen}
        data={data}
        onClose={() => setConclusionOpen(false)}
      />
    </div>
  )
}
