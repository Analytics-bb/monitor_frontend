---
id: m6-tests
parent_module: .cursor/plans/FE/module-6-mock-auth.plan.md
depends_on:
  - m6-auth-storage
  - m6-login-page
  - m6-protected-route
  - m6-sidebar-auth
  - m6-cabinet-page
  - m6-route-align
план читать: "да, §Тесты; §DoD"
status: completed
---

# Задача: Vitest + e2e — mock auth module

## Что сделать
Unit-тесты по таблице плана; `tests/e2e/auth.spec.ts` — login redirect, guarded route, logout flow.

## Файлы
**Создать:**
- `tests/e2e/auth.spec.ts`

**Изменить:**
- `tests/unit/auth/*.test.ts` — агрегировать coverage из task-файлов

**Не трогать без явного указания:** другие e2e specs.

## Контракт (если задача создаёт/меняет сущность)
N/A

## Решения / якоря реализации
- Повторить паттерн: `tests/e2e/deep-list.spec.ts` — Playwright + fixtures.
- Обязательно: e2e с `MOCK_AUTH_ENABLED=true` (default).
- N/A

## Зависимости
Все `m6-*` задачи выше.

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| login redirect | unit + e2e | After submit, URL /monitoring |
| guarded without session | unit + e2e | /deep → /login |
| logout flow | e2e | Logout → /login; /monitoring blocked |
| cabinet placeholder | unit | Text «скоро» when authed |
| MOCK_AUTH_ENABLED=false | unit | /monitoring без login |

## DoD
- [ ] Все сценарии из §Тесты плана модуля зелёные
- [ ] e2e auth.spec.ts pass
- [ ] DoD родительского плана готов к staging
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
