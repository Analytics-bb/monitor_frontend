import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ChatComposer } from '@/components/deep/ChatComposer'

describe('ChatComposer', () => {
  it('disables textarea when pending blocks input', () => {
    render(
      <ChatComposer disabled placeholder="Ожидание" onSend={vi.fn()} />,
    )

    expect(screen.getByTestId('chat-composer-textarea')).toBeDisabled()
  })

  it('calls onSend with trimmed draft', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()

    render(<ChatComposer onSend={onSend} />)

    await user.type(screen.getByTestId('chat-composer-textarea'), '  hello  ')
    await user.click(screen.getByRole('button', { name: 'Отправить сообщение' }))

    expect(onSend).toHaveBeenCalledWith('hello')
  })
})
