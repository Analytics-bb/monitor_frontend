---
id: m5-instructions-list
parent_module: .cursor/plans/FE/module-5-agent-settings.plan.md
depends_on:
  - m5-page-tabs
  - m0-api-client
  - m0-mock-samples
  - m0-toast-provider
план читать: "да, §Флоу — Instructions п.1–2; §Edge-cases PATCH toggle fail"
status: pending
---

# Задача: InstructionsTab — list + enabled toggle

## Что сделать
Вкладка Instructions: `GET /api/settings/instructions` → таблица (Name, Enabled switch, Updated, Actions); toggle enabled → `PATCH` без optimistic UI; toolbar «+ New instruction» (disabled до editor task).

## Файлы
**Создать:**
- `src/components/settings/InstructionsTab.tsx`
- `src/api/instructions.ts` — `listInstructions()`, `patchInstruction(id, patch)`

**Изменить:**
- `src/pages/AgentSettingsPage.tsx` — wire Instructions tab
- `src/components/settings/index.ts`

**Не трогать без явного указания:** `ContextsTab`, `InstructionEditor`.

## Контракт (если задача создаёт/меняет сущность)
`listInstructions()` → `AgentInstruction[]` (Zod parse по OpenAPI M6 `instruction_store`).

`patchInstruction(id, { enabled })` — PATCH partial; на ошибке switch revert + `mapApiError`.

Pull-on-mount, manual refetch после toggle; без polling.

## Решения / якоря реализации
- Повторить паттерн: `src/api/monitoring.ts` + fixtures dev fallback.
- Повторить паттерн: `src/components/monitoring/GateSelector.tsx` — error toast через `mapApiError`.
- Обязательно: mutations не optimistic — ждать ответ, revert switch при fail.
- Не делать: create/edit/delete (следующая задача).

## Зависимости
- `m5-page-tabs` — tab slot.
- `m0-api-client` — `apiGetJson`, `apiPatchJson`, error envelope.
- `m0-mock-samples` — fixture instructions list для dev/Vitest.
- `m0-toast-provider` — toast на API errors.

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| Instructions list render | `tests/unit/settings/InstructionsTab.test.tsx` | Rows from fixture |
| Toggle enabled PATCH | `tests/unit/settings/InstructionsTab.test.tsx` | Mock PATCH called; switch state |

## DoD
- [ ] Table + enabled toggle wired to API
- [ ] PATCH fail → revert switch + toast
- [ ] Тесты из раздела «Тесты» зелёные
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
