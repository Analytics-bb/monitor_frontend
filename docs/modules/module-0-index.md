---
title: 'FE Module 0 — Index'
plan: '.cursor/plans/FE/module-0-index.plan.md'
last_reviewed: '2026-07-05'
---

# Index (инфраструктура SPA)

## Назначение и границы

За что отвечает: общая инфраструктура monitor_frontend — дизайн-токены light/dark, `AppLayout` + `Sidebar`, `StatusBadge`, HTTP-клиент с Bearer M19, `usePolling`, toast-ошибки, mock fixtures для dev/Vitest.

Что явно не входит: бизнес-страницы (module-1…7), deploy, e2e-сценарии страниц, backend-контракты.

Ссылка на план: `.cursor/plans/FE/module-0-index.plan.md`

## Структура в репозитории

| Путь | Назначение |
|------|------------|
| `src/index.css` | CSS-переменные light/dark, status-*, шрифты Inter + JetBrains Mono |
| `src/app/layout/AppLayout.tsx` | Shell: Sidebar + `<Outlet />` + Toaster |
| `src/app/layout/Sidebar.tsx` | Навигация M17, AuthSlot, ThemeToggle |
| `src/app/layout/ThemeToggle.tsx` | Переключатель темы |
| `src/app/providers/` | `ThemeProvider`, persist `monitor-theme` |
| `src/app/routes.tsx` | Маршруты React Router v7 |
| `src/components/StatusBadge.tsx` | Единые цвета статусов monitoring + deep |
| `src/api/client.ts` | `apiFetch`, retry GET, Bearer, fixture mode |
| `src/api/errors.ts` | Zod error envelope, `mapApiError`, `ApiClientError` |
| `src/api/fixtures/` | Mock-сэмплы для dev и unit-тестов |
| `src/hooks/usePolling.ts` | Базовый polling-хук |
| `src/main.tsx` | `AuthProvider` + `ThemeProvider` + router |

Точки входа: `main.tsx`, `appRoutes` в `routes.tsx`.

## Публичный интерфейс

| Аспект | Решение |
|--------|---------|
| Theme | Default light; `.dark` на `<html>`; key `monitor-theme` |
| HTTP | `getApiBaseUrl()` → `VITE_ANOMALY_API_BASE_URL`; fixture mode без URL |
| Auth header | Bearer из `getSessionToken()` (module-6); `skipAuth` для login |
| Polling | `usePolling({ fetcher, intervalMs, enabled, onData, onError })` |
| Errors UI | `mapApiError(error)` → sonner toast с `error_code` |
| StatusBadge | Props `variant` + optional `label`; monitoring и deep chat states |
| Fixtures | `isFixtureMode()` — dev или `VITE_USE_API_FIXTURES=true` |

## Контракты и сущности

| Сущность | Файл | Описание |
|----------|------|----------|
| `ApiClientError` | `errors.ts` | HTTP + parsed `{ error_code, message, details }` |
| `ApiFetchOptions` | `client.ts` | `timeoutMs`, `retry`, `skipAuth` |
| `UsePollingOptions` | `usePolling.ts` | fetcher, interval, enabled, callbacks |
| `StatusBadgeVariant` | `StatusBadge.tsx` | success, error, skipped, active, awaiting_approval, completed, not_started, cancelled |
| Fixture samples | `fixtures/*` | status, deep case, chat, usage run, audit entry |

## Ошибки и коды

| Код | Константа | Условие | Примечание |
|-----|-----------|---------|------------|
| (transport) | `ApiClientError` | Non-2xx без JSON envelope | Fallback message |
| `not_authenticated` | — | 401 на REST | `api/client` clears session |
| (parse) | Zod | Invalid error envelope | Wrapped in `ApiClientError` |

## Заглушки и временное поведение

| Что | Где | Поведение |
|-----|-----|-----------|
| Fixture mode | `client.ts` | Без base URL — API-функции возвращают fixtures |
| GitHub Pages base | `routes.tsx` | `basename` из `import.meta.env.BASE_URL` |

## Зависимости

### Модули проекта

- M17 — маршруты, polling policy, env naming
- module-6 — Bearer token для `api/client`

### Конфигурация

| Переменная | Назначение | Обязательная |
|------------|------------|--------------|
| `VITE_ANOMALY_API_BASE_URL` | Base URL anomaly-api | Нет (fixture mode) |
| `VITE_USE_API_FIXTURES` | Fixtures в prod preview | Нет |
| `VITE_BASE_PATH` | Basename router (GitHub Pages) | Нет |
| `VITE_MOCK_AUTH_ENABLED` | Guard bypass при `false` | Нет (default true) |

## Тесты

| Файл | Что проверяет | Уровень |
|------|--------------|---------|
| `tests/unit/usePolling.test.ts` | unmount, interval switch, visibility ×2 | unit |
| `tests/unit/apiErrors.test.ts` | error envelope parse | unit |
| `tests/unit/StatusBadge.test.tsx` | все variants | unit |
| `tests/unit/ThemeProvider.test.tsx` | light/dark persist | unit |
| `tests/unit/Sidebar.test.tsx` | nav links M17 | unit |
| `tests/unit/fixtures.test.ts` | fixture schemas | unit |
| `tests/unit/scaffold.test.ts` | базовый scaffold | unit |

Намеренно не покрыто: visual regression light/dark, prod build без env (throw path).

## Как пользоваться

```bash
# Dev с fixtures (без API)
VITE_ANOMALY_API_BASE_URL= npm run dev

# Dev против local API
VITE_ANOMALY_API_BASE_URL=http://localhost:8000 npm run dev
```

```tsx
import { usePolling } from '@/hooks/usePolling'

usePolling({
  fetcher: () => getStatus(),
  intervalMs: 7000,
  onData: setData,
})
```

## Наблюдаемость и безопасность

- Bearer token не логируется; `401` → clear session + `authChanged` event
- Секреты (`CURSOR_API_KEY` и т.п.) не в SPA
- Dev warning при отсутствии API URL

## Совместимость и эталоны

- OpenAPI anomaly-api — поля JSON; M17 — когда вызывать эндпоинты
- shadcn/ui + Tailwind v4 `@custom-variant dark`

## История и миграции

N/A — инфраструктурный модуль без ломающих изменений контракта SPA.
