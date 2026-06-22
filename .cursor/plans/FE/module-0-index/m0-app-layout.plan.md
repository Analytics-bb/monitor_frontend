---
id: m0-app-layout
parent_module: .cursor/plans/FE/module-0-index.plan.md
depends_on: [m0-design-tokens, m0-theme-toggle]
план читать: "да, §Флоу; маршруты M17"
status: pending
---

# Задача: AppLayout + Sidebar + routes

## Что сделать
Доработать shell: навигация M17, `ThemeToggle` в Sidebar footer, слот Login/Logout (placeholder до module-6), выровнять маршруты `/settings/agents`, `deep/:auditId`.

## Файлы
**Создать:**
- нет

**Изменить:**
- `src/app/layout/AppLayout.tsx`
- `src/app/layout/Sidebar.tsx`
- `src/app/routes.tsx`
- `src/pages/AgentSettingsPage.tsx` (если нужен redirect со старого `/settings`)

**Не трогать без явного указания:** mock auth logic (module-6), Toaster (m0-toast-provider).

## Контракт (если задача создаёт/меняет сущность)
Sidebar nav (M17): `/monitoring`, `/deep`, `/usage`, `/settings/agents`, `/cabinet`, `/login` (link когда logout).

Route param: `deep/:auditId` (переименовать с `caseId`).

Слот auth: `{children}` или prop placeholder — реализация session в module-6.

## Решения / якоря реализации
- Повторить паттерн: `src/app/layout/Sidebar.tsx` — NavLink + active `bg-accent`.
- Обязательно: `ThemeToggle` в footer Sidebar; semantic tokens only.
- Обязательно: `settings` → `settings/agents` (redirect или прямой path).
- Не делать: ProtectedRoute, mock session, sonner.

## Зависимости
- `m0-design-tokens` — semantic UI classes.
- `m0-theme-toggle` — `ThemeToggle` + `ThemeProvider` уже в `main.tsx`.

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| Layout nav links | `tests/unit/Sidebar.test.tsx` | все M17 маршруты в Sidebar |

## DoD
- [ ] AppLayout + Sidebar с ThemeToggle и auth slot placeholder
- [ ] Маршруты `/settings/agents`, `deep/:auditId`
- [ ] Тесты из раздела «Тесты» зелёные
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
