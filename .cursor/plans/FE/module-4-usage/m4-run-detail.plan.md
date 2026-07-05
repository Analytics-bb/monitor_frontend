---
id: m4-run-detail
parent_module: .cursor/plans/FE/module-4-usage.plan.md
depends_on:
  - m4-api-usage
план читать: "да, §Edge-cases"
status: completed
---

# Задача: /usage/:runId detail page

## Что сделать
Sub-route `/usage/:runId`: `UsageRunDetailPage` + `UsageRunDetail` — metadata grid, `step_breakdown` table для `agent_kind === "deep"`, link «Open deep case», 404 handling.

## Файлы
**Создать:**
- `src/pages/UsageRunDetailPage.tsx`
- `src/components/usage/UsageRunDetail.tsx`

**Изменить:**
- `src/app/routes.tsx` — child `usage/:runId`

**Не трогать без явного указания:** UsagePage table, daily widget.

## Контракт (если задача создаёт/меняет сущность)
Metadata: все поля `AgentUsageRun` из API (см. `m4-api-usage`).

`step_breakdown` columns: **tool_name | latency_ms** — tokens per step в API нет.

404: `usage_run_not_found` → message + Link to `/usage`.

## Решения / якоря реализации
- Повторить паттерн: error/loading из `DeepChatPage` / list detail patterns.
- Hypothesis run: metadata без step table (empty state «—»).
- Back navigation: breadcrumb или link «← Usage» with preserved list query (optional, via `location.state` or searchParams).
- Не делать: drawer variant.

## Зависимости
- `m4-api-usage` — `getUsageRun`.

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| step_breakdown deep | `tests/unit/usage/UsageRunDetail.test.tsx` | tool_name + latency_ms visible |
| 404 run | `tests/unit/usage/UsageRunDetailPage.test.tsx` | error_code shown |

## DoD
- [ ] Route registered; detail fetches by runId
- [ ] step_breakdown для deep; link to `/deep/{audit_id}`
- [ ] Тесты из раздела «Тесты» зелёные
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
