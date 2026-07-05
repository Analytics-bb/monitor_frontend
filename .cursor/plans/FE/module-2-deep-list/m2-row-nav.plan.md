---
id: m2-row-nav
parent_module: .cursor/plans/FE/module-2-deep-list.plan.md
depends_on:
  - m2-cases-table
план читать: "нет"
status: completed
---

# Задача: Row navigate → /deep/{audit_id}

## Что сделать
Кликабельная строка таблицы: hover affordance, chevron `→`, `navigate(/deep/{audit_id})`; keyboard Enter на focused row; все строки кликабельны включая `not_started`.

## Файлы
**Изменить:**
- `src/components/deep/DeepCasesTable.tsx`
- `src/pages/DeepListPage.tsx` (optional `location.state` для saved filters)

**Не трогать без явного указания:** chat page, filters API.

## Контракт (если задача создаёт/меняет сущность)
N/A — навигация через React Router `useNavigate`.

Saved filters: при return из module-3 breadcrumb «Deep» → `/deep?${searchParams}` (контракт с `m3-page-shell`).

## Решения / якоря реализации
- Обязательно: `cursor-pointer`, `hover:bg-muted/40`, `role="button"` или `<tr onClick>`.
- Не делать: prefetch chat snapshot.

## Зависимости
- `m2-cases-table` — таблица с `audit_id` в rows.

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| Row navigate | `tests/unit/deep-list/DeepCasesTable.test.tsx` | click → `/deep/uuid` |
| not_started clickable | `tests/unit/deep-list/DeepCasesTable.test.tsx` | navigate при `not_started` |

## DoD
- [ ] Row click + Enter → `/deep/{audit_id}`
- [ ] Visual affordance (hover, chevron)
- [ ] Тесты из раздела «Тесты» зелёные
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
