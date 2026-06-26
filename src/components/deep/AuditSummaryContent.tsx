import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export interface AuditSummaryContentProps {
  content: string
  className?: string
}

const SECTION_PATTERN = /^(📈|⚠️|✅|🔧|📢|🎯)\s*(.+)$/u

interface ParsedSection {
  icon: string
  title: string
  lines: string[]
}

function parseSections(content: string): {
  sections: ParsedSection[]
  footer: string | null
} {
  const normalized = content.trim()
  const footerSplit = normalized.split('\n---\n')
  const body = footerSplit[0]?.trim() ?? ''
  const footer = footerSplit[1]?.trim() ?? null

  const rawSections = body.split(/\n(?=📈|⚠️|✅|🔧|📢|🎯)/u)
  const sections: ParsedSection[] = []

  for (const block of rawSections) {
    const lines = block.split('\n')
    const header = lines[0]?.trim() ?? ''
    const match = SECTION_PATTERN.exec(header)
    if (!match) {
      continue
    }

    sections.push({
      icon: match[1] ?? '',
      title: match[2]?.trim() ?? '',
      lines: lines.slice(1).map((line) => line.trimEnd()).filter(Boolean),
    })
  }

  return { sections, footer }
}

function renderInlineCode(text: string): ReactNode[] {
  const parts = text.split(/(`[^`]+`)/g)
  return parts.map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={index}
          className="bg-primary/10 text-primary rounded px-1.5 py-0.5 font-mono text-xs"
        >
          {part.slice(1, -1)}
        </code>
      )
    }
    return part
  })
}

function SectionBody({ lines }: { lines: string[] }) {
  const items: ReactNode[] = []
  let listBuffer: string[] = []

  const flushList = () => {
    if (listBuffer.length === 0) {
      return
    }
    items.push(
      <ul
        key={`list-${items.length}`}
        className="text-foreground/90 list-disc space-y-1 pl-5"
      >
        {listBuffer.map((line, index) => (
          <li key={index} className="leading-relaxed">
            {renderInlineCode(line.replace(/^[•]\s*/, '').replace(/^\d+\.\s*/, ''))}
          </li>
        ))}
      </ul>,
    )
    listBuffer = []
  }

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) {
      flushList()
      continue
    }

    if (trimmed.startsWith('`') && trimmed.endsWith('`')) {
      flushList()
      items.push(
        <div
          key={`code-${items.length}`}
          className="border-input bg-elevated text-foreground rounded-md border px-3 py-2 font-mono text-xs"
        >
          {trimmed.slice(1, -1)}
        </div>,
      )
      continue
    }

    if (trimmed.startsWith('>')) {
      flushList()
      items.push(
        <blockquote
          key={`quote-${items.length}`}
          className="border-border text-muted-foreground border-l-4 pl-4 text-sm leading-relaxed italic"
        >
          {trimmed.replace(/^>\s?/, '')}
        </blockquote>,
      )
      continue
    }

    if (/^[•\d]/.test(trimmed)) {
      listBuffer.push(trimmed)
      continue
    }

    flushList()
    items.push(
      <p key={`p-${items.length}`} className="text-foreground/90 leading-relaxed">
        {renderInlineCode(trimmed)}
      </p>,
    )
  }

  flushList()
  return <div className="space-y-2">{items}</div>
}

/**
 * Структурированный audit summary агента: секции, highlight-блоки, blockquote, footer.
 */
export function AuditSummaryContent({
  content,
  className,
}: AuditSummaryContentProps) {
  const { sections, footer } = parseSections(content)

  return (
    <div className={cn('space-y-4 text-sm', className)} data-testid="audit-summary">
      {sections.map((section) => {
        const isEscalation = section.icon === '🎯'

        return (
          <section key={`${section.icon}-${section.title}`} className="space-y-2">
            <h3
              className={cn(
                'text-foreground flex items-center gap-2 font-semibold',
                isEscalation && 'text-destructive',
              )}
            >
              <span aria-hidden>{section.icon}</span>
              <span>{section.title}</span>
            </h3>
            <SectionBody lines={section.lines} />
          </section>
        )
      })}
      {footer ? (
        <div className="border-primary/20 bg-primary/5 text-muted-foreground rounded-md border px-3 py-2 font-mono text-xs">
          {footer}
        </div>
      ) : null}
    </div>
  )
}
