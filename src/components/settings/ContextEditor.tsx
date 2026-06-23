import { useEffect, useId, useRef, useState } from 'react'

import { mapApiError } from '@/api/errors'
import {
  deleteContext,
  upsertContext,
  type AgentContext,
  type AgentContextUpsert,
  type AgentKind,
} from '@/api/contexts'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type ContextEditorMode = 'create' | 'edit'

export interface ContextEditorProps {
  mode: ContextEditorMode
  context?: AgentContext
  defaultAgentKind: AgentKind
  defaultGateId?: string | null
  onClose: () => void
  onSaved: () => Promise<void>
  className?: string
}

const inputClassName =
  'border-input bg-background h-9 w-full rounded-md border px-3 text-sm'

/**
 * Редактор agent context: upsert и delete.
 */
export function ContextEditor({
  mode,
  context,
  defaultAgentKind,
  defaultGateId = null,
  onClose,
  onSaved,
  className,
}: ContextEditorProps) {
  const titleId = useId()
  const deleteDialogRef = useRef<HTMLDialogElement>(null)
  const [agentKind, setAgentKind] = useState<AgentKind>(
    context?.agent_kind ?? defaultAgentKind,
  )
  const [isGlobal, setIsGlobal] = useState(
    context ? context.gate_id === null : defaultGateId === null,
  )
  const [gateId, setGateId] = useState(context?.gate_id ?? defaultGateId ?? '')
  const [key, setKey] = useState(context?.key ?? '')
  const [content, setContent] = useState(context?.content ?? '')
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  useEffect(() => {
    setAgentKind(context?.agent_kind ?? defaultAgentKind)
    setIsGlobal(context ? context.gate_id === null : defaultGateId === null)
    setGateId(context?.gate_id ?? defaultGateId ?? '')
    setKey(context?.key ?? '')
    setContent(context?.content ?? '')
  }, [context, defaultAgentKind, defaultGateId])

  useEffect(() => {
    const dialog = deleteDialogRef.current
    if (!dialog) {
      return
    }

    if (deleteDialogOpen && !dialog.open) {
      dialog.showModal()
    }
    if (!deleteDialogOpen && dialog.open) {
      dialog.close()
    }
  }, [deleteDialogOpen])

  const buildUpsertBody = (): AgentContextUpsert => ({
    agent_kind: agentKind,
    gate_id: isGlobal ? null : gateId.trim() || null,
    key: key.trim(),
    content,
  })

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSaving) {
      return
    }

    setIsSaving(true)
    try {
      await upsertContext(buildUpsertBody())
      await onSaved()
      onClose()
    } catch (error) {
      mapApiError(error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!context || isDeleting) {
      return
    }

    setIsDeleting(true)
    try {
      await deleteContext(context.context_id)
      setDeleteDialogOpen(false)
      await onSaved()
      onClose()
    } catch (error) {
      mapApiError(error)
      await onSaved()
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <section
      className={cn('border-border bg-card rounded-lg border p-4', className)}
      data-testid="context-editor"
    >
      <form className="space-y-4" onSubmit={(event) => void handleSave(event)}>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold">
            {mode === 'create' ? 'New context' : 'Edit context'}
          </h3>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground text-xs">agent_kind</span>
          <select
            className={inputClassName}
            value={agentKind}
            disabled={mode === 'edit'}
            onChange={(event) =>
              setAgentKind(event.target.value as AgentKind)
            }
          >
            <option value="hypothesis">hypothesis</option>
            <option value="deep">deep</option>
          </select>
        </label>

        <div className="flex flex-col gap-2 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isGlobal}
              disabled={mode === 'edit'}
              onChange={(event) => setIsGlobal(event.target.checked)}
            />
            <span>Global (gate_id null)</span>
          </label>
          {!isGlobal ? (
            <label className="flex flex-col gap-1">
              <span className="text-muted-foreground text-xs">gate_id</span>
              <input
                className={cn(inputClassName, 'font-mono')}
                value={gateId}
                disabled={mode === 'edit'}
                onChange={(event) =>
                  setGateId(event.target.value.replace(/\D/g, ''))
                }
              />
            </label>
          ) : null}
        </div>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground text-xs">key</span>
          <input
            className={inputClassName}
            value={key}
            disabled={mode === 'edit'}
            onChange={(event) => setKey(event.target.value)}
            required
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground text-xs">content</span>
          <textarea
            className="border-input bg-background min-h-[160px] rounded-md border px-3 py-2 text-sm"
            value={content}
            data-testid="context-content-input"
            onChange={(event) => setContent(event.target.value)}
            required
          />
        </label>

        <div className="flex flex-wrap items-center justify-between gap-2">
          {mode === 'edit' && context ? (
            <Button
              type="button"
              variant="destructive"
              disabled={isSaving || isDeleting}
              onClick={() => setDeleteDialogOpen(true)}
            >
              Delete
            </Button>
          ) : (
            <span />
          )}

          <Button type="submit" disabled={isSaving || isDeleting}>
            {isSaving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </form>

      <dialog
        ref={deleteDialogRef}
        className="border-border bg-card w-full max-w-md rounded-lg border p-4 shadow-lg backdrop:bg-black/40"
        aria-labelledby={titleId}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <h4 id={titleId} className="text-sm font-semibold">
          Удалить context?
        </h4>
        <p className="text-muted-foreground mt-2 text-sm">
          Действие необратимо для «{context?.key}».
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setDeleteDialogOpen(false)}
          >
            Отмена
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isDeleting}
            onClick={() => void handleDeleteConfirm()}
          >
            {isDeleting ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </dialog>
    </section>
  )
}
