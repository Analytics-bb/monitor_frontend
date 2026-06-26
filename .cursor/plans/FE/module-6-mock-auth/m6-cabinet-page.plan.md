---
id: m6-cabinet-page
parent_module: .cursor/plans/FE/module-6-mock-auth.plan.md
depends_on:
  - m0-app-layout
план читать: "да, §Промпт дизайна — Layout /cabinet"
status: pending
---

# Задача: CabinetPage — placeholder «скоро»

## Что сделать
Заменить placeholder: inside AppLayout empty state — Lucide `UserCircle` + «Личный кабинет — скоро»; без API calls.

## Файлы
**Изменить:**
- `src/pages/CabinetPage.tsx`

**Не трогать без явного указания:** `routes.tsx` (guard в `m6-route-align`).

## Контракт (если задача создаёт/меняет сущность)
Static placeholder only; route `/cabinet` уже в `routes.tsx`.

## Решения / якоря реализации
- Повторить паттерн: empty state из module-0 semantic tokens.
- N/A

## Зависимости
- `m0-app-layout` — page layout context.

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| cabinet placeholder | `tests/unit/auth/CabinetPage.test.tsx` | Text «скоро» visible |

## DoD
- [ ] Placeholder UI без API
- [ ] Тесты из раздела «Тесты» зелёные
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
