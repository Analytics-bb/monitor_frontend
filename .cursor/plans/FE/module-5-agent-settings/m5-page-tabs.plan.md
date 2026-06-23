---
id: m5-page-tabs
parent_module: .cursor/plans/FE/module-5-agent-settings.plan.md
depends_on:
  - m0-app-layout
  - m0-design-tokens
план читать: "да, §Промпт дизайна — Layout; §Ключевые гарантии п.1"
status: pending
---

# Задача: AgentSettingsPage — tabs shell

## Что сделать
Заменить placeholder `AgentSettingsPage` на layout: заголовок «Agent Settings», underline-tabs Instructions | Contexts, слоты для `InstructionsTab` и `ContextsTab` (stub до данных API).

## Файлы
**Создать:**
- `src/components/settings/index.ts` (barrel)

**Изменить:**
- `src/pages/AgentSettingsPage.tsx`

**Не трогать без явного указания:** `api/instructions.ts`, `api/contexts.ts`, `routes.tsx` (маршрут `/settings/agents` уже есть).

## Контракт (если задача создаёт/меняет сущность)
`AgentSettingsPage` — две вкладки без смешивания M6/M15 API; default tab Instructions; tab indicator transition 200ms; loading/empty — в дочерних tab-компонентах.

## Решения / якоря реализации
- Повторить паттерн: `src/pages/MonitoringPage.tsx` — page header + semantic tokens.
- Обязательно: route `/settings/agents` и redirect `/settings` → `/settings/agents` уже в `routes.tsx`.
- Не делать: fetch, CRUD, optimistic mutations.

## Зависимости
- `m0-app-layout` — страница внутри AppLayout.
- `m0-design-tokens` — light/dark tabs и header.

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| N/A на этом шаге | — | smoke в `m5-tests` |

## DoD
- [ ] Header + tabs Instructions | Contexts
- [ ] Stub-слоты для tab content
- [ ] Тесты из раздела «Тесты» зелёные
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
