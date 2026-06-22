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
  it('truncates conclusion preview with line-clamp', () => {
    render(
      <ConclusionPanel
        data={statusResponseFixture}
        onExpand={() => undefined}
      />,
    )

    const preview = screen.getByText(statusResponseFixture.conclusion!)
    expect(preview.className).toContain('line-clamp-6')
  })
})

describe('ConclusionModal', () => {
  it('opens dialog and closes on collapse button', async () => {
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
    expect(screen.getByText(statusResponseFixture.conclusion!)).toBeInTheDocument()

    await user.click(screen.getByLabelText('Свернуть conclusion'))
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
