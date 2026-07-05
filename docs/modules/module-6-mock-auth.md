---
title: 'FE Module 6 — Session Auth'
plan: '.cursor/plans/FE/module-6-mock-auth.plan.md'
last_reviewed: '2026-07-05'
---

# Session Auth (`/login`, `/cabinet`, guards)

## Назначение и границы

За что отвечает: M19 opaque session — login/logout/me, хранение token в localStorage, Bearer на REST через `api/client`, guard protected routes, sidebar Login/Logout, placeholder `/cabinet`.

Что явно не входит: RBAC, OAuth, refresh-token rotation, profile API.

Ссылка на план: `.cursor/plans/FE/module-6-mock-auth.plan.md`

## Структура в репозитории

| Путь | Назначение |
|------|------------|
| `src/api/auth.ts` | `login`, `logout`, `getCurrentUser` |
| `src/api/fixtures/authSession.ts` | Zod LoginResponse, fixtures |
| `src/auth/AuthProvider.tsx` | Context: session, login, logout, refreshUser |
| `src/auth/authContext.ts` | Types + default context |
| `src/auth/authEvents.ts` | `subscribeAuthChanged`, cross-tab sync |
| `src/auth/sessionStorage.ts` | get/set/clear session, bypass guard |
| `src/auth/useAuth.ts` | Hook для компонентов |
| `src/auth/mockSession.ts` | Deprecated aliases (`isMockAuthenticated` и т.д.) |
| `src/app/ProtectedRoute.tsx` | Redirect `/login` без session |
| `src/app/layout/AuthSlot.tsx` | Sidebar Login/Logout |
| `src/pages/LoginPage.tsx` | Form username/password |
| `src/pages/CabinetPage.tsx` | Placeholder «скоро» |

Точки входа: `AuthProvider` в `main.tsx`; `ProtectedRoute` в `routes.tsx`.

## Публичный интерфейс

| Аспект | Решение |
|--------|---------|
| Login | `POST /api/auth/login` → store `LoginResponse` |
| Logout | `POST /api/auth/logout` + `clearStoredSession` |
| Me | `GET /api/auth/me` on refreshUser |
| Storage key | `monitor-auth-session` (JSON) |
| Bearer | `getSessionToken()` → `Authorization: Bearer` |
| Guard bypass | `VITE_MOCK_AUTH_ENABLED=false` → `isAuthenticated()` always true |
| Protected routes | `/monitoring`, `/deep`, `/support`, `/usage`, `/settings/*`, `/cabinet` |
| Redirect after login | `state.from.pathname` или `/monitoring` |

## Контракты и сущности

| Сущность | Файл | Описание |
|----------|------|----------|
| `LoginResponse` | `authSession.ts` | token, user_id, username, expires_at |
| `AuthUserPublic` | `authSession.ts` | Ответ `/auth/me` |
| `StoredAuthSession` | `sessionStorage.ts` | Persisted session shape |
| `AuthContextValue` | `authContext.ts` | session, isAuthenticated, login, logout |

## Ошибки и коды

| Код | Константа | Условие | Примечание |
|-----|-----------|---------|------------|
| `invalid_credentials` | — | 401 on login | Inline form error |
| `not_authenticated` | — | 401 on REST | Client clears session |
| (transport) | `ApiClientError` | Network on login | Generic form error |

## Заглушки и временное поведение

| Что | Где | Поведение |
|-----|-----|-----------|
| Offline login | `auth.ts` | `authLoginFixture` без base URL; empty creds → 401 |
| Deprecated mock API | `mockSession.ts` | Aliases на sessionStorage |
| Cabinet | `CabinetPage.tsx` | Static «скоро», no API |

## Зависимости

### Модули проекта

- module-0 — `api/client`, AppLayout, Sidebar

### Конфигурация

| Переменная | Назначение | Обязательная |
|------------|------------|--------------|
| `VITE_MOCK_AUTH_ENABLED` | `false`/`0` bypass guard | Нет (default true) |
| `VITE_ANOMALY_API_BASE_URL` | Auth API upstream | Нет (fixtures) |

## Тесты

| Файл | Что проверяет | Уровень |
|------|--------------|---------|
| `tests/unit/auth/LoginPage.test.tsx` | submit, errors, redirect | unit |
| `tests/unit/auth/ProtectedRoute.test.tsx` | guard redirect | unit |
| `tests/unit/auth/sessionStorage.test.ts` | expiry, bypass | unit |
| `tests/unit/auth/authApi.test.ts` | fixtures, parse | unit |
| `tests/unit/auth/AuthSlot.test.tsx` | login/logout UI | unit |
| `tests/unit/auth/routes.test.tsx` | protected paths | unit |
| `tests/e2e/auth.spec.ts` | full login/logout | e2e |

Намеренно не покрыто: token refresh до expires_at (нет backend refresh).

## Как пользоваться

```bash
# E2e без guard
VITE_MOCK_AUTH_ENABLED=false npm run test:e2e
```

```tsx
const { login, logout, isAuthenticated } = useAuth()
await login(username, password)
```

## Наблюдаемость и безопасность

- Token в localStorage (не httpOnly) — ограничение SPA + M19 opaque token
- Пароли не persist; PII — только username в UI
- Token не логировать в prod

## Совместимость и эталоны

- M19 auth в `docs/api.md`; M17 §7.6 UX flow
- Исторический «mock auth» ADR superseded (см. `memory.md`)

## История и миграции

- 2026-07: mock boolean flag → M19 session + Bearer; deprecated exports в `mockSession.ts`
