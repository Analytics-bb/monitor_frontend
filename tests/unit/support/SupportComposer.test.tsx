import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { SupportComposer } from '@/components/support/SupportComposer'

describe('SupportComposer', () => {
  it('disables textarea when processing', () => {
    render(
      <SupportComposer
        disabled
        pendingAttachments={[]}
        onUpload={() => undefined}
        onRemoveAttachment={() => undefined}
        onSend={() => undefined}
      />,
    )

    expect(screen.getByTestId('support-composer-textarea')).toBeDisabled()
  })

  it('sends message with pending attachments', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()

    render(
      <SupportComposer
        pendingAttachments={[
          { id: 'cccccccc-cccc-4ccc-8ccc-000000000001', filename: 'notes.txt' },
        ]}
        onUpload={() => undefined}
        onRemoveAttachment={() => undefined}
        onSend={onSend}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Отправить сообщение' }))

    expect(onSend).toHaveBeenCalledWith('', [
      'cccccccc-cccc-4ccc-8ccc-000000000001',
    ])
  })
})
