import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SrStatePanel, TxStatePanel } from '@/components/monitoring/TxStatePanel'

describe('TxStatePanel', () => {
  it('renders muted placeholder when state is empty', () => {
    render(<TxStatePanel txState={null} />)
    expect(screen.getByText('Нет данных')).toBeInTheDocument()
  })
})

describe('SrStatePanel', () => {
  it('renders muted placeholder when state is empty', () => {
    render(<SrStatePanel srState={null} />)
    expect(screen.getByText('Нет данных')).toBeInTheDocument()
  })
})
