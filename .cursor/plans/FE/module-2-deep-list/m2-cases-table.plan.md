---
id: m2-cases-table
parent_module: .cursor/plans/FE/module-2-deep-list.plan.md
depends_on:
  - m2-page-shell
  - m2-filters
  - m0-status-badge
план читать: "нет"
status: completed
---

# Задача: DeepCasesTable — колонки audits

## Что сделать
Data-dense table: время, audit_id (short + tooltip), gate chip, event summary, conclusion excerpt, `deep_chat_state` StatusBadge; truncate; sticky header; client-side prefix filter по `audit_id` из URL (если не полный UUID).

## Файлы
**Создать:**
- `src/components/deep/DeepCasesTable.tsx`

**Изменить:**
- `src/pages/DeepListPage.tsx`
- `src/components/deep/index.ts`

**Не трогать без явного указания:** pagination controls, row navigate handler.

## Контракт (если задача создаёт/меняет сущность)
`DeepCasesTable`: props `items: DeepCaseSummary[]`, optional `auditIdPrefix` для client filter.

Колонки §Концепция; `created_at` — JetBrains Mono, naive MSK as-is (без `formatDateTimeRu` если API отдаёт уже MSK-строку).

`StatusBadge` — варианты deep chat (`not_started` … `error`).

## Решения / якоря реализации
- Повторить паттерн: shadcn `Table` + `@tanstack/react-table` (module-0 §Дизайн-система).
- Обязательно: row height ~36px; truncate event/conclusion.
- Не делать: row click navigation (задача `m2-row-nav`).

## Зависимости
- `m2-filters` — данные `items` с страницы.
- `m0-status-badge` — `deep_chat_state` колонка.

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| Render list fixture | `tests/unit/deep-list/DeepCasesTable.test.tsx` | N rows, StatusBadge per state |
| Truncate conclusion | `tests/unit/deep-list/DeepCasesTable.test.tsx` | длинный текст не ломает layout |

## DoD
- [ ] Таблица с 6 колонками по плану
- [ ] StatusBadge для всех deep chat states
- [ ] Тесты из раздела «Тесты» зелёные
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
