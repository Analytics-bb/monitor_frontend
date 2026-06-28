---
id: m4-daily-widget
parent_module: .cursor/plans/FE/module-4-usage.plan.md
depends_on:
  - m4-api-usage
  - m4-runs-table
план читать: "да, §Маппинг полей (daily)"
status: pending
---

# Задача: UsageDailySummary cards

## Что сделать
Optional header widget на UsagePage: 3 stat cards (total tokens today, deep cost USD, run count) из `GET /agent/usage/daily` с client-side sum по items.

## Файлы
**Создать:**
- `src/components/usage/UsageDailySummary.tsx`

**Изменить:**
- `src/pages/UsagePage.tsx` — slot в header

**Не трогать без явного указания:** table, detail route.

## Контракт (если задача создаёт/меняет сущность)
Query: `date_from` = `date_to` = today (MSK calendar date string as-is); optional `gate_id` из active filter.

Sum across `AgentUsageDailyRollup[]`: Σ `total_tokens`, Σ `total_cost_usd`, Σ `run_count`.

API returns only `agent_kind: "deep"` rollups — cards label as deep usage.

## Решения / якоря реализации
- Today date: local helper без TZ conversion (naive MSK policy — use date string from ops context or `new Date()` formatted consistently with other pages).
- Empty rollup → cards show 0.
- Не делать: charts; hypothesis aggregates (API не отдаёт).

## Зависимости
- `m4-api-usage` — `listUsageDaily`.
- `m4-runs-table` — UsagePage shell exists.

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| daily sum | `tests/unit/usage/UsageDailySummary.test.tsx` | Cards match sum of fixture rollups |

## DoD
- [ ] Three cards render with summed values
- [ ] Respects optional gate_id filter
- [ ] Тесты из раздела «Тесты» зелёные
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
