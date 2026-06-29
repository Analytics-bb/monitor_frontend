---
title: 'FE Module 4 — Usage'
plan: '.cursor/plans/FE/module-4-usage.plan.md'
last_reviewed: '2026-06-28'
---

# Usage (`/usage`, `/usage/{run_id}`)

## Назначение и границы

За что отвечает: история agent usage runs — фильтры (gate, agent kind, период, audit_id), server-side pagination, daily summary cards (deep only), drill-down run с metadata и `step_breakdown` для deep, ссылки в deep chat по `audit_id`.

Что явно не входит: `agent_sessions.usage_total` как primary total; hypothesis daily budget ops (M12); budget enforcement UX (`409 budget_exceeded` — M3); polling; billing export и charts; tokens per step (нет в API `step_breakdown`).

Ссылка на план: `.cursor/plans/FE/module-4-usage.plan.md`

## Структура в репозитории

| Путь | Назначение |
| ---- | ---------- |
| `src/pages/UsagePage.tsx` | Список runs: фильтры, daily cards, таблица, pagination, URL sync |
| `src/pages/UsageRunDetailPage.tsx` | Sub-route `/usage/:runId`: загрузка run, 404 handling |
| `src/components/usage/UsageFilters.tsx` | Фильтры: gate, agent kind, from/to, audit_id chip |
| `src/components/usage/UsageRunsTable.tsx` | Таблица runs; audit → иконка Link на `/deep/{audit_id}` |
| `src/components/usage/UsageRunDetail.tsx` | Metadata grid + «Детализация по шагам» для deep |
| `src/components/usage/UsageDailySummary.tsx` | 3 stat cards: tokens / cost / runs (client sum rollups) |
| `src/api/usage.ts` | `listUsageRuns`, `getUsageRun`, `listUsageDaily` + Zod |
| `src/api/fixtures/agentUsageRun.ts` | M14 schema, 30 runs fixture, daily rollups |
| `src/lib/usageFilters.ts` | Parse/validate filters, URL read/write |
| `src/lib/usageDaily.ts` | `sumUsageDailyRollups`, `getUsageTodayDateString` |

Точки входа маршрутов: `UsagePage` (`/usage`), `UsageRunDetailPage` (`/usage/:runId`).

## Публичный интерфейс

| Аспект | Решение |
| ------ | ------- |
| Маршруты | `/usage`, `/usage/:runId` |
| Загрузка списка | `listUsageRuns(params)` → `GET /api/agent/usage/runs` |
| Drill-down | `getUsageRun(runId)` → `GET /api/agent/usage/runs/{run_id}` |
| Daily summary | `listUsageDaily({ gate_id?, date_from, date_to })` → `GET /api/agent/usage/daily` |
| Dev без API | Fixture 30 runs + client-side filter/pagination; daily rollups из fixture |
| Фильтры в URL | `gate_id`, `agent_kind`, `from`, `to`, `audit_id`, `page`, `page_size` |
| Inbound link | `/usage?audit_id=` из deep chat предзаполняет фильтр (chip + Apply) |
| Переход в detail | Row click → `/usage/{run_id}` с `state.usageListSearch` для «Назад» |
| Deep link | Таблица: иконка audit; detail: кнопка «Провалиться в чат» → `/deep/{audit_id}` |

## Контракты и сущности

| Сущность | Файл | Описание |
| -------- | ---- | -------- |
| `AgentUsageRun` | `agentUsageRun.ts` | Run: tokens, cost, status, `step_breakdown[]`, `audit_id?` |
| `UsageRunListResponse` | `usage.ts` | `{ items, total, page, page_size }` |
| `AgentUsageDailyRollup` | `agentUsageRun.ts` | `{ date, gate_id, agent_kind: "deep", total_tokens, total_cost_usd, run_count }` |
| `UsageStepBreakdown` | `agentUsageRun.ts` | `{ tool_name, latency_ms }` — без tokens per step |
| `UsageFiltersState` | `usageFilters.ts` | gate, agent_kind, from, to, audit_id |

### Колонки таблицы runs

| Колонка | Поле | Отображение |
| ------- | ---- | ----------- |
| Time | `created_at` | Mono, as-is |
| Agent | `agent_kind` | Text |
| Gate | `gate_id` | Mono chip |
| Audit | `audit_id` | Иконка Link или «—» (tooltip backfill pending) |
| Model | `model` | Mono |
| In / Out | `prompt_tokens`, `completion_tokens` | Mono tabular-nums |
| Cost | `estimated_cost_usd` | Mono, 4 decimals |
| Status | `status` | `StatusBadge` |

## Ошибки и коды

| Код | Константа | Условие | Примечание |
| --- | --------- | ------- | ---------- |
| `usage_run_not_found` | `ApiClientError` | `GET .../runs/{run_id}` 404 | Inline alert + «Назад» на detail page |
| (транспорт) | `ApiClientError` | Ошибка list/daily | Inline alert + Retry на UsagePage |
| (валидация UI) | — | Невалидный gate/дата при Apply | Сообщение под полем; Apply блокируется |

## Заглушки и временное поведение

| Что | Где | Поведение |
| --- | --- | --------- |
| Список runs | `agentUsageRunsListFixture` | 30 записей (deep/hypothesis mix); dev/Vitest без `VITE_ANOMALY_API_BASE_URL` |
| Daily rollups | `agentUsageDailyRollupFixture` | 2 rollup-строки для deep |
| Filter/pagination | `usage.ts` | Client-side filter + slice в fixture-режиме |

## Зависимости

### Модули проекта

- Module 0: `AppLayout`, `StatusBadge`, `api/client`, `mapApiError`, shadcn UI
- Module 2: `DeepCasesPagination` переиспользован для footer pagination
- Module 3: inbound `/usage?audit_id=` из deep chat; outbound links `/deep/{audit_id}`
- Module 6: protected routes через mock auth
- M14 OpenAPI — поля `AgentUsageRun`; M17 §7.4 — сценарий usage

### Конфигурация

| Переменная | Назначение | Обязательная |
| ---------- | ---------- | ------------ |
| `VITE_ANOMALY_API_BASE_URL` | Base URL anomaly-api; пусто → fixtures | Нет (dev) |

## Тесты

| Файл | Что проверяет | Уровень |
| ---- | ------------- | ------- |
| `tests/unit/usage/usageApi.test.ts` | Fixture parse M14, list pagination, audit_id filter, get 404 | unit |
| `tests/unit/usage/invariants.test.ts` | OpenAPI field names; нет legacy `usage_total` | unit |
| `tests/unit/usage/UsageFilters.test.tsx` | audit_id из URL → chip | unit |
| `tests/unit/usage/UsageRunsTable.test.tsx` | Audit link icon / no link when null | unit |
| `tests/unit/usage/UsageRunDetail.test.tsx` | Header, step_breakdown tool_name + latency_ms | unit |
| `tests/unit/usage/UsageRunDetailPage.test.tsx` | 404 `usage_run_not_found` | unit |
| `tests/unit/usage/UsageDailySummary.test.tsx` | Client sum rollups → stat cards | unit |
| `tests/e2e/usage.spec.ts` | List → row click → detail + step breakdown table | e2e |

Намеренно не покрыто: визуальная проверка light/dark theme; daily widget с реальным MSK TZ (используется локальная дата браузера); полный e2e pagination на staging API.

## Как пользоваться

```bash
# Dev с fixtures (30 runs)
npm run dev
# открыть http://localhost:5173/usage

# С staging API
VITE_ANOMALY_API_BASE_URL=https://staging.example npm run dev
```

```tsx
import { listUsageRuns, getUsageRun } from '@/api/usage'

const page = await listUsageRuns({
  gate_id: '42',
  agent_kind: 'deep',
  audit_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  from: '2025-07-01',
  to: '2025-07-31',
  page: 1,
  page_size: 20,
})

const run = await getUsageRun(page.items[0]!.run_id)
```

Shareable URL: `/usage?gate_id=42&agent_kind=deep&from=2025-07-01&to=2025-07-31&page=1&page_size=20`

## Наблюдаемость и безопасность

- `audit_id` в таблице — только иконка-ссылка, без полного UUID в ячейке.
- Ошибки API через `mapApiError`; `error_code` показывается в UI (404 detail, list retry).
- Секреты не в SPA; PII/tokens не логируются.

## Совместимость и эталоны

- Single read path ADR: только M14 `GET /agent/usage/runs` (+ `/{run_id}`, `/daily`); не `usage_total`.
- Daily cards: только deep rollups; hypothesis не входит в `/daily`.
- Daily query «today»: локальная календарная дата браузера (`getUsageTodayDateString`), не явный MSK offset.
- Datetime в таблице: naive MSK as-is из API.
- Отличие от раннего UX-плана: заголовок «Использование»; нет manual Refresh; detail без Run/Audit/Session ID в grid.

## История и миграции

- 2026-06: реализован M4 — usage list + detail, M14 API client, daily summary, e2e drill-down; UI polish (русские подписи, audit icon, detail header frame).
