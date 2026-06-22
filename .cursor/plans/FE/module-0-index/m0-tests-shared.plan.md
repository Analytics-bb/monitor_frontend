---
id: m0-tests-shared
parent_module: .cursor/plans/FE/module-0-index.plan.md
depends_on:
  - m0-design-tokens
  - m0-theme-toggle
  - m0-status-badge
  - m0-app-layout
  - m0-api-client
  - m0-use-polling
план читать: "да, §Тесты"
status: pending
---

# Задача: Shared unit tests (module-0)

## Что сделать
Реализовать и прогнать unit-тесты из плана module-0: usePolling, error envelope, StatusBadge, Sidebar nav, theme toggle.

## Файлы
**Создать:**
- `tests/unit/usePolling.test.ts`
- `tests/unit/StatusBadge.test.tsx`
- `tests/unit/apiErrors.test.ts`
- `tests/unit/Sidebar.test.tsx`
- `tests/unit/ThemeProvider.test.tsx`

**Изменить:**
- `vitest.config.ts` (если нужны aliases/setup)

**Не трогать без явного указания:** e2e, page-level tests module-1…6.

## Контракт (если задача создаёт/меняет сущность)
N/A

## Решения / якоря реализации
- Повторить паттерн: существующий Vitest setup в репо.
- Обязательно: тесты соответствуют таблице §Тесты родительского плана, не расширять scope.
- Не делать: дублировать тесты toast/fixtures если не в §Тесты module-0.

## Зависимости
- Реализации из `depends_on` должны быть завершены.

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| usePolling stop on unmount | `tests/unit/usePolling.test.ts` | no fetch after unmount |
| usePolling interval switch | `tests/unit/usePolling.test.ts` | intervalMs restart |
| usePolling visibility ×2 | `tests/unit/usePolling.test.ts` | hidden doubles interval |
| Error envelope parse | `tests/unit/apiErrors.test.ts` | valid/invalid JSON |
| StatusBadge variants | `tests/unit/StatusBadge.test.tsx` | 8 variants + label |
| Layout nav links | `tests/unit/Sidebar.test.tsx` | M17 routes present |
| Theme toggle | `tests/unit/ThemeProvider.test.tsx` | light default; toggle + localStorage |

## DoD
- [ ] Все тесты из таблицы зелёные
- [ ] `npm run lint && npm run typecheck && npm test` проходят
- [ ] Тесты из раздела «Тесты» зелёные
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
