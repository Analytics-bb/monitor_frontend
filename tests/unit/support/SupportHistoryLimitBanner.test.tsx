import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { SupportHistoryLimitBanner } from '@/components/support/SupportHistoryLimitBanner'

describe('SupportHistoryLimitBanner', () => {
  it('calls onAcceptReset when accept clicked', async () => {
    const user = userEvent.setup()
    const onAcceptReset = vi.fn()

    render(
      <SupportHistoryLimitBanner
        visible
        declined={false}
        onAcceptReset={onAcceptReset}
        onDecline={() => undefined}
      />,
    )

    await user.click(screen.getByTestId('support-history-limit-accept'))
    expect(onAcceptReset).toHaveBeenCalledTimes(1)
  })

  it('calls onDecline when cancel clicked', async () => {
    const user = userEvent.setup()
    const onDecline = vi.fn()

    render(
      <SupportHistoryLimitBanner
        visible
        declined={false}
        onAcceptReset={() => undefined}
        onDecline={onDecline}
      />,
    )

    await user.click(screen.getByTestId('support-history-limit-decline'))
    expect(onDecline).toHaveBeenCalledTimes(1)
  })

  it('hides decline button after user declined', () => {
    render(
      <SupportHistoryLimitBanner
        visible
        declined
        onAcceptReset={() => undefined}
        onDecline={() => undefined}
      />,
    )

    expect(
      screen.queryByTestId('support-history-limit-decline'),
    ).not.toBeInTheDocument()
    expect(screen.getByText(/отправка сообщений недоступна/i)).toBeInTheDocument()
  })
})
