---
id: m6-route-align
parent_module: .cursor/plans/FE/module-6-mock-auth.plan.md
depends_on:
  - m6-protected-route
  - m6-login-page
план читать: "да, §Границы — protected paths; M17 §7.6"
status: pending
---

# Задача: routes — wrap protected children

## Что сделать
Обернуть `ProtectedRoute` вокруг AppLayout children: `/monitoring`, `/deep`, `/deep/:auditId`, `/usage`, `/settings/agents`, `/cabinet`; `/login` остаётся public; index redirect `/` → `/monitoring` внутри guard.

## Файлы
**Изменить:**
- `src/app/routes.tsx`

**Не трогать без явного указания:** page implementations.

## Контракт (если задача создаёт/меняет сущность)
Protected paths (M17 §7.6): `/monitoring`, `/deep`, `/deep/:auditId`, `/usage`, `/settings/agents`, `/cabinet`.

Public: `/login` only.

## Решения / якоря реализации
- Обязательно: guard на уровне route children под `AppLayout`, не на самом layout wrapper целиком если `/login` снаружи.
- Не делать: backend auth middleware.

## Зависимости
- `m6-protected-route` — wrapper component.
- `m6-login-page` — redirect target после login согласован.

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| guarded without session | `tests/unit/auth/routes.test.tsx` | /deep → /login |

## DoD
- [ ] Все M17 protected routes guarded
- [ ] /login public
- [ ] Тесты из раздела «Тесты» зелёные
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
