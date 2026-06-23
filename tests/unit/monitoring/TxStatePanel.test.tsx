import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { statusResponseFixture } from '@/api/fixtures/statusResponse'
import {
  SrStatePanel,
  TxStatePanel,
} from '@/components/monitoring/TxStatePanel'

const txState = statusResponseFixture.event?.tx_state as Record<string, unknown>
const srState = statusResponseFixture.event?.sr_state as Record<string, unknown>

describe('TxStatePanel', () => {
  it('renders muted placeholder when state is empty', () => {
    render(<TxStatePanel txState={null} />)
    expect(screen.getByText('Нет данных')).toBeInTheDocument()
  })

  it('renders labeled fields and horizontal baseline metrics', () => {
    render(<TxStatePanel txState={txState} />)

    expect(screen.getByText('Сводка по объёму транзакций')).toBeInTheDocument()
    expect(screen.getByText('Текущее значение')).toBeInTheDocument()
    expect(screen.getByText('Направление аномалии')).toBeInTheDocument()
    expect(screen.getByText('Исторические показатели')).toBeInTheDocument()
    expect(screen.queryByText('classification')).not.toBeInTheDocument()
    expect(screen.getByText('LOW')).toBeInTheDocument()
  })
})

describe('SrStatePanel', () => {
  it('renders muted placeholder when state is empty', () => {
    render(<SrStatePanel srState={null} />)
    expect(screen.getByText('Нет данных')).toBeInTheDocument()
  })

  it('renders conversion summary with baseline row', () => {
    render(<SrStatePanel srState={srState} />)

    expect(screen.getByText('Сводка по конверсии')).toBeInTheDocument()
    expect(screen.getByText('Срабатываний подряд')).toBeInTheDocument()
    expect(screen.queryByText('classification')).not.toBeInTheDocument()
  })
})
