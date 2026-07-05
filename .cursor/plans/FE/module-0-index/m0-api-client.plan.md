---
id: m0-api-client
parent_module: .cursor/plans/FE/module-0-index.plan.md
depends_on: []
план читать: "да, §Ключевые гарантии п.2; M17 §10.z.1"
status: completed
---

# Задача: API client + error envelope

## Что сделать
Доработать HTTP-клиент: base URL, timeout, GET-retry 502/503/504 (max 3), Zod-парсинг error envelope `{ error_code, message, details }`.

## Файлы
**Создать:**
- `src/api/errors.ts`

**Изменить:**
- `src/api/client.ts`
- `src/api/index.ts` (re-export)
- `src/vite-env.d.ts` (если нужны типы env)

**Не трогать без явного указания:** `mapApiError` + toast (задача `m0-toast-provider`).

## Контракт (если задача создаёт/меняет сущность)
`ApiError`: typed error с полями `error_code`, `message`, `details?`.

`parseApiError(response: Response): Promise<ApiError | null>` — Zod на границе.

`apiFetch` / `apiClient`: JSON headers, timeout по M17 §10.z.1, retry только GET при 502/503/504.

Env: `VITE_ANOMALY_API_BASE_URL` (как в scaffolde); dev без URL — warn + возможность fixtures (не fail в dev).

## Решения / якоря реализации
- Повторить паттерн: `src/api/client.ts` — расширить существующие `getApiBaseUrl` / `apiFetch`.
- Обязательно: не логировать PII/токены; секреты не в SPA.
- Не делать: `mapApiError`, sonner, domain-specific API (monitoring, deep).

## Зависимости
N/A

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| Error envelope parse | `tests/unit/apiErrors.test.ts` | valid/invalid JSON → typed error |

## DoD
- [ ] client + errors.ts; GET-retry и timeout
- [ ] Zod envelope на границе `src/api`
- [ ] Тесты из раздела «Тесты» зелёные
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
