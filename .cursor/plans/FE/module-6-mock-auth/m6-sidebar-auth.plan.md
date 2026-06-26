---
id: m6-sidebar-auth
parent_module: .cursor/plans/FE/module-6-mock-auth.plan.md
depends_on:
  - m6-auth-storage
  - m0-app-layout
план читать: "нет"
status: pending
---

# Задача: Sidebar auth slot — Login / Logout

## Что сделать
Wire `authSlot` в `AppLayout` → `Sidebar`: logged out — NavLink «Login»; logged in — ghost Button «Logout» → `clearMockSession()` → navigate `/login`.

## Файлы
**Создать:**
- `src/app/layout/AuthSlot.tsx` (optional thin component)

**Изменить:**
- `src/app/layout/AppLayout.tsx` — передать `authSlot`
- `src/app/layout/Sidebar.tsx` — только если нужны правки beyond existing `authSlot` prop

**Не трогать без явного указания:** nav items, ThemeToggle.

## Контракт (если задача создаёт/меняет сущность)
Один слот внизу sidebar: Login XOR Logout по `isMockAuthenticated()`; re-render on storage change (custom event или state lift в AppLayout).

## Решения / якоря реализации
- Обязательно: `Sidebar` уже имеет `authSlot?: ReactNode` — реализовать consumer, не ломать API.
- Не делать: user profile, avatar.

## Зависимости
- `m6-auth-storage` — session check/clear.
- `m0-app-layout` — AppLayout + Sidebar wiring.

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| logout shows Login | `tests/unit/auth/AuthSlot.test.tsx` | After logout → Login link |

## DoD
- [ ] Login/Logout в одном слоте sidebar
- [ ] Logout → /login
- [ ] Тесты из раздела «Тесты» зелёные
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
