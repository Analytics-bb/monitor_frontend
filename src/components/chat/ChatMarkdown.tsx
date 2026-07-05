import type { Components, Options } from 'react-markdown'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'

import { isAuditSummaryContent } from '@/api/fixtures/auditSummaryFixture'
import {
  isHtmlChatContent,
  normalizeChatMarkdown,
} from '@/lib/normalizeChatMarkdown'
import { cn } from '@/lib/utils'

export type ChatMarkdownTone = 'assistant' | 'user' | 'system' | 'compact'

export interface ChatMarkdownProps {
  content: string
  tone?: ChatMarkdownTone
  className?: string
  /** Явно пометить structured summary (audit-summary test id). */
  structured?: boolean
}

const chatHtmlSchema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames ?? []),
    'article',
    'section',
    'small',
  ],
  attributes: {
    ...defaultSchema.attributes,
    article: ['className', 'class'],
    section: ['className', 'class'],
    p: [...(defaultSchema.attributes?.p ?? []), 'className', 'class'],
    h3: ['className', 'class'],
    code: ['className', 'class'],
    span: [...(defaultSchema.attributes?.span ?? []), 'className', 'class'],
  },
}

function createMarkdownComponents(tone: ChatMarkdownTone): Components {
  const isUser = tone === 'user'
  const isCompact = tone === 'compact'
  const isSystem = tone === 'system'

  return {
    article: ({ children }) => (
      <div className="space-y-4">{children}</div>
    ),
    section: ({ children }) => <section className="space-y-2">{children}</section>,
    h3: ({ children }) => (
      <h3
        className={cn(
          'text-foreground text-[15px] font-semibold tracking-tight',
          !isUser && 'mt-5 first:mt-0',
        )}
      >
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p
        className={cn(
          'leading-[1.7] break-words [overflow-wrap:anywhere]',
          isUser && 'm-0 text-sm',
          isCompact && 'm-0 font-mono text-xs',
          isSystem && 'm-0 font-mono text-xs',
          !isUser && !isCompact && !isSystem && 'text-foreground/90',
        )}
      >
        {children}
      </p>
    ),
    ul: ({ children }) => (
      <ul
        className={cn(
          'list-disc space-y-1.5 pl-5',
          isUser ? 'text-sm' : 'text-foreground/90',
        )}
      >
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol
        className={cn(
          'list-decimal space-y-1.5 pl-5',
          isUser ? 'text-sm' : 'text-foreground/90',
        )}
      >
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="leading-[1.7] break-words [overflow-wrap:anywhere]">
        {children}
      </li>
    ),
    code: ({ className, children }) => {
      const isBlock = className?.includes('language-')

      if (isBlock) {
        return (
          <code
            className={cn(
              'bg-muted/50 text-foreground/80 block overflow-x-auto rounded-md px-3 py-2 font-mono text-xs leading-relaxed',
              className,
            )}
          >
            {children}
          </code>
        )
      }

      return (
        <code className="bg-muted/50 text-foreground/90 rounded px-1.5 py-0.5 font-mono text-[0.85em]">
          {children}
        </code>
      )
    },
    pre: ({ children }) => (
      <pre className="bg-muted/50 overflow-x-auto rounded-md px-3 py-2 font-mono text-xs leading-relaxed">
        {children}
      </pre>
    ),
    blockquote: ({ children }) => (
      <blockquote className="text-muted-foreground leading-[1.7] italic">
        {children}
      </blockquote>
    ),
    strong: ({ children }) => (
      <strong className="text-foreground font-semibold">{children}</strong>
    ),
    hr: () => <hr className="border-border/40 my-4" />,
    small: ({ children }) => (
      <small className="text-muted-foreground/70 font-mono text-xs leading-relaxed">
        {children}
      </small>
    ),
  }
}

/**
 * Единый markdown-рендер для сообщений чатов (deep, support).
 *
 * Structured agent text нормализуется в GFM; HTML conclusion — через rehype-raw + sanitize.
 */
export function ChatMarkdown({
  content,
  tone = 'assistant',
  className,
  structured,
}: ChatMarkdownProps) {
  const html = isHtmlChatContent(content)
  const isStructured = structured ?? isAuditSummaryContent(content)
  const prepared = html ? content.trim() : normalizeChatMarkdown(content)
  const rehypePlugins: Options['rehypePlugins'] = html
    ? [rehypeRaw, [rehypeSanitize, chatHtmlSchema]]
    : undefined

  const markdown = (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={rehypePlugins}
      components={createMarkdownComponents(tone)}
    >
      {prepared}
    </ReactMarkdown>
  )

  if (tone === 'assistant') {
    return (
      <article
        className={cn(
          'chat-markdown text-foreground w-full max-w-none space-y-4 text-[15px] leading-[1.7] select-text',
          className,
        )}
        data-testid="chat-message-assistant"
      >
        {isStructured ? (
          <div data-testid="audit-summary" className="min-w-0 w-full">
            {markdown}
          </div>
        ) : (
          markdown
        )}
      </article>
    )
  }

  return (
    <div
      className={cn(
        'chat-markdown min-w-0 break-words [overflow-wrap:anywhere] select-text',
        tone === 'user' && 'text-sm leading-relaxed',
        className,
      )}
    >
      {markdown}
    </div>
  )
}
