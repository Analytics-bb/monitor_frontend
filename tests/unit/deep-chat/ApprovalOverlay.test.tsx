import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ApprovalOverlay } from '@/components/deep/ApprovalOverlay'

describe('ApprovalOverlay', () => {
  it('calls onApprove on Да click', async () => {
    const user = userEvent.setup()
    const onApprove = vi.fn().mockResolvedValue(undefined)

    render(
      <ApprovalOverlay
        pendingAction={{
          action_id: 'act-1',
          tool_name: 'run_query',
          arguments_preview: 'SELECT 1',
        }}
        onApprove={onApprove}
        onReject={vi.fn()}
        onUseCustomInput={vi.fn()}
      />,
    )

    await user.click(
      screen.getByRole('button', { name: 'Подтвердить действие act-1' }),
    )

    await waitFor(() => {
      expect(onApprove).toHaveBeenCalledWith('act-1')
    })
  })

  it('switches to composer on Свой вариант click', async () => {
    const user = userEvent.setup()
    const onUseCustomInput = vi.fn()

    render(
      <ApprovalOverlay
        pendingAction={{
          action_id: 'act-2',
          tool_name: 'notify_provider',
          arguments_preview: 'send alert',
        }}
        onApprove={vi.fn()}
        onReject={vi.fn()}
        onUseCustomInput={onUseCustomInput}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Свой вариант' }))

    expect(onUseCustomInput).toHaveBeenCalledTimes(1)
    expect(screen.queryByLabelText('Свой вариант')).not.toBeInTheDocument()
  })
})
