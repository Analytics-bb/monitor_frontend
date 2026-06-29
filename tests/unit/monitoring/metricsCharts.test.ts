import { describe, expect, it } from 'vitest'

import {
  buildMetricsChartSlides,
  metricsToolsFixture,
} from '@/api/fixtures/metricsCharts'
import {
  getStatusMetricsChartSlides,
  statusResponseFixture,
} from '@/api/fixtures/statusResponse'

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
    expect(metricsToolsFixture.success_rate_by_hour_country_24h).toHaveLength(
      72,
    )
    expect(metricsToolsFixture.top_ips_tx_details_3h).toHaveLength(10)
  })

  it('includes anonymized customer details in top ip chart slide', () => {
    const slides = buildMetricsChartSlides(metricsToolsFixture)
    const topIpSlide = slides.find(
      (slide) => slide.key === 'top_ips_tx_details_3h',
    )

    expect(topIpSlide?.data).toHaveLength(10)
    expect(topIpSlide?.tooltipFields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'Почта', key: 'customer_email' }),
        expect.objectContaining({ label: 'Страна', key: 'customer_country' }),
      ]),
    )
    expect(topIpSlide?.data[0]).toMatchObject({
      label: '10.0.0.1',
      customer_email: 'user01@example.com',
      customer_first_name: 'User',
      customer_last_name: '01',
      card_number: '411111XXXXXX0101',
      customer_country: 'DE',
    })
  })

  it('configures y-axis ticks on multi-line chart slides', () => {
    const slides = buildMetricsChartSlides(metricsToolsFixture)
    const txStatusSlide = slides.find((slide) => slide.key === 'tx_status_24h')
    const errorsSlide = slides.find((slide) => slide.key === 'errors_24h')
    const successRateSlide = slides.find(
      (slide) => slide.key === 'success_rate_by_hour_country_24h',
    )

    expect(txStatusSlide?.yAxisDomain?.[0]).toBe(0)
    expect(txStatusSlide?.yAxisDomain?.[1]).toBeGreaterThan(0)
    expect(txStatusSlide?.yAxisAllowDecimals).toBe(false)

    expect(errorsSlide?.yAxisDomain).toEqual([0, 5])
    expect(errorsSlide?.yAxisAllowDecimals).toBe(false)

    expect(successRateSlide?.yAxisDomain).toEqual([0, 1])
    expect(successRateSlide?.yAxisTicks).toEqual([0, 0.25, 0.5, 0.75, 1])
  })

  it('includes generic error descriptions in errors by code slide', () => {
    const slides = buildMetricsChartSlides(metricsToolsFixture)
    const errorsSlide = slides.find((slide) => slide.key === 'errors_24h')

    expect(errorsSlide?.series).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: 'ERR_1001',
          description: 'Declined by issuer',
        }),
        expect.objectContaining({
          key: 'ERR_1002',
          description: 'Request timeout',
        }),
      ]),
    )
    expect(metricsToolsFixture.errors_24h).toHaveLength(24 * 5)
  })
})
