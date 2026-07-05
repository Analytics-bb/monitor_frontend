---
id: m4-no-usage-total
parent_module: .cursor/plans/FE/module-4-usage.plan.md
depends_on:
  - m4-runs-table
  - m4-run-detail
  - m4-daily-widget
план читать: "да, §Ключевые гарантии п.1–2"
status: completed
---

# Задача: Guard — no usage_total

## Что сделать
Проверить модуль usage на отсутствие `usage_total`, `AgentReport.usage` как primary table source, legacy fixture names; зафиксировать grep checklist в PR/DoD комментарии или `tests/unit/usage/invariants.test.ts`.

## Файлы
**Создать (optional):**
- `tests/unit/usage/invariants.test.ts`

**Изменить:**
- только если найдены нарушения в файлах M4

**Не трогать без явного указания:** deep chat, monitoring (они могут показывать embedded usage в audit — не primary total).

## Контракт (если задача создаёт/меняет сущность)
N/A — audit/review task.

## Решения / якоря реализации
- ADR `memory.md` §2026-06-17: single read path M14 only.
- Grep patterns: `usage_total`, `tokens_in`, `tokens_out`, `cost_usd` (legacy fixture names) under `src/pages/Usage*`, `src/components/usage/`, `src/api/usage.ts`.
- Не блокировать: `AgentReport.usage` в monitoring fixtures.

## Зависимости
- Все code tasks M4 завершены.

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| No usage_total import | `tests/unit/usage/invariants.test.ts` | static check or documented grep pass |

## DoD
- [ ] No `usage_total` / legacy token field names in M4 scope
- [ ] Checklist documented
- [ ] Тесты из раздела «Тесты» зелёные (if added)
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
