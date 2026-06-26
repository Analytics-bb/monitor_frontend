---
id: m5-conflict-handling
parent_module: .cursor/plans/FE/module-5-agent-settings.plan.md
depends_on:
  - m5-instruction-editor
  - m5-context-upsert
  - m0-toast-provider
план читать: "да, §Ключевые гарантии п.4–5; §Edge-cases PUT context 409"
status: pending
---

# Задача: 409 conflict — toast error_code + preserved form

## Что сделать
Убедиться, что `PUT` context upsert и instruction mutations при 409 показывают `mapApiError` с `error_code`, editor остаётся открытым, form state не сбрасывается.

## Файлы
**Создать:**
- `src/api/fixtures/instructionConflict.ts` (или расширить существующий fixtures) — 409 envelope для Vitest

**Изменить:**
- `src/components/settings/ContextEditor.tsx` — 409 branch: toast + no reset
- `src/components/settings/InstructionEditor.tsx` — аналогично для applicable errors
- `tests/unit/settings/` — 409 scenarios

**Не трогать без явного указания:** list/toggle logic beyond error paths.

## Контракт (если задача создаёт/меняет сущность)
N/A — поведение UI на `{ error_code, message, details }` envelope (уже в `src/api/errors.ts`).

## Решения / якоря реализации
- Повторить паттерн: `tests/unit/apiErrors.test.ts` — toast title = `error_code`.
- Обязательно: editor panel не unmount на 409; textarea values preserved.
- Не делать: retry/auto-merge; optimistic updates.

## Зависимости
- `m5-instruction-editor`, `m5-context-upsert` — editors с мутациями.
- `m0-toast-provider` — `mapApiError`.

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| 409 toast | `tests/unit/settings/ContextEditor.test.tsx` | error_code shown; form values unchanged |

## DoD
- [ ] PUT context 409 → toast + editor open
- [ ] Form state preserved on conflict
- [ ] Тесты из раздела «Тесты» зелёные
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
