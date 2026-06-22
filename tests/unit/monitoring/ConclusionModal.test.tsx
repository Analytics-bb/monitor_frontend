import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import type { ReactElement } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { statusResponseFixture } from '@/api/fixtures/statusResponse'
import { ConclusionModal } from '@/components/monitoring/ConclusionModal'
import { ConclusionPanel } from '@/components/monitoring/ConclusionPanel'

function renderModal(ui: ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('ConclusionPanel', () => {
  it('renders scrollable agent conclusion preview', () => {
    render(
      <ConclusionPanel
        data={statusResponseFixture}
        onExpand={() => undefined}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Вывод агента' })).toBeInTheDocument()
    expect(screen.getByText(/ALERT: Gate 1001 Test/)).toBeInTheDocument()
    expect(screen.getByLabelText('Развернуть вывод агента')).toBeInTheDocument()
    expect(document.querySelector('.conclusion-scroll')).toBeInTheDocument()
  })

  it('calls onExpand when expand icon clicked', async () => {
    const user = userEvent.setup()
    const onExpand = vi.fn()

    render(
      <ConclusionPanel
        data={statusResponseFixture}
        onExpand={onExpand}
      />,
    )

    await user.click(screen.getByLabelText('Развернуть вывод агента'))
    expect(onExpand).toHaveBeenCalled()
  })
})

describe('ConclusionModal', () => {
  it('opens dialog and closes on collapse icon', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    HTMLDialogElement.prototype.showModal = vi.fn()
    HTMLDialogElement.prototype.close = vi.fn()

    renderModal(
      <ConclusionModal
        open
        data={statusResponseFixture}
        onClose={onClose}
      />,
    )

    expect(screen.getByTestId('conclusion-modal')).toBeInTheDocument()
    expect(screen.getByText(/ЭСКАЛИРОВАТЬ/)).toBeInTheDocument()
    expect(screen.getByText('Deep analysis →')).toBeInTheDocument()

    await user.click(screen.getByLabelText('Свернуть вывод агента'))
    expect(onClose).toHaveBeenCalled()
  })

  it('closes on Esc via cancel event', () => {
    const onClose = vi.fn()

    renderModal(
      <ConclusionModal
        open
        data={statusResponseFixture}
        onClose={onClose}
      />,
    )

    const dialog = document.querySelector('dialog')
    dialog?.dispatchEvent(new Event('cancel', { cancelable: true }))

    expect(onClose).toHaveBeenCalled()
  })
})
