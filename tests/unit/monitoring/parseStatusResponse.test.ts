import { describe, expect, it } from 'vitest'

import {
  getStatusGateId,
  getStatusGateName,
  getStatusMetricsChartSlides,
  parseStatusResponse,
} from '@/api/fixtures/statusResponse'

const aggregatedStatusFixture = {
  scheduler: {
    created_at: '2026-06-30T11:54:40.989092',
    last_tick_at: null,
    last_tick_started_at: null,
    tick_in_progress: false,
    current_tick_started_at: null,
    last_status: null,
    last_error_code: null,
    ticks_total: 0,
    ticks_error_total: 0,
    recent_ticks: [],
  },
  recent_audits: [
    {
      audit_id: '22fdb0ef-8bc2-40f9-949d-b1a2b0749a02',
      tick_id: 'fe70952e-1d56-4ee3-8e3a-fd42ec43d580',
      event: {
        event_id: '198bf393-380c-4f9a-8cf0-6406b4b66fee',
        gate_id: '1001',
        triggered_by: 'tx_count',
        direction: 'LOW',
        tx_state: {
          value: 2,
          classification: 'LOW',
          direction: 'LOW',
          streak: 3,
          baseline: {
            min: 2,
            max: 40,
            mean: 35.88,
            q_low: 29.2,
            q_high: 40,
          },
        },
        sr_state: {
          value: 1,
          classification: 'NORMAL',
          direction: null,
          streak: 0,
          baseline: {
            min: 0.5,
            max: 1,
            mean: 0.97,
            q_low: 1,
            q_high: 1,
          },
          baseline_slices_count: 18,
        },
        zeros_share: 0,
        history_len: 18,
        detected_at: '2026-06-30T11:57:25.020300',
        config_snapshot: {
          slice_minutes: 10,
          window_slices: 18,
        },
      },
      report: {
        report_id: '43f65ece-d4e0-4f7d-b15b-d4a7ca02f6bc',
        event_id: '198bf393-380c-4f9a-8cf0-6406b4b66fee',
        instruction_id: '89195ed2-71cc-4d86-8962-41ddd0668ab0',
        matched_instruction_id: '89195ed2-71cc-4d86-8962-41ddd0668ab0',
        tool_calls: [
          {
            tool_name: 'gate_name_by_gate_id',
            status: 'success',
            rows: [{ gate_name: 'Gate 1001 Test' }],
          },
          {
            tool_name: 'tx_24h',
            status: 'success',
            rows: [
              { hour_bucket: '2026-06-30 08:00:00', tx_count: 82 },
              { hour_bucket: '2026-06-30 11:00:00', tx_count: 88 },
            ],
          },
          {
            tool_name: 'tx_status_24h',
            status: 'success',
            rows: [
              {
                hour_bucket: '2026-06-30 11:00:00',
                approved_count: '86',
                declined_count: '2',
              },
            ],
          },
          {
            tool_name: 'errors_24h',
            status: 'success',
            rows: [],
          },
          {
            tool_name: 'users_tx_buckets_24h',
            status: 'success',
            rows: [],
          },
          {
            tool_name: 'users_tx_buckets_3h_10m',
            status: 'success',
            rows: [
              {
                time_bucket: '2026-06-30T11:40:00',
                tx_count: 2,
                user_count: 2,
              },
            ],
          },
          {
            tool_name: 'top_ips_tx_details_3h',
            status: 'success',
            rows: [{ ip: '198.51.100.60', tx_count: 4 }],
          },
          {
            tool_name: 'success_rate_by_hour_country_24h',
            status: 'success',
            rows: [
              {
                hour_bucket: '2026-06-30 11:00:00',
                customer_country: 'unknown',
                approved_count: '86',
                declined_count: '0',
                success_rate: '100.0000',
              },
            ],
          },
        ],
        conclusion: null,
        latency_ms: 808,
        status: 'error',
        error: 'llm_error',
        decision: 'escalate',
        severity: 'warning',
        usage_run_id: '155b17af-8c02-459c-8245-7c66bf969c5b',
        usage: {
          model: 'composer-2.5',
          prompt_tokens: null,
          completion_tokens: null,
          total_tokens: null,
          estimated_cost_usd: null,
        },
        created_at: '2026-06-30T11:57:25.829521',
      },
      telegram_status: 'pending',
      deep_chat: null,
      created_at: '2026-06-30T11:57:25.833463',
    },
  ],
  publisher: null,
} as const

describe('parseStatusResponse aggregated format', () => {
  it('normalizes recent_audits[0] into flat StatusResponse', () => {
    const status = parseStatusResponse(aggregatedStatusFixture)

    expect(getStatusGateId(status)).toBe('1001')
    expect(getStatusGateName(status)).toBe('Gate 1001 Test')
    expect(status.event?.tx_state?.value).toBe(2)
    expect(status.report?.error).toBe('llm_error')
    expect(status.created_at).toBe('2026-06-30T11:57:25.833463')
  })

  it('builds metrics_tools from report.tool_calls', () => {
    const status = parseStatusResponse(aggregatedStatusFixture)
    const slides = getStatusMetricsChartSlides(status)

    expect(Object.keys(status.metrics_tools ?? {})).toHaveLength(7)
    expect(slides.length).toBeGreaterThan(0)
    expect(status.metrics_tools?.tx_24h).toHaveLength(2)
    expect(status.metrics_tools?.tx_status_24h[0]?.approved_count).toBe(86)
  })
})
