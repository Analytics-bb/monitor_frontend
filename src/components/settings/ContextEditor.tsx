import { useEffect, useState } from 'react'

import { formatContextScope } from '@/api/fixtures/agentContext'
import { upsertContext, type AgentContext } from '@/api/contexts'
import { settingsTextareaClassName } from '@/components/settings/InstructionFormFields'
import { SettingsInlineError } from '@/components/settings/SettingsInlineError'
import { resolveSettingsError } from '@/components/settings/settingsErrors'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface ContextEditorProps {
  context: AgentContext
  onClose: () => void
  onSaved: () => Promise<void>
  className?: string
}

const CONTEXT_BODY_MAX_CHARS = 32768

const cancelButtonClassName =
  'text-muted-foreground hover:bg-muted/40 hover:text-foreground focus-visible:ring-1 focus-visible:ring-ring/25 focus-visible:ring-offset-0'

/**
 * Редактор agent context: только правка context_body. UUID скрыт.
 */
export function ContextEditor({
  context,
  onClose,
  onSaved,
  className,
}: ContextEditorProps) {
  const [contextBody, setContextBody] = useState(context.context_body)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setContextBody(context.context_body)
    setFormError(null)
  }, [context])

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSaving) {
      return
    }

    setIsSaving(true)
    setFormError(null)
    try {
      await upsertContext({
        agent_kind: context.agent_kind,
        gate_id: context.gate_id,
        context_body: contextBody,
      })
      await onSaved()
      onClose()
    } catch (error) {
      setFormError(resolveSettingsError(error).message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section
      className={cn('border-border bg-card rounded-lg border p-4', className)}
      data-testid="context-editor"
      aria-label={`Редактирование контекста ${context.agent_kind}`}
    >
      <form className="space-y-4" onSubmit={(event) => void handleSave(event)}>
        <div className="flex items-center justify-between gap-3">
          <p className="text-muted-foreground text-sm font-medium tracking-tight">
            <span className="text-foreground/80 capitalize">{context.agent_kind}</span>
            {' · '}
            {formatContextScope(context).toLowerCase()}
          </p>
          <Button
            type="button"
            variant="ghost"
            className={cancelButtonClassName}
            onClick={onClose}
          >
            Отменить
          </Button>
        </div>

        <SettingsInlineError message={formError} />

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground text-xs">context_body</span>
          <textarea
            className={cn(settingsTextareaClassName, 'min-h-[200px] font-sans')}
            value={contextBody}
            maxLength={CONTEXT_BODY_MAX_CHARS}
            data-testid="context-content-input"
            onChange={(event) => {
              setContextBody(event.target.value)
              setFormError(null)
            }}
            required
          />
          <span className="text-muted-foreground text-xs">
            {contextBody.length} / {CONTEXT_BODY_MAX_CHARS}
          </span>
        </label>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Применение…' : 'Применить'}
          </Button>
        </div>
      </form>
    </section>
  )
}
