import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'

import { supportChatSnapshotFixture } from '@/api/fixtures/supportChatSnapshot'
import { SupportHeader } from '@/components/support/SupportHeader'

describe('SupportHeader', () => {
  it('renders usage link with agent_kind=support', () => {
    render(
      <MemoryRouter>
        <SupportHeader
          snapshot={supportChatSnapshotFixture}
          onReset={() => undefined}
        />
      </MemoryRouter>,
    )

    const link = screen.getByRole('link', { name: 'Расход токенов' })
    expect(link).toHaveAttribute('href', '/usage?agent_kind=support')
  })
})
