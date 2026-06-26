---
id: m5-tests
parent_module: .cursor/plans/FE/module-5-agent-settings.plan.md
depends_on:
  - m5-page-tabs
  - m5-instructions-list
  - m5-instruction-editor
  - m5-contexts-list
  - m5-context-upsert
  - m5-conflict-handling
план читать: "да, §Тесты; §DoD"
status: pending
---

# Задача: Vitest — agent settings module

## Что сделать
Unit-тесты по таблице плана модуля; smoke tabs switch; агрегировать сценарии из task-файлов если не покрыты.

## Файлы
**Создать:**
- `tests/unit/settings/AgentSettingsPage.test.tsx` (smoke tabs)

**Изменить:**
- `tests/unit/settings/InstructionsTab.test.tsx`
- `tests/unit/settings/InstructionEditor.test.tsx`
- `tests/unit/settings/ContextEditor.test.tsx`

**Не трогать без явного указания:** e2e (не в scope M5 plan).

## Контракт (если задача создаёт/меняет сущность)
N/A

## Решения / якоря реализации
- Повторить паттерн: `tests/unit/deep-list/` — MSW/mock `api/*` + fixtures.
- N/A

## Зависимости
Все `m5-*` задачи выше — полный UI settings module.

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| Instructions list render | `tests/unit/settings/InstructionsTab.test.tsx` | Rows from fixture |
| Toggle enabled PATCH | `tests/unit/settings/InstructionsTab.test.tsx` | Mock PATCH; switch state |
| Context PUT roundtrip | `tests/unit/settings/ContextEditor.test.tsx` | Payload matches form |
| 409 toast | `tests/unit/settings/ContextEditor.test.tsx` | error_code shown |
| Delete confirm | `tests/unit/settings/InstructionEditor.test.tsx` | DELETE after confirm |
| Tabs switch | `tests/unit/settings/AgentSettingsPage.test.tsx` | Instructions ↔ Contexts |

## DoD
- [ ] Все сценарии из §Тесты плана модуля зелёные
- [ ] `npm test` settings suite pass
- [ ] DoD родительского плана готов к staging
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
