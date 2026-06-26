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
          args_summary: 'SELECT 1',
        }}
        onApprove={onApprove}
        onReject={vi.fn()}
        onCustomVariant={vi.fn()}
      />,
    )

    await user.click(
      screen.getByRole('button', { name: 'Подтвердить действие act-1' }),
    )

    await waitFor(() => {
      expect(onApprove).toHaveBeenCalledWith('act-1')
    })
  })

  it('submits custom variant after reject flow', async () => {
    const user = userEvent.setup()
    const onCustomVariant = vi.fn().mockResolvedValue(undefined)

    render(
      <ApprovalOverlay
        pendingAction={{
          action_id: 'act-2',
          tool_name: 'notify_provider',
          args_summary: 'send alert',
        }}
        onApprove={vi.fn()}
        onReject={vi.fn()}
        onCustomVariant={onCustomVariant}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Свой вариант' }))
    await user.type(
      screen.getByLabelText('Свой вариант'),
      'Проверить канал вручную',
    )
    await user.click(screen.getByRole('button', { name: 'Отправить вариант' }))

    await waitFor(() => {
      expect(onCustomVariant).toHaveBeenCalledWith(
        'act-2',
        'Проверить канал вручную',
      )
    })
  })
})
