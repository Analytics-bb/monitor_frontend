import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'
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
 * Chips pending-вложений в composer.
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
    <div className={cn('flex flex-wrap gap-2', className)} data-testid="attachment-chips">
      {items.map((item) => (
        <span
          key={item.id}
          className="bg-muted text-foreground inline-flex max-w-full items-center gap-1 rounded-full px-2 py-1 text-xs"
        >
          <span className="truncate">{item.filename}</span>
          {onRemove ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-5 shrink-0"
              aria-label={`Удалить ${item.filename}`}
              onClick={() => onRemove(item.id)}
            >
              <X className="size-3" aria-hidden />
            </Button>
          ) : null}
        </span>
      ))}
    </div>
  )
}
