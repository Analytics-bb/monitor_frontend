import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { agentConclusionHtmlFixture } from '@/api/fixtures/agentConclusionHtml'
import { auditSummaryFixtureContent } from '@/api/fixtures/auditSummaryFixture'
import { AgentConclusionContent } from '@/components/monitoring/AgentConclusionContent'

describe('AgentConclusionContent', () => {
  it('renders HTML conclusion with headings', () => {
    render(<AgentConclusionContent content={agentConclusionHtmlFixture} />)

    expect(
      screen.getByRole('heading', { name: /ALERT: Gate 1001 Test/i }),
    ).toBeInTheDocument()
    expect(screen.getByText(/ЭСКАЛИРОВАТЬ/)).toBeInTheDocument()
  })

  it('renders structured markdown conclusion with headings', () => {
    render(<AgentConclusionContent content={auditSummaryFixtureContent} />)

    expect(
      screen.getByRole('heading', { name: /Детекция/i }),
    ).toBeInTheDocument()
    expect(screen.getByText(/ЭСКАЛИРОВАТЬ/)).toBeInTheDocument()
  })
})
