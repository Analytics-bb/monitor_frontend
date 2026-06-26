import { useEffect, useId, useRef, useState } from 'react'

import {
  defaultAction,
  defaultMatchPredicate,
} from '@/api/fixtures/agentInstruction'
import { mapApiError } from '@/api/errors'
import {
  createInstruction,
  deleteInstruction,
  updateInstruction,
  type AgentInstruction,
} from '@/api/instructions'
import { ActionFields, MatchPredicateFields } from '@/components/settings/InstructionFormFields'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const INSTRUCTION_NAME_PATTERN = /^[a-z0-9_]+$/

export type InstructionEditorMode = 'create' | 'edit'

export interface InstructionEditorProps {
  mode: InstructionEditorMode
  instruction?: AgentInstruction
  onClose: () => void
  onSaved: () => Promise<void>
  className?: string
}

/**
 * Редактор instruction: match, action, prompt_template. UUID не показывается.
 */
export function InstructionEditor({
  mode,
  instruction,
  onClose,
  onSaved,
  className,
}: InstructionEditorProps) {
  const titleId = useId()
  const deleteDialogRef = useRef<HTMLDialogElement>(null)
  const [name, setName] = useState(instruction?.name ?? '')
  const [match, setMatch] = useState(instruction?.match ?? defaultMatchPredicate)
  const [action, setAction] = useState(instruction?.action ?? defaultAction)
  const [promptTemplate, setPromptTemplate] = useState(
    instruction?.prompt_template ?? '',
  )
  const [nameError, setNameError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  useEffect(() => {
    setName(instruction?.name ?? '')
    setMatch(instruction?.match ?? defaultMatchPredicate)
    setAction(instruction?.action ?? defaultAction)
    setPromptTemplate(instruction?.prompt_template ?? '')
    setNameError(null)
  }, [instruction])

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

  const validateName = (value: string): boolean => {
    if (!INSTRUCTION_NAME_PATTERN.test(value) || value.length > 64) {
      setNameError('name: только a-z, 0-9, _, длина 1–64')
      return false
    }
    setNameError(null)
    return true
  }

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSaving || !validateName(name.trim())) {
      return
    }

    setIsSaving(true)
    try {
      if (mode === 'create') {
        await createInstruction({
          name: name.trim(),
          match,
          action,
          prompt_template: promptTemplate,
        })
      } else if (instruction) {
        await updateInstruction(instruction.instruction_id, {
          name: name.trim(),
          match,
          action,
          prompt_template: promptTemplate,
        })
      }

      await onSaved()
      onClose()
    } catch (error) {
      mapApiError(error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!instruction || isDeleting) {
      return
    }

    setIsDeleting(true)
    try {
      await deleteInstruction(instruction.instruction_id)
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
      data-testid="instruction-editor"
      aria-label={mode === 'create' ? 'New instruction' : 'Edit instruction'}
    >
      <form className="space-y-4" onSubmit={(event) => void handleSave(event)}>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold">
            {mode === 'create' ? 'New instruction' : `Edit: ${instruction?.name}`}
          </h3>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground text-xs">name</span>
          <input
            className="border-input bg-background h-9 rounded-md border px-3 font-mono text-sm"
            value={name}
            disabled={mode === 'edit'}
            onChange={(event) => {
              setName(event.target.value)
              if (nameError) {
                validateName(event.target.value.trim())
              }
            }}
            required
          />
          {nameError ? (
            <span className="text-destructive text-xs">{nameError}</span>
          ) : null}
        </label>

        <MatchPredicateFields value={match} onChange={setMatch} />
        <ActionFields value={action} onChange={setAction} />

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground text-xs">prompt_template</span>
          <textarea
            className="border-input bg-background min-h-[240px] rounded-md border px-3 py-2 font-mono text-sm"
            value={promptTemplate}
            onChange={(event) => setPromptTemplate(event.target.value)}
            required
          />
        </label>

        <div className="flex flex-wrap items-center justify-between gap-2">
          {mode === 'edit' && instruction ? (
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
        data-testid="instruction-delete-dialog"
        onClose={() => setDeleteDialogOpen(false)}
      >
        <h4 id={titleId} className="text-sm font-semibold">
          Удалить instruction?
        </h4>
        <p className="text-muted-foreground mt-2 text-sm">
          Действие необратимо для «{instruction?.name}».
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
            data-testid="instruction-delete-confirm"
            onClick={() => void handleDeleteConfirm()}
          >
            {isDeleting ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </dialog>
    </section>
  )
}
