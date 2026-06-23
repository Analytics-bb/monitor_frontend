---
id: m2-tests
parent_module: .cursor/plans/FE/module-2-deep-list.plan.md
depends_on:
  - m2-page-shell
  - m2-filters
  - m2-cases-table
  - m2-pagination
  - m2-row-nav
план читать: "да, §Тесты; §DoD"
status: pending
---

# Задача: Vitest + e2e deep list

## Что сделать
Unit-тесты по таблице плана модуля; `tests/e2e/deep-list.spec.ts` — загрузка `/deep`, gate filter сужает список (fixture).

## Файлы
**Создать:**
- `tests/e2e/deep-list.spec.ts`
- `tests/unit/deep-list/` — недостающие тесты

**Изменить:**
- существующие unit-файлы из задач m2-* при пробелах

**Не трогать без явного указания:** module-3 chat tests.

## Контракт (если задача создаёт/меняет сущность)
N/A

## Решения / якоря реализации
- Повторить паттерн: `tests/e2e/monitoring.spec.ts`, fixtures `deepCaseSummary`.
- Обязательно: mock `listDeepCases` / MSW в unit.
- Не делать: дублировать module-0 api client tests.

## Зависимости
Все `m2-*` задачи — итоговое поведение страницы `/deep`.

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| Render list | `tests/unit/deep-list/DeepCasesTable.test.tsx` | N rows + badges |
| gate URL sync | `tests/unit/deep-list/DeepCasesFilters.test.tsx` | `?gate_id=` |
| audit UUID shortcut | `tests/unit/deep-list/DeepCasesFilters.test.tsx` | navigate |
| Pagination | `tests/unit/deep-list/DeepCasesPagination.test.tsx` | page change |
| Row navigate | `tests/unit/deep-list/DeepCasesTable.test.tsx` | `/deep/uuid` |
| Back preserves filters | `tests/unit/deep-list/` | return URL query (smoke с m3) |
| e2e gate filter | `tests/e2e/deep-list.spec.ts` | список сужается |

## DoD
- [ ] Все сценарии из §Тесты плана модуля зелёные
- [ ] e2e `deep-list.spec.ts` проходит
- [ ] DoD родительского плана готов к staging
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
