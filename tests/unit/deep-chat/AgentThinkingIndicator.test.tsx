import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { AgentThinkingIndicator } from '@/components/deep/AgentThinkingIndicator'

describe('AgentThinkingIndicator', () => {
  it('shows forming label by default', () => {
    render(<AgentThinkingIndicator />)

    expect(screen.getByText('Агент формирует ответ')).toBeVisible()
    expect(screen.getByTestId('agent-thinking')).toHaveAttribute(
      'data-thinking-phase',
      'forming',
    )
  })

  it('shows retry styling and message for mcp_retry phase', () => {
    render(<AgentThinkingIndicator phase="mcp_retry" />)

    expect(
      screen.getByText('MCP-запрос не удался — выполняется следующая попытка'),
    ).toBeVisible()
    expect(screen.getByTestId('agent-thinking')).toHaveAttribute(
      'data-thinking-phase',
      'mcp_retry',
    )
  })
})
