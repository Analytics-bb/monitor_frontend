import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SupportHeader } from '@/components/support/SupportHeader'

describe('SupportHeader', () => {
  it('renders title and subtitle', () => {
    render(<SupportHeader historyMessageCount={0} historyMessageLimit={40} />)

    expect(screen.getByRole('heading', { name: 'Саппорт' })).toBeInTheDocument()
    expect(
      screen.getByText(
        'Агент-саппорт: запросы к базе, аналитика Telegram-чатов и Google Таблиц',
      ),
    ).toBeInTheDocument()
    expect(screen.getByTestId('support-history-meter')).toHaveTextContent('0/40')
  })
})
