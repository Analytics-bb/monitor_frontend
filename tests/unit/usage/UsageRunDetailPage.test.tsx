import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'

import { UsageRunDetailPage } from '@/pages/UsageRunDetailPage'

describe('UsageRunDetailPage', () => {
  it('shows usage_run_not_found for unknown run id', async () => {
    render(
      <MemoryRouter initialEntries={['/usage/00000000-0000-4000-8000-000000000000']}>
        <Routes>
          <Route path="/usage/:runId" element={<UsageRunDetailPage />} />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('usage-run-detail-error')).toBeVisible()
    })

    expect(screen.getByText('usage_run_not_found')).toBeVisible()
  })
})
