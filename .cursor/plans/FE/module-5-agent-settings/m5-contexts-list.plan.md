---
id: m5-contexts-list
parent_module: .cursor/plans/FE/module-5-agent-settings.plan.md
depends_on:
  - m5-page-tabs
  - m0-api-client
  - m0-mock-samples
план читать: "да, §Ключевые гарантии п.2–3; §Флоу — Contexts п.1"
status: pending
---

# Задача: ContextsTab — list filtered by agent_kind + gate_id

## Что сделать
Вкладка Contexts: sub-filter row (agent_kind hypothesis/deep, gate select + «Global»); `GET /api/agent/contexts?agent_kind=&gate_id=` → cards (key, preview, scope badge Global/Per-gate); empty state + CTA create.

## Файлы
**Создать:**
- `src/components/settings/ContextsTab.tsx`
- `src/api/contexts.ts` — `listContexts({ agent_kind, gate_id? })`

**Изменить:**
- `src/pages/AgentSettingsPage.tsx` — wire Contexts tab
- `src/components/settings/index.ts`

**Не трогать без явного указания:** `InstructionsTab`, `ContextEditor`.

## Контракт (если задача создаёт/меняет сущность)
`listContexts({ agent_kind, gate_id })` → `AgentContext[]` (Zod parse, OpenAPI M15 `agent_context_store`).

`gate_id` null/omit → global scope filter; hypothesis и deep — отдельные списки, не смешивать.

## Решения / якоря реализации
- Повторить паттерн: `src/components/deep/DeepCasesFilters.tsx` — Select + Apply/refetch on filter change.
- Повторить паттерн: `src/api/deep.ts` + fixtures dev fallback.
- Обязательно: M6 instructions API path не использовать в этой вкладке.
- Не делать: PUT/DELETE upsert (следующая задача).

## Зависимости
- `m5-page-tabs` — tab slot.
- `m0-api-client` — `apiGetJson`, error envelope.
- `m0-mock-samples` — fixture contexts для dev/Vitest.

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| N/A на этом шаге | — | list render в `m5-tests` |

## DoD
- [ ] Filters agent_kind + gate/global wired
- [ ] Context cards + empty state
- [ ] Тесты из раздела «Тесты» зелёные
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
