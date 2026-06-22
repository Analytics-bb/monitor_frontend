import { useState } from 'react'

import { getStatusGateId, getStatusGateName } from '@/api/fixtures/statusResponse'
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
      <MonitoringZone label="Gate" testId="monitoring-gate">
        <GateSelector
          currentGateId={getStatusGateId(data)}
          currentGateName={getStatusGateName(data)}
          onActivated={refetch}
        />
      </MonitoringZone>

      <DegradedBanner visible={isDegraded} onRetry={refetch} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <MonitoringZone label="Настройки конфига" testId="monitoring-config">
          <ConfigSnapshotPanel
            configSnapshot={data?.event?.config_snapshot ?? null}
          />
        </MonitoringZone>
        <MonitoringZone label="Статус" testId="monitoring-status">
          <StatusPanel
            data={data}
            isStale={isStale}
            isDegraded={isDegraded}
          />
        </MonitoringZone>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <MonitoringZone
          label="Сводка по объёму транзакций"
          testId="monitoring-tx-state"
        >
          <TxStatePanel
            txState={
              (data?.event?.tx_state as Record<string, unknown> | undefined) ??
              null
            }
          />
        </MonitoringZone>
        <MonitoringZone label="Сводка по конверсии" testId="monitoring-sr-state">
          <SrStatePanel
            srState={
              (data?.event?.sr_state as Record<string, unknown> | undefined) ??
              null
            }
          />
        </MonitoringZone>
      </div>

      <MonitoringZone label="Metrics charts" testId="monitoring-charts">
        <MetricsChartsSlider metricsCharts={null} />
      </MonitoringZone>

      <MonitoringZone label="Вывод агента" testId="monitoring-conclusion">
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
