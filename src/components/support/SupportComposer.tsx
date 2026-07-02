import { ArrowUp, Paperclip } from 'lucide-react'
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
} from 'react'

import { AttachmentChips } from '@/components/support/AttachmentChips'
import { cn } from '@/lib/utils'

export interface SupportComposerProps {
  disabled?: boolean
  placeholder?: string
  pendingAttachments: { id: string; filename: string }[]
  onUpload: (file: File) => void | Promise<void>
  onRemoveAttachment: (id: string) => void
  onSend: (content: string, attachmentIds: string[]) => void | Promise<void>
  className?: string
}

const MAX_ROWS = 4
const LINE_HEIGHT_PX = 24
const MIN_HEIGHT_PX = 36

/**
 * Composer support-чата: текст, вложения, Send.
 *
 * Enter без Shift отправляет; при `disabled` ввод и attach заблокированы.
 */
export function SupportComposer({
  disabled = false,
  placeholder = 'Напишите в support…',
  pendingAttachments,
  onUpload,
  onRemoveAttachment,
  onSend,
  className,
}: SupportComposerProps) {
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    const attachmentIds = pendingAttachments.map((item) => item.id)
    if ((!trimmed && attachmentIds.length === 0) || disabled || sending) {
      return
    }

    setSending(true)
    try {
      await onSend(trimmed, attachmentIds)
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

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && !disabled) {
      void onUpload(file)
    }
    event.target.value = ''
  }

  const canSend =
    !disabled &&
    !sending &&
    (Boolean(draft.trim()) || pendingAttachments.length > 0)

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('space-y-2', className)}
      data-testid="support-composer"
    >
      <AttachmentChips
        items={pendingAttachments}
        onRemove={disabled ? undefined : onRemoveAttachment}
      />

      <div
        className={cn(
          'border-input bg-elevated focus-within:border-ring focus-within:ring-ring/20 flex items-end gap-1 rounded-3xl border p-1.5 shadow-xs transition-[box-shadow,border-color] focus-within:ring-2',
          disabled && 'opacity-60',
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="sr-only"
          disabled={disabled}
          onChange={handleFileChange}
          data-testid="support-attach-input"
        />
        <button
          type="button"
          disabled={disabled}
          aria-label="Добавить вложение"
          className="text-muted-foreground hover:bg-muted/60 flex size-9 shrink-0 items-center justify-center rounded-full transition-colors disabled:pointer-events-none disabled:opacity-40"
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip className="size-4" aria-hidden />
        </button>

        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || sending}
          placeholder={placeholder}
          rows={1}
          aria-label="Сообщение в support"
          className="placeholder:text-muted-foreground min-h-9 max-h-24 flex-1 resize-none border-0 bg-transparent px-1 py-2 text-sm focus-visible:outline-none disabled:cursor-not-allowed"
          data-testid="support-composer-textarea"
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
      </div>
    </form>
  )
}
