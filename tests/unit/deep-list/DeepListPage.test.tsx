import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it, vi } from 'vitest'

const navigateMock = vi.fn()

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>()
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

describe('DeepListPage navigation', () => {
  it('passes saved filters in location state on row click', async () => {
    const user = userEvent.setup()
    navigateMock.mockReset()

    const { DeepListPage } = await import('@/pages/DeepListPage')

    render(
      <MemoryRouter initialEntries={['/deep?gate_id=42&page=1&page_size=20']}>
        <Routes>
          <Route path="/deep" element={<DeepListPage />} />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(
        screen.getAllByTestId('deep-cases-table-row').length,
      ).toBeGreaterThan(0)
    })

    await user.click(screen.getAllByTestId('deep-cases-table-row')[0]!)

    expect(navigateMock).toHaveBeenCalledWith(
      expect.stringMatching(/^\/deep\//),
      expect.objectContaining({
        state: {
          deepListSearch: 'gate_id=42&page=1&page_size=20',
          hypothesisConclusion: expect.any(String),
        },
      }),
    )
  })
})
