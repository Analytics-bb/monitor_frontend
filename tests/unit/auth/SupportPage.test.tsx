import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SupportPage } from '@/pages/SupportPage'

describe('SupportPage', () => {
  it('renders support placeholder text', () => {
    render(<SupportPage />)

    expect(screen.getByText('Саппорт — скоро')).toBeInTheDocument()
  })
})
