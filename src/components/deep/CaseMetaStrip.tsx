import { cn } from '@/lib/utils'

export interface CaseMetaStripProps {
  gateId: string
  gateName?: string
  createdAt: string
  className?: string
}

function MetaField({
  label,
  value,
  mono = false,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <span>
      <span className="text-muted-foreground">{label}: </span>
      <span
        className={cn('text-foreground font-medium', mono && 'font-mono text-xs')}
      >
        {value}
      </span>
    </span>
  )
}

/**
 * Основная meta-информация кейса: гейт, название и время детекции (MSK as-is).
 */
export function CaseMetaStrip({
  gateId,
  gateName,
  createdAt,
  className,
}: CaseMetaStripProps) {
  return (
    <div
      className={cn(
        'flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1 text-sm',
        className,
      )}
    >
      <MetaField label="Гейт" value={gateId} />
      <MetaField label="Название гейта" value={gateName?.trim() || '—'} />
      <MetaField
        label="Время детекции"
        value={`${createdAt} MSK`}
        mono
      />
    </div>
  )
}
