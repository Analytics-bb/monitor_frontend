---
id: m0-toast-provider
parent_module: .cursor/plans/FE/module-0-index.plan.md
depends_on: [m0-api-client, m0-app-layout]
план читать: "нет"
status: completed
---

# Задача: Toaster + mapApiError

## Что сделать
Установить `sonner`, смонтировать `<Toaster />` в AppLayout, реализовать `mapApiError` → toast с `error_code`.

## Файлы
**Создать:**
- нет

**Изменить:**
- `src/api/errors.ts` (`mapApiError`)
- `src/app/layout/AppLayout.tsx` (`<Toaster />`)
- `package.json` / `package-lock.json` (`sonner`)

**Не трогать без явного указания:** страничные компоненты.

## Контракт (если задача создаёт/меняет сущность)
`mapApiError(error: unknown): void` — показывает toast с `error_code` (и кратким `message`); для `ApiError` — приоритет `error_code`.

## Решения / якоря реализации
- Обязательно: один `<Toaster />` на уровне AppLayout.
- Обязательно: re-export `mapApiError` из `src/api/index.ts`.
- Не делать: inline page errors (на страницах module-1…6).

## Зависимости
- `m0-api-client` — `ApiError`, `parseApiError`.
- `m0-app-layout` — mount point в AppLayout.

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| mapApiError shows code | `tests/unit/apiErrors.test.ts` | mock sonner; `error_code` в description/title |

## DoD
- [ ] sonner установлен; Toaster в AppLayout
- [ ] mapApiError экспортирован и показывает error_code
- [ ] Тесты из раздела «Тесты» зелёные
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
