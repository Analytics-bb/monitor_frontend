---
id: m4-runs-table
parent_module: .cursor/plans/FE/module-4-usage.plan.md
depends_on:
  - m4-api-usage
  - m4-filters
план читать: "да, §Промпт дизайна"
status: pending
---

# Задача: UsagePage + UsageRunsTable

## Что сделать
Страница `/usage`: filter bar, TanStack table runs (server pagination), manual Refresh, row click → `/usage/:runId`; колонки по OpenAPI M14.

## Файлы
**Создать:**
- `src/components/usage/UsageRunsTable.tsx`

**Изменить:**
- `src/pages/UsagePage.tsx`

**Не трогать без явного указания:** `UsageRunDetailPage`, daily widget, routes detail child.

## Контракт (если задача создаёт/меняет сущность)
Колонки: `created_at` | `agent_kind` badge | `gate_id` | audit link (`audit_id` → `/deep/{id}` или «—») | `model` | `prompt_tokens`/`completion_tokens` | `estimated_cost_usd` | `status` (StatusBadge).

Pagination: `page`, `page_size` → API; отображать total из envelope.

## Решения / якоря реализации
- Повторить паттерн: `src/pages/DeepListPage.tsx` + table component — loading/empty/error states.
- Числа: JetBrains Mono / `tabular-nums`.
- Null tokens/cost → em dash.
- Не делать: drawer detail; daily cards (отдельная задача).

## Зависимости
- `m4-api-usage` — `listUsageRuns`.
- `m4-filters` — `UsageFilters`.

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| List from fixture | `tests/unit/usage/UsageRunsTable.test.tsx` | Correct row count and columns |
| audit_id link | `tests/unit/usage/UsageRunsTable.test.tsx` | href `/deep/uuid` when present |
| No link without audit_id | `tests/unit/usage/UsageRunsTable.test.tsx` | No anchor when null |

## DoD
- [ ] Table + pagination + filters wired
- [ ] Row navigates to `/usage/:runId`
- [ ] Тесты из раздела «Тесты» зелёные
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
