import { ArrowUp, Plus } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'

import { cn } from '@/lib/utils'

export interface ChatComposerProps {
  disabled?: boolean
  placeholder?: string
  onSend: (content: string) => void | Promise<void>
  className?: string
}

const MAX_ROWS = 4
const LINE_HEIGHT_PX = 24
const MIN_HEIGHT_PX = 36

/**
 * Composer внизу чата: pill-контейнер с auto-grow textarea и круглой кнопкой Send.
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
    textarea.style.height = `${Math.min(Math.max(textarea.scrollHeight, MIN_HEIGHT_PX), maxHeight)}px`
  }, [draft])

  const submit = async () => {
    const trimmed = draft.trim()
    if (!trimmed || disabled || sending) {
      return
    }

    setDraft('')
    setSending(true)
    try {
      await onSend(trimmed)
    } catch {
      setDraft(trimmed)
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

  const canSend = !disabled && !sending && Boolean(draft.trim())

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'border-input bg-elevated focus-within:border-ring focus-within:ring-ring/20 flex items-end gap-1 rounded-3xl border p-1.5 shadow-xs transition-[box-shadow,border-color] focus-within:ring-2',
        disabled && 'opacity-60',
        className,
      )}
      data-testid="chat-composer"
    >
      <button
        type="button"
        disabled
        aria-label="Добавить вложение"
        className="text-muted-foreground hover:bg-muted/60 flex size-9 shrink-0 items-center justify-center rounded-full transition-colors disabled:pointer-events-none disabled:opacity-40"
      >
        <Plus className="size-4" aria-hidden />
      </button>

      <textarea
        ref={textareaRef}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled || sending}
        placeholder={placeholder}
        rows={1}
        aria-label="Сообщение агенту"
        className="placeholder:text-muted-foreground min-h-9 max-h-24 flex-1 resize-none border-0 bg-transparent px-1 py-2 text-sm focus-visible:outline-none disabled:cursor-not-allowed"
        data-testid="chat-composer-textarea"
      />

      <button
        type="submit"
        disabled={!canSend}
        aria-label="Отправить сообщение"
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-full transition-colors',
          canSend
            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
            : 'bg-muted text-muted-foreground',
        )}
      >
        <ArrowUp className="size-4" aria-hidden />
      </button>
    </form>
  )
}
