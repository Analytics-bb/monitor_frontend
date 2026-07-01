import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { SupportHeader } from '@/components/support/SupportHeader'

describe('SupportHeader reset', () => {
  it('calls onReset when reset button clicked', async () => {
    const user = userEvent.setup()
    const onReset = vi.fn()

    render(<SupportHeader onReset={onReset} />)

    await user.click(screen.getByTestId('support-reset-button'))
    expect(onReset).toHaveBeenCalledTimes(1)
  })
})
