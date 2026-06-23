import { describe, expect, it } from 'vitest'

import {
  buildMetricsChartSlides,
  metricsToolsFixture,
} from '@/api/fixtures/metricsCharts'
import { getStatusMetricsChartSlides, statusResponseFixture } from '@/api/fixtures/statusResponse'

describe('metricsCharts fixtures', () => {
  it('builds seven chart slides from sql tools', () => {
    const slides = buildMetricsChartSlides(metricsToolsFixture)

    expect(slides).toHaveLength(7)
    expect(slides.map((slide) => slide.key)).toEqual([
      'tx_24h',
      'tx_status_24h',
      'errors_24h',
      'users_tx_buckets_24h',
      'users_tx_buckets_3h_10m',
      'top_ips_tx_details_3h',
      'success_rate_by_hour_country_24h',
    ])
  })

  it('exposes slides from status response fixture', () => {
    const slides = getStatusMetricsChartSlides(statusResponseFixture)

    expect(slides.length).toBeGreaterThan(0)
    expect(slides[0]?.title).toBe('Объём транзакций (24ч)')
  })

  it('builds 24 hourly points for each 24h chart', () => {
    const slides = buildMetricsChartSlides(metricsToolsFixture)
    const hourlyKeys = [
      'tx_24h',
      'tx_status_24h',
      'errors_24h',
      'users_tx_buckets_24h',
      'success_rate_by_hour_country_24h',
    ] as const

    for (const key of hourlyKeys) {
      const slide = slides.find((item) => item.key === key)
      expect(slide?.data).toHaveLength(24)
    }

    expect(metricsToolsFixture.tx_24h).toHaveLength(24)
    expect(metricsToolsFixture.tx_status_24h).toHaveLength(24)
    expect(metricsToolsFixture.users_tx_buckets_24h).toHaveLength(24)
    expect(metricsToolsFixture.success_rate_by_hour_country_24h).toHaveLength(72)
  })
})
