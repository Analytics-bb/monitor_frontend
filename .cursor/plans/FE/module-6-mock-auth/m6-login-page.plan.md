---
id: m6-login-page
parent_module: .cursor/plans/FE/module-6-mock-auth.plan.md
depends_on:
  - m6-auth-storage
  - m0-design-tokens
  - m0-theme-toggle
план читать: "да, §Промпт дизайна — Layout /login; §Edge-cases login success"
status: pending
---

# Задача: LoginPage — mock form + redirect

## Что сделать
Заменить placeholder: centered card, Email + Password (любые значения), Submit → `setMockSession()` → navigate `/monitoring`; full-screen без sidebar; уважает `monitor-theme` из localStorage.

## Файлы
**Создать:**
- N/A (page exists)

**Изменить:**
- `src/pages/LoginPage.tsx`

**Не трогать без явного указания:** `ProtectedRoute`, `routes.tsx`.

## Контракт (если задача создаёт/меняет сущность)
`LoginPage` — no API; submit on Enter; footer «R2 mock auth — любые данные»; optional redirect `/monitoring` если уже authed.

## Решения / якоря реализации
- Повторить паттерн: shadcn `Card`, `Input`, `Button`, `Label`.
- Обязательно: redirect target `/monitoring` (не `/`).
- Не делать: validation, registration, OAuth.

## Зависимости
- `m6-auth-storage` — `setMockSession`, `isMockAuthenticated`.
- `m0-design-tokens`, `m0-theme-toggle` — light/dark на isolated page.

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| login redirect | `tests/unit/auth/LoginPage.test.tsx` | After submit → `/monitoring` |

## DoD
- [ ] Form submit sets session + redirect
- [ ] Theme tokens на login page
- [ ] Тесты из раздела «Тесты» зелёные
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
