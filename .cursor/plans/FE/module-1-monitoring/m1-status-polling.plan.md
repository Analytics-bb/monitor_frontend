---
id: m1-status-polling
parent_module: .cursor/plans/FE/module-1-monitoring.plan.md
depends_on:
  - m0-api-client
  - m0-use-polling
  - m0-mock-samples
план читать: "да, §Ключевые гарантии п.2–3; M17 §10.s"
status: completed
---

# Задача: API status + useMonitoringPolling

## Что сделать
`GET /api/status` в `api/monitoring.ts` и хук `useMonitoringPolling` с интервалами 5–10s штатно, 2–3s при `tick_in_progress`, exponential backoff при 503, stop on unmount.

## Файлы
**Создать:**
- `src/api/monitoring.ts` (`getStatus` + типы из OpenAPI/fixtures)
- `src/hooks/useMonitoringPolling.ts`

**Изменить:**
- `src/api/index.ts` (re-export)
- `src/hooks/index.ts` (re-export)

**Не трогать без явного указания:** gate endpoints (задача `m1-gate-selector`), UI-компоненты.

## Контракт (если задача создаёт/меняет сущность)
`getStatus(): Promise<StatusResponse>` — поля по OpenAPI; парсинг на границе (Zod или typed fixture).

`useMonitoringPolling()` → `{ data, error, isStale, isDegraded, refetch, lastFetchAt }`:
- interval switch по `tick_in_progress`;
- 503 `scheduler_not_initialized` → `isDegraded`, backoff 5s→15s→30s;
- visibility ×2 через `usePolling`;
- `refetch()` — немедленный poll без сброса interval.

## Решения / якоря реализации
- Повторить паттерн: `src/api/client.ts` — `apiFetch`; fixtures из `m0-mock-samples` (`StatusResponse`).
- Обязательно: stop on unmount; naive MSK datetime as-is в типах, без TZ-конвертации в хуке.
- Не делать: gate API, UI, toast.

## Зависимости
- `m0-api-client` — `apiFetch`, error envelope.
- `m0-use-polling` — базовый interval/visibility.
- `m0-mock-samples` — `StatusResponse` fixture для dev/Vitest.

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| Interval switch | `tests/unit/monitoring/useMonitoringPolling.test.ts` | `tick_in_progress` → 2–3s |
| Stop on unmount | `tests/unit/monitoring/useMonitoringPolling.test.ts` | clearInterval после unmount |

## DoD
- [ ] `getStatus` + hook с interval/backoff/degraded
- [ ] Re-export из `api/index`, `hooks/index`
- [ ] Тесты из раздела «Тесты» зелёные
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
