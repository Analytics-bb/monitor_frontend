---
description: Текущее состояние frontend-репозитория и архитектурные решения
alwaysApply: true
---

# Память проекта

## Текущий релиз
- Репозиторий: `monitor_frontend` — внешний React SPA для **BB Anomaly Detection R2**
- Релиз: `R2` (frontend — в начальной фазе; адаптация `.cursor`, скаффолд и UI — впереди)
- **Source of truth контракта:** `.cursor/plans/R2/module-17-web-frontend-contract.plan.md` (M17)
- Планы реализации фронта: `.cursor/plans/FE/` (индекс + per-page — по Phase 3 setup-плана)
- Backend upstream: REST `anomaly-api`; OpenAPI `/docs` — source of truth для полей JSON
- Стек: React 19 + Vite + TS + Tailwind + shadcn/ui + React Router v7; Vitest + Playwright

При переходе на новый релиз — обновить только этот блок.

## Инварианты
Критичное для агента (из M17):
- **Datetime в UI:** naive MSK — отображать как приходит из API, без конвертации TZ
- **Секреты не в SPA:** `CURSOR_API_KEY`, `MCP_ANALYTICS_TOKEN` и пр. — только на бэкенде; клиент знает лишь `ANOMALY_API_BASE_URL`
- **OpenAPI anomaly-api** — source of truth для типов полей; M17 описывает *когда* вызывать эндпоинт, не дублирует схемы
- **Live vs snapshot:** `/monitoring` — последний тик; `/deep/{audit_id}` — immutable snapshot audit + mutable только `deep_chat` этого `audit_id`
- **Deep transport R2:** HTTP polling `GET /deep/cases/{audit_id}/chat`; мутации — REST POST; polling останавливается в terminal state; `clearInterval` при unmount
- **`pending_action != null`:** блокировать ввод сообщения; показать Approve/Reject
- **Usage UI:** только `GET /agent/usage/runs` (+ `/{run_id}`); не `agent_sessions.usage_total` как primary total
- **Ошибки API:** `{ error_code, message, details }` — UI показывает `error_code`, не пустой экран
- **R2 prod:** `telegram_status` в audit — `null`; UI не показывает Telegram delivery
- **Auth R2:** M19 opaque session — `POST /api/auth/login`, Bearer в REST, logout в sidebar; `VITE_MOCK_AUTH_ENABLED=false` bypass guard для e2e
- **CORS:** нужен только в dev (localhost SPA → staging API); prod — same origin, CORS не нужен

## Статус страниц и инфраструктуры

| Область | Маршрут / путь | Статус | План / примечание |
|---------|----------------|--------|-------------------|
| Layout + Sidebar | `src/app/` | done | `docs/modules/module-0-index.md` |
| StatusBadge | `src/components/` | done | единая система status-* tokens |
| Monitoring | `/monitoring` | done | `docs/modules/module-1-monitoring.md` |
| Deep list | `/deep` | done | `docs/modules/module-2-deep-list.md` |
| Deep chat | `/deep/{audit_id}` | done | `docs/modules/module-3-deep-chat.md` |
| Usage | `/usage`, `/usage/{run_id}` | done | `docs/modules/module-4-usage.md` |
| Agent settings | `/settings/agents` | done | `docs/modules/module-5-agent-settings.md` |
| Support | `/support` | done | `docs/modules/module-7-support.md` |
| Login + session | `/login` | done | `docs/modules/module-6-mock-auth.md` |
| Cabinet | `/cabinet` | done | placeholder «скоро» |
| API client | `src/api/` | done | Bearer M19, fixtures, Zod errors |
| Hooks | `src/hooks/` | done | `usePolling`, `useDeepChat`, `useSupportChat` |
| Scaffold | корень репо | done | Vite + React 19 + shadcn |
| Deploy | `deploy/` | pending | nginx SPA + `/api/*` proxy (M0 §3.3) |
| `.cursor` адаптация | `.cursor/` | done | Phase 1 setup-плана |

**Критический путь реализации:** M0–M7 FE per-page modules **done** → следующий: deploy / staging e2e против live API.

## Архитектурные решения (ADR)

### 2026-06-17: Usage UI — single read path через M14
Проблема: `usage_total` (M16), `AgentReport.usage` (M7) и `agent_usage_runs` (M14) выглядят как конкурирующие источники для UI.
Решение: страница `/usage` читает **`GET /agent/usage/runs`** и **`GET /agent/usage/runs/{run_id}`** (M14); drill-down deep — `step_breakdown` в run. `usage_total` — агрегат сессии (M16), не главный UI total.
Нельзя: строить таблицу runs из `agent_sessions.usage_total`.

### 2026-06-22: M17 — контракт в backend-плане, реализация в monitor_frontend
Проблема: интеграционный контракт SPA (маршруты, polling, HTTP-таблица) живёт в backend-репо, код UI — отдельно.
Решение: **M17 plan** остаётся source of truth для контракта; **monitor_frontend** — единственный репозиторий кода SPA; per-page планы — в `.cursor/plans/FE/`.
Нельзя: дублировать OpenAPI-поля в FE-планах; менять REST API из frontend-репо.

### 2026-06-22: Session auth в R2 (эволюция mock → M19)
Проблема: оператору нужен guard маршрутов уже в R2; позже backend добавил M19 opaque session.
Решение: `/login` → `POST /api/auth/login` → Bearer в `api/client`; logout → `POST /api/auth/logout` + clear localStorage. Fixture-mode без API URL — offline login fixture. `VITE_MOCK_AUTH_ENABLED=false` — bypass guard для e2e.
Нельзя: логировать token в prod; хранить пароли в storage.

### 2026-06-22: Mock auth в R2 (superseded)
Исторически: boolean flag в localStorage без backend. Заменено M19 session auth (см. ADR выше). Deprecated aliases остаются в `mockSession.ts`.

### 2026-06-22: Polling вместо WebSocket для deep/monitoring
Проблема: R2 без WebSocket/SSE для чата и monitoring.
Решение: client-side HTTP polling с интервалами из M17 §10.s; после мутации — немедленный refetch + ускоренный polling; stop on unmount и в terminal chat state.
Нельзя: добавлять WebSocket/SSE в R2 SPA без изменения M17 и backend-контракта.

## Открытые вопросы
<!-- [ ] вопрос · контекст · кто решает -->
