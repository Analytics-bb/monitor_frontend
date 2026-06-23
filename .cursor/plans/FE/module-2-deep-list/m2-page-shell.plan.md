---
id: m2-page-shell
parent_module: .cursor/plans/FE/module-2-deep-list.plan.md
depends_on:
  - m0-app-layout
  - m0-design-tokens
план читать: "да, §Layout (desktop 1440)"
status: pending
---

# Задача: DeepListPage — shell списка audits

## Что сделать
Заменить placeholder `DeepListPage` на layout: заголовок, слот filter bar, слот table, слот pagination; loading skeleton и empty/error placeholders без данных API.

## Файлы
**Создать:**
- `src/components/deep/index.ts` (barrel)

**Изменить:**
- `src/pages/DeepListPage.tsx`

**Не трогать без явного указания:** `routes.tsx`, `api/deep.ts`, module-3 chat.

## Контракт (если задача создаёт/меняет сущность)
`DeepListPage` — desktop-first контейнер с тремя зонами (filters / table / pagination); `data-testid` или `aria-label` для a11y; skeleton 8 rows на first mount.

## Решения / якоря реализации
- Повторить паттерн: `src/pages/MonitoringPage.tsx` — Card/grid на semantic tokens.
- Обязательно: sticky filter bar под AppLayout header (§Концепция).
- Не делать: fetch, фильтры, таблица с данными.

## Зависимости
- `m0-app-layout` — маршрут `/deep` в `routes.tsx`.
- `m0-design-tokens` — light/dark tokens.

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| N/A на этом шаге | — | smoke в `m2-tests` |

## DoD
- [ ] Layout filter + table + pagination slots
- [ ] Skeleton loading, не один fullscreen spinner
- [ ] Тесты из раздела «Тесты» зелёные
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
