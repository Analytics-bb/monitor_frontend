---
id: m6-protected-route
parent_module: .cursor/plans/FE/module-6-mock-auth.plan.md
depends_on:
  - m6-auth-storage
план читать: "да, §Ключевые гарантии п.3; §Edge-cases direct URL / localStorage cleared"
status: completed
---

# Задача: ProtectedRoute — guard wrapper

## Что сделать
`ProtectedRoute`: без mock session → `<Navigate to="/login" replace />`; optional save `location` для return URL после login; при `MOCK_AUTH_ENABLED=false` — pass-through children.

## Файлы
**Создать:**
- `src/app/ProtectedRoute.tsx`

**Изменить:**
- N/A (wire в `m6-route-align`)

**Не трогать без явного указания:** `routes.tsx` (следующая задача).

## Контракт (если задача создаёт/меняет сущность)
`ProtectedRoute({ children })` — render children if `isMockAuthenticated()`, else redirect `/login`.

Optional: `state.from` = current pathname+search для post-login redirect (не блокер R2).

## Решения / якоря реализации
- Повторить паттерн: React Router v7 `Navigate` / `useLocation`.
- Обязательно: не вызывать backend auth.
- Не делать: wrap `/login` itself.

## Зависимости
- `m6-auth-storage` — `isMockAuthenticated`, `isMockAuthEnabled`.

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| guarded without session | `tests/unit/auth/ProtectedRoute.test.tsx` | children hidden → redirect /login |
| MOCK_AUTH_ENABLED=false | `tests/unit/auth/ProtectedRoute.test.tsx` | children visible без session |

## DoD
- [ ] ProtectedRoute export + guard logic
- [ ] Bypass при disabled mock auth
- [ ] Тесты из раздела «Тесты» зелёные
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
