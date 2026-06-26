---
name: fe-mock-auth
overview: "Mock auth R2: /login (any credentials → localStorage → /monitoring), protected routes guard, sidebar Login/Logout, /cabinet placeholder."
todos:
  - id: m6-auth-storage
    content: auth/mockSession.ts — get/set/clear mock flag; MOCK_AUTH_ENABLED env
    status: completed
  - id: m6-login-page
    content: "LoginPage: форма без API; submit → set session → redirect /monitoring"
    status: completed
  - id: m6-protected-route
    content: "ProtectedRoute wrapper: без session → redirect /login; save return URL optional"
    status: completed
  - id: m6-sidebar-auth
    content: "Sidebar: Login link или Logout button в одном слоте"
    status: completed
  - id: m6-cabinet-page
    content: "CabinetPage: static placeholder «скоро»; protected"
    status: completed
  - id: m6-route-align
    content: "Protected paths: /monitoring, /deep, /usage, /settings/agents, /cabinet"
    status: completed
  - id: m6-tests
    content: "Vitest + e2e: login redirect; guarded route without session; logout flow"
    status: pending
isProject: false
---

# FE Module 6 — Mock Auth (`/login`, `/cabinet`, guards)

Client-side mock authentication для R2 без backend JWT. Контракт — M17 §7.6; ADR memory.md 2026-06-22.

**Зависит от:** [module-0-index.plan.md](./module-0-index.plan.md) (layout sidebar slot)

---

## Цель

Обеспечить guard продуктовых маршрутов и mock login/logout flow в sidebar до появления реального auth в R2+.

---

## Границы

**Входит:**

- `/login` — форма, любые credentials → mock session → redirect `/monitoring`.
- Protected routes wrapper для `/monitoring`, `/deep`, `/usage`, `/settings/agents`, `/cabinet`.
- Sidebar: один слот Login / Logout.
- `/cabinet` — static placeholder «скоро», без API.
- Env `MOCK_AUTH_ENABLED` (default true R2).

**Не входит:**

- Backend auth endpoints, JWT, refresh tokens.
- RBAC, roles, password validation.
- Real user profile API.

---

## Промпт дизайна (UI)

```
Контекст: light-default ops dashboard (module-0); login — isolated full-screen без sidebar, уважает `monitor-theme` из localStorage.
Цель: минимальный mock gate, не продуктовый auth UX.

Layout /login:
- Centered card (max-w-sm) on `bg-background`:
  - Logo text «BB Anomaly Monitor» + subtitle muted.
  - Form: Email input (any text) | Password input (any) | Submit primary full-width.
  - Footer muted: «R2 mock auth — любые данные».
- No registration, no forgot password, no OAuth.

Layout /cabinet:
- Inside AppLayout: centered empty state icon Lucide UserCircle + «Личный кабинет — скоро».

Sidebar auth slot (bottom):
- If logged out: NavLink «Login» → /login.
- If logged in: Button ghost «Logout» → clear session → /login.

Компоненты: Card, Input, Button, Label.
Анимации: card fade-in 200ms on login mount only.
A11y: form labels; submit on Enter.
Out of scope: 2FA, password strength meter.
```

---

## Ключевые гарантии и инварианты

1. **Любые credentials** на login → success (mock).
2. **Session в localStorage** (или sessionStorage — одно решение в task); не httpOnly cookie (нет backend).
3. **Protected routes** без session → redirect `/login`.
4. **Logout** clear flag → `/login`.
5. **Не вызывать** backend auth API.
6. **MOCK_AUTH_ENABLED=false** — bypass guard для dev/e2e (document in .env.example).
7. **Секреты не хранить** — только boolean mock flag.

---

## Edge-cases

| Ситуация | Ожидаемое поведение |
|----------|---------------------|
| Direct URL /monitoring без session | Redirect /login |
| Login success | Redirect /monitoring (not /) |
| Logout from any page | /login |
| /login while authenticated | Optional redirect /monitoring |
| localStorage cleared externally | Next navigation → /login |
| MOCK_AUTH_ENABLED=false | All routes open (dev only) |

---

## Схема

```mermaid
flowchart TD
  User --> Login[/login]
  Login -->|submit| LS[localStorage mock flag]
  LS --> Mon[/monitoring]
  User --> Protected[Protected routes]
  Protected -->|no flag| Login
  Protected -->|has flag| Pages[App pages]
  Sidebar --> Logout[clear flag]
  Logout --> Login
```

---

## Флоу (клиент-only)

1. User opens `/monitoring` without session → redirect `/login`.
2. Submit login form → set mock flag → navigate `/monitoring`.
3. Sidebar shows Logout.
4. User clicks Logout → clear flag → `/login`.
5. `/cabinet` accessible only with session; shows placeholder.

---

## Структура

```
src/
├── auth/
│   └── mockSession.ts
├── app/
│   ├── ProtectedRoute.tsx
│   └── routes.tsx              # wrap protected children
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
| `isMockAuthenticated()` | Check session | ProtectedRoute, Sidebar |
| `setMockSession()` | Login success | LoginPage |
| `clearMockSession()` | Logout | Sidebar |
| `ProtectedRoute` | Guard wrapper | routes |

Backend API: **none**.

---

## Тесты

| Сценарий | Уровень | Критерий |
|----------|---------|----------|
| login redirect | unit/e2e | After submit, URL /monitoring |
| guarded without session | unit/e2e | /deep → /login |
| logout flow | e2e | Logout → /login; /monitoring blocked |
| cabinet placeholder | unit | Text «скоро» visible when authed |
| MOCK_AUTH_ENABLED=false | unit | /monitoring accessible without login |

---

## DoD

- [ ] Login/logout flow работает; sidebar slot корректен.
- [ ] Все protected M17 routes guarded.
- [ ] Cabinet placeholder без API.
- [ ] `.env.example` документирует MOCK_AUTH_ENABLED.
- [ ] Login уважает light/dark theme (module-0 tokens).
- [ ] Тесты проходят; M17 §9.2 mock login/logout готов.

---

## Зависимости

- module-0-index (AppLayout, Sidebar, ThemeProvider)
- M17 §7.6; ADR mock auth

**Порядок:** может идти параллельно с module-1 после index; желательно рано для e2e остальных страниц.

---

## Артефакты

- `auth/mockSession.ts`, `ProtectedRoute.tsx`, обновлённые LoginPage, CabinetPage, routes, Sidebar

---

## Владелец контракта

**Module-6 владеет:** mock auth UX и route guards R2.

**Ссылается на:** M17 §7.6; не дублирует backend auth.
