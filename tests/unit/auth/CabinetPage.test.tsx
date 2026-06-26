import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { CabinetPage } from '@/pages/CabinetPage'

describe('CabinetPage', () => {
  it('renders cabinet placeholder text', () => {
    render(<CabinetPage />)

    expect(screen.getByText('Личный кабинет — скоро')).toBeInTheDocument()
  })
})
