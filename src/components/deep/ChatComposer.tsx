import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface ChatComposerProps {
  disabled?: boolean
  placeholder?: string
  onSend: (content: string) => void | Promise<void>
  className?: string
}

const MAX_ROWS = 4
const LINE_HEIGHT_PX = 24

/**
 * Composer внизу чата: auto-grow textarea + Send.
 *
 * Enter без Shift отправляет; при `disabled` ввод заблокирован.
 */
export function ChatComposer({
  disabled = false,
  placeholder = 'Напишите агенту…',
  onSend,
  className,
}: ChatComposerProps) {
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) {
      return
    }
    textarea.style.height = 'auto'
    const maxHeight = LINE_HEIGHT_PX * MAX_ROWS
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`
  }, [draft])

  const submit = async () => {
    const trimmed = draft.trim()
    if (!trimmed || disabled || sending) {
      return
    }

    setSending(true)
    try {
      await onSend(trimmed)
      setDraft('')
    } finally {
      setSending(false)
    }
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    void submit()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void submit()
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('flex items-end gap-2', className)}
      data-testid="chat-composer"
    >
      <textarea
        ref={textareaRef}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled || sending}
        placeholder={placeholder}
        rows={1}
        aria-label="Сообщение агенту"
        className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring min-h-10 flex-1 resize-none rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        data-testid="chat-composer-textarea"
      />
      <Button
        type="submit"
        disabled={disabled || sending || !draft.trim()}
        aria-label="Отправить сообщение"
      >
        Send
      </Button>
    </form>
  )
}
