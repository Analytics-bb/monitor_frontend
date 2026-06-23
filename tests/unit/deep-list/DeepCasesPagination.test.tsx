import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { DeepCasesPagination } from '@/components/deep/DeepCasesPagination'

describe('DeepCasesPagination', () => {
  it('calls onPageChange on next and prev', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()

    render(
      <DeepCasesPagination
        total={60}
        page={2}
        pageSize={20}
        itemsOnPage={20}
        onPageChange={onPageChange}
        onPageSizeChange={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Следующая страница' }))
    expect(onPageChange).toHaveBeenCalledWith(3)

    await user.click(
      screen.getByRole('button', { name: 'Предыдущая страница' }),
    )
    expect(onPageChange).toHaveBeenCalledWith(1)
  })

  it('shows range summary', () => {
    render(
      <DeepCasesPagination
        total={142}
        page={1}
        pageSize={20}
        itemsOnPage={20}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
      />,
    )

    expect(
      screen.getByTestId('deep-cases-pagination-summary'),
    ).toHaveTextContent('Показано 1–20 из 142')
  })
})
