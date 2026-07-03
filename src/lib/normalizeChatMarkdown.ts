const EMOJI_SECTION_HEADER = /^(📈|⚠️|✅|🔧|📢|🎯|🚨|📉|📬)\s/u
const NUMBERED_SECTION_HEADER = /^\d+\.\s+\S/u

/**
 * Проверяет, что контент — HTML-фрагмент (hypothesis conclusion и т.п.).
 */
export function isHtmlChatContent(content: string): boolean {
  return /^\s*</.test(content.trim())
}

/**
 * Приводит structured deep/hypothesis text к GFM markdown для react-markdown.
 *
 * - emoji/numbered заголовки → `###`
 * - `•` bullets → `-`
 * - footer после `---` сохраняется как markdown horizontal rule + paragraph
 */
export function normalizeChatMarkdown(content: string): string {
  if (isHtmlChatContent(content)) {
    return content.trim()
  }

  const parts = content.trim().split(/\n---\n/)
  const body = parts[0]?.trim() ?? ''
  const footer = parts[1]?.trim()

  const normalized = body.split('\n').map((line) => {
    const trimmed = line.trim()
    if (!trimmed) {
      return ''
    }

    if (EMOJI_SECTION_HEADER.test(trimmed) || NUMBERED_SECTION_HEADER.test(trimmed)) {
      return `### ${trimmed}`
    }

    if (trimmed.startsWith('• ')) {
      return `- ${trimmed.slice(2)}`
    }

    return line.trimEnd()
  })

  let result = normalized.join('\n').trim()

  if (footer) {
    result += `\n\n---\n\n${footer}`
  }

  return result
}
