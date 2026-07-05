import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ChatMarkdown } from '@/components/chat/ChatMarkdown'
import { normalizeChatMarkdown } from '@/lib/normalizeChatMarkdown'

describe('normalizeChatMarkdown', () => {
  it('converts emoji headers and bullet markers to markdown', () => {
    expect(
      normalizeChatMarkdown(`📈 **Детекция**

• tx_count: 2`),
    ).toBe(`### 📈 **Детекция**

- tx_count: 2`)
  })

  it('preserves footer after horizontal rule marker', () => {
    expect(normalizeChatMarkdown(`📈 Детекция

---
gate_id: 42`)).toContain('---\n\ngate_id: 42')
  })
})

describe('ChatMarkdown', () => {
  it('renders markdown bold without visible asterisks', () => {
    render(<ChatMarkdown content="**Детекция**" tone="assistant" />)

    expect(screen.getByText('Детекция').tagName).toBe('STRONG')
    expect(screen.queryByText('**Детекция**')).not.toBeInTheDocument()
  })

  it('renders structured assistant summary with audit-summary test id', () => {
    render(
      <ChatMarkdown
        content={`📈 **Deep analysis**

• item one`}
        tone="assistant"
        structured
      />,
    )

    expect(screen.getByTestId('audit-summary')).toBeInTheDocument()
    expect(screen.getByText('Deep analysis').tagName).toBe('STRONG')
  })
})
