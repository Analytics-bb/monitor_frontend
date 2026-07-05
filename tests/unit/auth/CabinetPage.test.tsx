import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { authLoginFixture, authUserFixture } from '@/api/fixtures/authSession'
import { CabinetPage } from '@/pages/CabinetPage'
import { SESSION_STORAGE_KEY } from '@/auth/sessionStorage'
import { renderWithAuth } from '../../helpers/renderWithAuth'

describe('CabinetPage', () => {
  it('renders user profile from fixture API', async () => {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(authLoginFixture))

    renderWithAuth(<CabinetPage />)

    expect(await screen.findByRole('heading', { name: 'Личный кабинет' })).toBeInTheDocument()
    expect(screen.getAllByText(authUserFixture.username).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(authUserFixture.user_id)).toBeInTheDocument()
    expect(screen.getByText('Личный кабинет')).toBeInTheDocument()
  })
})
