import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { MemoryRouter, Route, Routes, useSearchParams } from 'react-router'
import { describe, expect, it, vi } from 'vitest'

import { DeepCasesFilters } from '@/components/deep/DeepCasesFilters'

function SearchParamsDisplay() {
  const [params] = useSearchParams()
  return <div data-testid="search-params">{params.toString()}</div>
}

function renderFilters(
  props: Partial<React.ComponentProps<typeof DeepCasesFilters>> = {},
) {
  const onChange = vi.fn()
  const onApply = vi.fn()
  const onReset = vi.fn()
  const onAuditNavigate = vi.fn()

  render(
    <MemoryRouter>
      <DeepCasesFilters
        values={{ audit_id: '', gate_id: '', from: '', to: '' }}
        onChange={onChange}
        onApply={onApply}
        onReset={onReset}
        onAuditNavigate={onAuditNavigate}
        {...props}
      />
    </MemoryRouter>,
  )

  return { onChange, onApply, onReset, onAuditNavigate }
}

describe('DeepCasesFilters', () => {
  it('syncs gate_id digits only via onChange', async () => {
    const user = userEvent.setup()

    function ControlledFilters() {
      const [values, setValues] = useState({
        audit_id: '',
        gate_id: '',
        from: '',
        to: '',
      })

      return (
        <DeepCasesFilters
          values={values}
          onChange={setValues}
          onApply={vi.fn()}
          onReset={vi.fn()}
          onAuditNavigate={vi.fn()}
        />
      )
    }

    render(
      <MemoryRouter>
        <ControlledFilters />
      </MemoryRouter>,
    )

    const input = screen.getByLabelText('Gate ID')
    await user.type(input, 'ab42x')

    expect(input).toHaveValue('42')
  })

  it('calls onApply for gate filter without audit shortcut', async () => {
    const user = userEvent.setup()
    const onApply = vi.fn()
    const onAuditNavigate = vi.fn()

    renderFilters({
      values: { audit_id: '', gate_id: '42', from: '', to: '' },
      onApply,
      onAuditNavigate,
    })

    await user.click(screen.getByRole('button', { name: 'Apply' }))

    expect(onApply).toHaveBeenCalledTimes(1)
    expect(onAuditNavigate).not.toHaveBeenCalled()
  })

  it('navigates to chat on full audit UUID Apply', async () => {
    const user = userEvent.setup()
    const onAuditNavigate = vi.fn()
    const auditId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

    renderFilters({
      values: { audit_id: auditId, gate_id: '', from: '', to: '' },
      onAuditNavigate,
    })

    await user.click(screen.getByRole('button', { name: 'Apply' }))

    expect(onAuditNavigate).toHaveBeenCalledWith(auditId)
  })
})

describe('DeepListPage URL sync', () => {
  it('updates ?gate_id= after Apply', async () => {
    const user = userEvent.setup()
    const { DeepListPage } = await import('@/pages/DeepListPage')

    render(
      <MemoryRouter initialEntries={['/deep']}>
        <Routes>
          <Route
            path="/deep"
            element={
              <>
                <DeepListPage />
                <SearchParamsDisplay />
              </>
            }
          />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.queryByTestId('deep-list-table-skeleton')).not.toBeInTheDocument()
    })

    await user.type(screen.getByLabelText('Gate ID'), '42')
    await user.click(screen.getByRole('button', { name: 'Apply' }))

    await waitFor(() => {
      expect(screen.getByTestId('search-params')).toHaveTextContent('gate_id=42')
    })
  })
})
