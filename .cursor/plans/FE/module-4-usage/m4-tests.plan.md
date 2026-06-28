---
id: m4-tests
parent_module: .cursor/plans/FE/module-4-usage.plan.md
depends_on:
  - m4-api-usage
  - m4-filters
  - m4-runs-table
  - m4-run-detail
  - m4-daily-widget
  - m4-no-usage-total
план читать: "да, §Тесты"
status: pending
---

# Задача: Vitest + e2e usage

## Что сделать
Довести покрытие M4: unit tests из плана модуля + `tests/e2e/usage.spec.ts` (row click → detail route).

## Файлы
**Создать/дополнить:**
- `tests/unit/usage/*.test.ts(x)` — недостающие сценарии
- `tests/e2e/usage.spec.ts`

**Не трогать без явного указания:** unrelated modules.

## Контракт (если задача создаёт/меняет сущность)
N/A

## Решения / якоря реализации
- Повторить паттерн: `tests/e2e/deep-list.spec.ts` или существующие e2e — mock/fixture base URL.
- e2e: protected route `/usage` with mock auth (module-6).
- Не дублировать: unit tests уже написанные в prior tasks — только gap fill.

## Зависимости
- Все m4-* tasks.

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| e2e drill-down | `tests/e2e/usage.spec.ts` | Click row → detail visible |
| Full module matrix | plan §Тесты | All rows green |

## DoD
- [ ] All plan test rows implemented and passing
- [ ] `npm test` green for usage scope
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
