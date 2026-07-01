import { File, X } from 'lucide-react'

import { cn } from '@/lib/utils'

export interface AttachmentChip {
  id: string
  filename: string
}

export interface AttachmentChipsProps {
  items: AttachmentChip[]
  onRemove?: (id: string) => void
  className?: string
}

/**
 * Chips вложений: иконка файла + имя; опционально remove в composer.
 */
export function AttachmentChips({
  items,
  onRemove,
  className,
}: AttachmentChipsProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <div
      className={cn('flex max-w-full flex-wrap gap-2', className)}
      data-testid="attachment-chips"
    >
      {items.map((item) => (
        <span
          key={item.id}
          className="bg-muted/60 text-foreground inline-flex w-fit max-w-full items-center gap-1.5 rounded-full py-1 pr-1 pl-2.5 text-sm"
        >
          <File className="text-muted-foreground size-3.5 shrink-0" aria-hidden />
          <span className="truncate">{item.filename}</span>
          {onRemove ? (
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground shrink-0 cursor-pointer rounded-full p-1 transition-colors"
              aria-label={`Удалить ${item.filename}`}
              onClick={() => onRemove(item.id)}
            >
              <X className="size-3.5" aria-hidden />
            </button>
          ) : null}
        </span>
      ))}
    </div>
  )
}
