import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SupportHeader } from '@/components/support/SupportHeader'

describe('SupportHeader', () => {
  it('renders title and subtitle', () => {
    render(<SupportHeader onReset={() => undefined} />)

    expect(screen.getByRole('heading', { name: 'Саппорт' })).toBeInTheDocument()
    expect(
      screen.getByText('Задайте вопрос support-агенту — текстом или файлом'),
    ).toBeInTheDocument()
  })
})
