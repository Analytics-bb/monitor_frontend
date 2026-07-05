---
id: m1-page-shell
parent_module: .cursor/plans/FE/module-1-monitoring.plan.md
depends_on:
  - m0-app-layout
  - m0-design-tokens
план читать: "да, §Layout (desktop 1440); §Концепция страницы"
status: completed
---

# Задача: MonitoringPage — grid shell 7 зон

## Что сделать
Заменить placeholder `MonitoringPage` на desktop-first grid (1440px) с семью именованными зонами-заглушками; responsive breakpoints 1024 / mobile без логики данных.

## Файлы
**Создать:**
- `src/components/monitoring/index.ts` (barrel, re-export по мере появления компонентов)

**Изменить:**
- `src/pages/MonitoringPage.tsx`

**Не трогать без явного указания:** `routes.tsx`, API, hooks.

## Контракт (если задача создаёт/меняет сущность)
`MonitoringPage` — контейнер с CSS grid по схеме плана: Status → Gate|Config → Tx|Sr → Charts → Conclusion. Зоны — `data-testid` или `aria-label` для a11y; skeleton-слоты на first mount (без единого fullscreen spinner).

## Решения / якоря реализации
- Повторить паттерн: `src/app/layout/AppLayout.tsx` — semantic tokens, Card из shadcn.
- Обязательно: desktop-first 1440; на `<1024px` — Gate+Config stack, Tx+Sr stack.
- Не делать: polling, API, содержимое зон (только placeholder/skeleton).

## Зависимости
- `m0-app-layout` — маршрут `/monitoring` уже в `routes.tsx`.
- `m0-design-tokens` — токены light/dark, spacing.

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| N/A на этом шаге | — | smoke в `m1-tests` |

## DoD
- [ ] Grid 7 зон по §Layout; breakpoints 1024
- [ ] Skeleton по зонам на mount, не один spinner
- [ ] Тесты из раздела «Тесты» зелёные
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
