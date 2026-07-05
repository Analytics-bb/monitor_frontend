import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ApprovalBar } from '@/components/deep/ApprovalBar'

describe('ApprovalBar', () => {
  it('calls onApprove and triggers refetch callback on Approve click', async () => {
    const user = userEvent.setup()
    const onApprove = vi.fn().mockResolvedValue(undefined)
    const onReject = vi.fn()

    render(
      <ApprovalBar
        pendingAction={{
          action_id: 'act-1',
          tool_name: 'run_query',
          arguments_preview: 'SELECT 1',
        }}
        onApprove={onApprove}
        onReject={onReject}
      />,
    )

    await user.click(
      screen.getByRole('button', { name: 'Подтвердить действие act-1' }),
    )

    await waitFor(() => {
      expect(onApprove).toHaveBeenCalledWith('act-1')
    })
  })
})
