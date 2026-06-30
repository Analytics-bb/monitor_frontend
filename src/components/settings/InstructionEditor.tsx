import { useEffect, useId, useRef, useState } from 'react'

import {
  defaultAction,
  defaultMatchPredicate,
} from '@/api/fixtures/agentInstruction'
import {
  createInstruction,
  deleteInstruction,
  updateInstruction,
  type AgentInstruction,
} from '@/api/instructions'
import { ActionFields, MatchPredicateFields, settingsFieldClassName, settingsTextareaClassName } from '@/components/settings/InstructionFormFields'
import { SettingsInlineError } from '@/components/settings/SettingsInlineError'
import { resolveSettingsError } from '@/components/settings/settingsErrors'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const INSTRUCTION_NAME_PATTERN = /^[a-z0-9_]+$/

const cancelButtonClassName =
  'text-muted-foreground hover:bg-muted/40 hover:text-foreground focus-visible:ring-1 focus-visible:ring-ring/25 focus-visible:ring-offset-0'

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
  const [formError, setFormError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  useEffect(() => {
    setName(instruction?.name ?? '')
    setMatch(instruction?.match ?? defaultMatchPredicate)
    setAction(instruction?.action ?? defaultAction)
    setPromptTemplate(instruction?.prompt_template ?? '')
    setNameError(null)
    setFormError(null)
    setDeleteError(null)
  }, [instruction])

  useEffect(() => {
    const dialog = deleteDialogRef.current
    if (!dialog) {
      return
    }

    if (deleteDialogOpen && !dialog.open) {
      dialog.showModal()
      requestAnimationFrame(() => {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur()
        }
      })
    }
    if (!deleteDialogOpen && dialog.open) {
      dialog.close()
    }
  }, [deleteDialogOpen])

  const validateName = (value: string): boolean => {
    if (!INSTRUCTION_NAME_PATTERN.test(value) || value.length > 64) {
      setNameError('Только a-z, 0-9, _, длина 1–64')
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
    setFormError(null)
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
      const resolved = resolveSettingsError(error)
      if (resolved.field === 'name') {
        setNameError(resolved.message)
      } else {
        setFormError(resolved.message)
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!instruction || isDeleting) {
      return
    }

    setIsDeleting(true)
    setDeleteError(null)
    try {
      await deleteInstruction(instruction.instruction_id)
      setDeleteDialogOpen(false)
      await onSaved()
      onClose()
    } catch (error) {
      setDeleteError(resolveSettingsError(error).message)
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
        <div
          className={cn(
            'flex items-center gap-3',
            mode === 'create' ? 'justify-between' : 'justify-end',
          )}
        >
          {mode === 'create' ? (
            <h3 className="text-sm font-semibold">New instruction</h3>
          ) : null}
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
          <span className="text-muted-foreground text-xs">name</span>
          <input
            className={cn(
              settingsFieldClassName,
              'font-mono',
              nameError && 'border-destructive/50',
            )}
            value={name}
            onChange={(event) => {
              setName(event.target.value)
              setFormError(null)
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
            className={settingsTextareaClassName}
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
              Удалить
            </Button>
          ) : (
            <span />
          )}

          <Button type="submit" disabled={isSaving || isDeleting}>
            {isSaving ? 'Применение…' : 'Применить'}
          </Button>
        </div>
      </form>

      <dialog
        ref={deleteDialogRef}
        className="fixed inset-0 z-50 m-0 h-full max-h-none w-full max-w-none border-0 bg-transparent p-0 backdrop:bg-black/30 backdrop:backdrop-blur-[2px]"
        aria-labelledby={titleId}
        data-testid="instruction-delete-dialog"
        onClose={() => setDeleteDialogOpen(false)}
      >
        <div className="flex h-full items-center justify-center p-4">
          <div className="border-border bg-card text-card-foreground w-full max-w-md rounded-lg border p-4 shadow-lg">
            <h4 id={titleId} className="text-foreground text-sm font-semibold">
              Удалить instruction?
            </h4>
            <p className="text-muted-foreground mt-2 text-sm">
              Действие необратимо для «{instruction?.name}».
            </p>
            <SettingsInlineError className="mt-3" message={deleteError} />
            <div className="mt-4 flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                className={cancelButtonClassName}
                onClick={() => setDeleteDialogOpen(false)}
              >
                Отменить
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={isDeleting}
                data-testid="instruction-delete-confirm"
                onClick={() => void handleDeleteConfirm()}
              >
                {isDeleting ? 'Удаление…' : 'Удалить'}
              </Button>
            </div>
          </div>
        </div>
      </dialog>
    </section>
  )
}
