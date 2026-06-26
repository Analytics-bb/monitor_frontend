import { useEffect, useState } from 'react'

import { formatContextScope } from '@/api/fixtures/agentContext'
import { mapApiError } from '@/api/errors'
import { upsertContext, type AgentContext } from '@/api/contexts'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface ContextEditorProps {
  context: AgentContext
  onClose: () => void
  onSaved: () => Promise<void>
  className?: string
}

const CONTEXT_BODY_MAX_CHARS = 32768

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
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setContextBody(context.context_body)
  }, [context])

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSaving) {
      return
    }

    setIsSaving(true)
    try {
      await upsertContext({
        agent_kind: context.agent_kind,
        gate_id: context.gate_id,
        context_body: contextBody,
      })
      await onSaved()
      onClose()
    } catch (error) {
      mapApiError(error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section
      className={cn('border-border bg-card rounded-lg border p-4', className)}
      data-testid="context-editor"
    >
      <form className="space-y-4" onSubmit={(event) => void handleSave(event)}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold">Edit context</h3>
            <p className="text-muted-foreground text-xs">
              {context.agent_kind} · {formatContextScope(context)}
            </p>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground text-xs">context_body</span>
          <textarea
            className="border-input bg-background min-h-[200px] rounded-md border px-3 py-2 text-sm"
            value={contextBody}
            maxLength={CONTEXT_BODY_MAX_CHARS}
            data-testid="context-content-input"
            onChange={(event) => setContextBody(event.target.value)}
            required
          />
          <span className="text-muted-foreground text-xs">
            {contextBody.length} / {CONTEXT_BODY_MAX_CHARS}
          </span>
        </label>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </form>
    </section>
  )
}
