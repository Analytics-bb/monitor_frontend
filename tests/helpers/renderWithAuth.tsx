import type { ReactElement } from 'react'
import { render, type RenderOptions } from '@testing-library/react'

import { AuthProvider } from '@/auth/AuthProvider'

export function renderWithAuth(ui: ReactElement, options?: RenderOptions) {
  return render(<AuthProvider>{ui}</AuthProvider>, options)
}
