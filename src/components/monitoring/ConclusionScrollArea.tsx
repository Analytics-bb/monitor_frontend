import { cn } from '@/lib/utils'

export interface ConclusionScrollAreaProps {
  children: React.ReactNode
  /** Высота превью в карточке или контент modal. */
  variant: 'panel' | 'modal'
  className?: string
}

/**
 * Прокручиваемая область вывода агента с тонким scrollbar.
 */
export function ConclusionScrollArea({
  children,
  variant,
  className,
}: ConclusionScrollAreaProps) {
  return (
    <div
      className={cn(
        'conclusion-scroll overflow-y-auto pr-1',
        variant === 'panel' && 'max-h-64 min-h-52',
        variant === 'modal' && 'min-h-0 flex-1',
        className,
      )}
    >
      {children}
    </div>
  )
}
