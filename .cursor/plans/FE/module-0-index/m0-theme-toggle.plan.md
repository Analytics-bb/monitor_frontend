---
id: m0-theme-toggle
parent_module: .cursor/plans/FE/module-0-index.plan.md
depends_on: [m0-design-tokens]
план читать: "да, §Theme switch"
status: completed
---

# Задача: ThemeProvider + ThemeToggle

## Что сделать
Реализовать переключение light/dark: `ThemeProvider`, sync class `.dark` на `<html>`, persist `localStorage.monitor-theme`, default light, без flash on load.

## Файлы
**Создать:**
- `src/app/providers/ThemeProvider.tsx`
- `src/app/layout/ThemeToggle.tsx`

**Изменить:**
- `src/main.tsx` (обёртка ThemeProvider)
- `index.html` (optional: inline script до paint для anti-flash)

**Не трогать без явного указания:** `Sidebar.tsx` (mount toggle — задача `m0-app-layout`).

## Контракт (если задача создаёт/меняет сущность)
`ThemeProvider`: контекст `{ theme: 'light' | 'dark', setTheme, toggle }`.

Persist key: `monitor-theme`. Первый визит → `light`, игнорировать `prefers-color-scheme`.

## Решения / якоря реализации
- Обязательно: class `.dark` на `document.documentElement`; совместимость с `@custom-variant dark` в `index.css`.
- Обязательно: sync init до первого paint (inline script в `index.html` или синхронный вызов в entry до `createRoot`).
- Иконки: Lucide `Sun` / `Moon` (24×24).
- Не делать: mount toggle в Sidebar (отдаётся `m0-app-layout`).

## Зависимости
- `m0-design-tokens` — CSS-переменные light/dark.

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| Theme toggle | `tests/unit/ThemeProvider.test.tsx` (создать в `m0-tests-shared` или здесь) | default light; toggle → `.dark` + localStorage |

## DoD
- [ ] ThemeProvider экспортирован и смонтирован в `main.tsx`
- [ ] ThemeToggle готов к вставке в Sidebar
- [ ] Persist и anti-flash работают
- [ ] Тесты из раздела «Тесты» зелёные
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
