import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { MemoryRouter, Route, Routes, useSearchParams } from 'react-router'
import { describe, expect, it, vi } from 'vitest'

import { DeepCasesFilters, type DeepCasesFilterValues } from '@/components/deep/DeepCasesFilters'

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

  render(
    <MemoryRouter>
      <DeepCasesFilters
        values={{ gate_id: '', state: '', from: '', to: '' }}
        onChange={onChange}
        onApply={onApply}
        onReset={onReset}
        {...props}
      />
    </MemoryRouter>,
  )

  return { onChange, onApply, onReset }
}

describe('DeepCasesFilters', () => {
  it('syncs gate_id digits only via onChange', async () => {
    const user = userEvent.setup()

    function ControlledFilters() {
      const [values, setValues] = useState<DeepCasesFilterValues>({
        gate_id: '',
        state: '',
        from: '',
        to: '',
      })

      return (
        <DeepCasesFilters
          values={values}
          onChange={setValues}
          onApply={vi.fn()}
          onReset={vi.fn()}
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

  it('calls onApply for gate filter', async () => {
    const user = userEvent.setup()
    const onApply = vi.fn()

    renderFilters({
      values: { gate_id: '42', state: '', from: '', to: '' },
      onApply,
    })

    await user.click(screen.getByRole('button', { name: 'Применить' }))

    expect(onApply).toHaveBeenCalledTimes(1)
  })

  it('updates state filter via onChange', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    renderFilters({
      values: { gate_id: '', state: '', from: '', to: '' },
      onChange,
    })

    await user.selectOptions(screen.getByLabelText('Статус чата'), 'active')

    expect(onChange).toHaveBeenCalledWith({
      gate_id: '',
      state: 'active',
      from: '',
      to: '',
    })
  })
})

describe('DeepListPage URL sync', () => {
  it('updates ?gate_id= after Применить', async () => {
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
    await user.click(screen.getByRole('button', { name: 'Применить' }))

    await waitFor(() => {
      expect(screen.getByTestId('search-params')).toHaveTextContent('gate_id=42')
    })
  })
})
