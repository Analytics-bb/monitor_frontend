---
id: m4-api-usage
parent_module: .cursor/plans/FE/module-4-usage.plan.md
depends_on:
  - m0-api-client
  - m0-mock-samples
план читать: "да, §Маппинг полей"
status: pending
---

# Задача: api/usage.ts + fixture M14

## Что сделать
`src/api/usage.ts`: Zod-схемы и функции `listUsageRuns`, `getUsageRun`, `listUsageDaily` по OpenAPI M14; синхронизировать `src/api/fixtures/agentUsageRun.ts` с полями API (убрать `tokens_in`/`tokens_out`/`cost_usd`).

## Файлы
**Создать:**
- `src/api/usage.ts`

**Изменить:**
- `src/api/fixtures/agentUsageRun.ts`
- `src/api/fixtures/index.ts` (export при необходимости)

**Не трогать без явного указания:** pages, components, routes.

## Контракт (если задача создаёт/меняет сущность)
- `AgentUsageRun`: `run_id`, `agent_kind`, `gate_id|null`, `audit_id|null`, `session_id|null`, `provider_run_id|null`, `model`, `prompt_tokens|null`, `completion_tokens|null`, `total_tokens|null`, `estimated_cost_usd|null`, `latency_ms`, `status` (`success|error|skipped`), `error|null`, `step_breakdown: {tool_name, latency_ms}[]`, `created_at`.
- `UsageRunListPage`: `{ items, total, page, page_size }`.
- `AgentUsageDailyRollup`: `{ date, gate_id, agent_kind: "deep", total_tokens, total_cost_usd, run_count }`.
- List params: `gate_id?`, `agent_kind?`, `audit_id?`, `from?`, `to?`, `page?`, `page_size?`.
- Daily params: `gate_id?`, `date_from?`, `date_to?`.

## Решения / якоря реализации
- Повторить паттерн: `src/api/deep.ts` — Zod envelope + fixture fallback без `VITE_ANOMALY_API_BASE_URL`.
- Fixture: минимум 2 runs (deep с `step_breakdown`, hypothesis с `audit_id: null`).
- Не делать: `usage_total`, write endpoints, polling.

## Зависимости
- `m0-api-client` — `apiGetJson`, `getApiBaseUrl`.
- `m0-mock-samples` — базовый fixture-файл (переписать под M14).

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| Zod parse fixture | `tests/unit/usage/usageApi.test.ts` | deep + hypothesis runs valid |
| Fixture pagination | `tests/unit/usage/usageApi.test.ts` | list returns envelope |

## DoD
- [ ] API functions + Zod aligned with `docs/api.md` M14
- [ ] Fixture поля OpenAPI, не legacy names
- [ ] Тесты из раздела «Тесты» зелёные
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
