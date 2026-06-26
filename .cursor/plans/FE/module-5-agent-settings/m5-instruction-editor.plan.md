---
id: m5-instruction-editor
parent_module: .cursor/plans/FE/module-5-agent-settings.plan.md
depends_on:
  - m5-instructions-list
  - m0-toast-provider
план читать: "да, §Флоу — Instructions п.3–4; §Edge-cases DELETE 404"
status: pending
---

# Задача: InstructionEditor — create/edit/delete prompt_template

## Что сделать
Editor panel (slide-over или inline expand): `prompt_template` monospace textarea; Save → `POST`/`PATCH`; Delete с confirm dialog → `DELETE`; toolbar «+ New instruction» открывает create mode.

## Файлы
**Создать:**
- `src/components/settings/InstructionEditor.tsx`

**Изменить:**
- `src/api/instructions.ts` — `createInstruction()`, `updateInstruction()`, `deleteInstruction()`
- `src/components/settings/InstructionsTab.tsx` — wire editor, New/Edit/Delete actions

**Не трогать без явного указания:** contexts API/components.

## Контракт (если задача создаёт/меняет сущность)
`createInstruction(body)` → POST; `updateInstruction(id, patch)` → PATCH `AgentInstructionPatch`; `deleteInstruction(id)` → DELETE.

Editor: min-h 240px textarea; Save in progress — button disabled + spinner; form не очищается при ошибке.

DELETE 404 → toast + refetch list.

## Решения / якоря реализации
- Повторить паттерн: confirm dialog из shadcn `Dialog` (как destructive actions в проекте).
- Обязательно: no optimistic row removal — refetch list после успешного DELETE.
- Не делать: 409 conflict UX (отдельная задача `m5-conflict-handling` для contexts; instructions — generic error toast).

## Зависимости
- `m5-instructions-list` — table selection, list refetch.
- `m0-toast-provider` — `mapApiError` на мутациях.

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| Delete confirm | `tests/unit/settings/InstructionEditor.test.tsx` | DELETE only after confirm |

## DoD
- [ ] Create/edit/delete instructions на mock
- [ ] Confirm dialog перед DELETE
- [ ] Тесты из раздела «Тесты» зелёные
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
