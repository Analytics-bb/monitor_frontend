---
name: fe-session-auth
overview: "M19 session auth: POST /api/auth/login, Bearer в api/client, AuthProvider, protected routes, sidebar Login/Logout, /cabinet placeholder. Fixture-mode без API — offline login."
todos:
  - id: m6-auth-storage
    content: "auth/sessionStorage.ts — opaque token + user в localStorage; VITE_MOCK_AUTH_ENABLED bypass guard"
    status: completed
  - id: m6-login-page
    content: "LoginPage: POST login через AuthProvider; invalid_credentials UI; redirect /monitoring или state.from"
    status: completed
  - id: m6-protected-route
    content: "ProtectedRoute wrapper: без session → redirect /login; save return URL"
    status: completed
  - id: m6-sidebar-auth
    content: "AuthSlot: Login link или Logout button; logout POST /api/auth/logout"
    status: completed
  - id: m6-cabinet-page
    content: "CabinetPage: static placeholder «скоро»; protected"
    status: completed
  - id: m6-route-align
    content: "Protected paths: /monitoring, /deep, /support, /usage, /settings/agents, /cabinet"
    status: completed
  - id: m6-tests
    content: "Vitest + e2e: login redirect; guarded route; logout; sessionStorage; auth API fixtures"
    status: completed
isProject: true
---

# FE Module 6 — Session Auth (`/login`, `/cabinet`, guards)

M19 opaque session auth для SPA: login/logout/me, Bearer на REST, guard маршрутов. Контракт — M17 §7.6 + `docs/api.md` § Auth (M19).

**Зависит от:** [module-0-index.plan.md](./module-0-index.plan.md) (layout sidebar slot, `api/client`)

---

## Цель

Обеспечить guard продуктовых маршрутов и login/logout flow с backend M19; в fixture-mode — offline-сессия без upstream API.

---

## Границы

**Входит:**

- `/login` — форма username/password → `POST /api/auth/login` → сохранение `LoginResponse` в localStorage → redirect.
- `AuthProvider` + `useAuth`: login, logout, `refreshUser` (`GET /api/auth/me`).
- Bearer token в `api/client` (`Authorization: Bearer …`); `401 not_authenticated` → clear session.
- Protected routes для `/monitoring`, `/deep`, `/support`, `/usage`, `/settings/agents`, `/cabinet`.
- Sidebar `AuthSlot`: Login / Logout.
- `/cabinet` — static placeholder «скоро», без API.
- Env `VITE_MOCK_AUTH_ENABLED=false` — bypass guard для dev/e2e.

**Не входит:**

- RBAC, roles UI, password reset, OAuth.
- Refresh-token rotation (opaque token до `expires_at`).
- Real user profile editing.

---

## Промпт дизайна (UI)

```
Контекст: light-default ops dashboard (module-0); login — isolated full-screen без sidebar.
Цель: минимальный ops login, не marketing auth UX.

Layout /login:
- Centered card (max-w-sm) on `bg-background`:
  - Logo «BB Anomaly Monitor» + subtitle muted.
  - Form: Логин | Пароль (toggle visibility) | Submit primary full-width.
  - Ошибка invalid_credentials inline (role=alert).
- No registration, no OAuth.

Layout /cabinet:
- Inside AppLayout: empty state «Личный кабинет — скоро».

Sidebar auth slot:
- Logged out: NavLink «Login» → /login.
- Logged in: Button «Logout» → POST logout → clear session → /login.
```

---

## Ключевые гарантии и инварианты

1. **Login** вызывает `POST /api/auth/login`; при fixture-mode (нет base URL) — `authLoginFixture` после проверки non-empty credentials.
2. **Session в localStorage** (`monitor-auth-session`): `token`, `user_id`, `username`, `expires_at`; истёкшая сессия очищается при read.
3. **Protected routes** без session → redirect `/login` с `state.from`.
4. **Logout** — `POST /api/auth/logout` (best-effort) + clear storage → `/login`.
5. **`api/client`** добавляет Bearer; `skipAuth` только для login.
6. **`VITE_MOCK_AUTH_ENABLED=false`** — `isAuthenticated()` always true (e2e bypass).
7. **Токен не логировать** в prod; PII только username в UI.

---

## Edge-cases

| Ситуация | Ожидаемое поведение |
|----------|---------------------|
| Direct URL /monitoring без session | Redirect /login |
| Login success | Redirect `state.from` или `/monitoring` |
| `401 invalid_credentials` | Inline error на форме |
| Logout from any page | `/login` |
| `/login` while authenticated | Redirect away |
| localStorage cleared | Next navigation → /login |
| `GET /me` fails with 401 | clear session, auth changed event |
| `VITE_MOCK_AUTH_ENABLED=false` | All routes open (dev/e2e) |

---

## Схема

```mermaid
flowchart TD
  User --> Login[/login]
  Login -->|POST /auth/login| LS[localStorage session]
  LS --> API[api/client Bearer]
  API --> Pages[Protected pages]
  User --> Protected[ProtectedRoute]
  Protected -->|no session| Login
  Sidebar --> Logout[POST logout + clear]
  Logout --> Login
```

---

## Структура

```
src/
├── api/
│   └── auth.ts                 # login, logout, getCurrentUser
├── auth/
│   ├── AuthProvider.tsx
│   ├── authContext.ts
│   ├── authEvents.ts
│   ├── sessionStorage.ts
│   ├── useAuth.ts
│   └── mockSession.ts          # deprecated aliases
├── app/
│   ├── ProtectedRoute.tsx
│   └── layout/AuthSlot.tsx
├── pages/
│   ├── LoginPage.tsx
│   └── CabinetPage.tsx
tests/
├── unit/auth/
└── e2e/auth.spec.ts
```

---

## Публичный API (client)

| Export | Назначение | Потребитель |
|--------|------------|-------------|
| `login` / `logout` / `getCurrentUser` | M19 REST | AuthProvider |
| `getSessionToken` | Bearer для fetch | `api/client` |
| `isAuthenticated` | Guard check | ProtectedRoute |
| `useAuth` | Context hook | LoginPage, AuthSlot |
| `ProtectedRoute` | Guard wrapper | routes |

Backend: `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`.

---

## Тесты

| Сценарий | Уровень | Критерий |
|----------|---------|----------|
| login redirect | unit/e2e | After submit, URL /monitoring |
| invalid_credentials | unit | Error message visible |
| guarded without session | unit/e2e | /deep → /login |
| logout flow | e2e | Logout → /login |
| sessionStorage expiry | unit | Expired session cleared |
| auth API fixtures | unit | parseLoginResponse, getCurrentUser |
| MOCK_AUTH bypass | unit | Routes open when env false |
| cabinet placeholder | unit | «скоро» when authed |

---

## DoD

- [x] Login/logout flow через M19 API (или fixtures); sidebar slot корректен.
- [x] Bearer на REST; 401 clears session.
- [x] Все protected M17 routes guarded (+ `/support`).
- [x] Cabinet placeholder без API.
- [x] `.env.example` документирует `VITE_MOCK_AUTH_ENABLED`.
- [x] Login уважает light/dark theme (module-0 tokens).
- [x] Тесты проходят; `docs/modules/module-6-mock-auth.md`.

---

## Зависимости

- module-0-index (AppLayout, Sidebar, `api/client`, ThemeProvider)
- M17 §7.6; M19 auth в `docs/api.md`

**Порядок:** после module-0; желательно рано для e2e остальных страниц.

---

## Артефакты

- `api/auth.ts`, `auth/*`, `ProtectedRoute.tsx`, `AuthSlot.tsx`, LoginPage, CabinetPage, routes
- `docs/modules/module-6-mock-auth.md`

---

## Владелец контракта

**Module-6 владеет:** session auth UX, route guards, client-side session storage, Bearer integration в `api/client`.

**Ссылается на:** M19 OpenAPI; M17 §7.6.
