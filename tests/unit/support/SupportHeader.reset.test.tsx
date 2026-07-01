import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'

import { SupportHeader } from '@/components/support/SupportHeader'
import { supportChatSnapshotFixture } from '@/api/fixtures/supportChatSnapshot'

describe('SupportHeader reset', () => {
  it('calls onReset when reset button clicked', async () => {
    const user = userEvent.setup()
    const onReset = vi.fn()

    render(
      <MemoryRouter>
        <SupportHeader snapshot={supportChatSnapshotFixture} onReset={onReset} />
      </MemoryRouter>,
    )

    await user.click(screen.getByTestId('support-reset-button'))
    expect(onReset).toHaveBeenCalledTimes(1)
  })
})
