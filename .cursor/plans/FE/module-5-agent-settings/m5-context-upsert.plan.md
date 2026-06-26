---
id: m5-context-upsert
parent_module: .cursor/plans/FE/module-5-agent-settings.plan.md
depends_on:
  - m5-contexts-list
  - m0-api-client
  - m0-toast-provider
план читать: "да, §Флоу — Contexts п.2–3; §Ключевые гарантии п.3–4"
status: pending
---

# Задача: ContextEditor — PUT upsert + DELETE

## Что сделать
Editor: agent_kind, gate_id nullable, content textarea; Save → `PUT /api/agent/contexts` upsert (global `gate_id` null, per-gate explicit); Delete → `DELETE /api/agent/contexts/{context_id}`; mutations не optimistic.

## Файлы
**Создать:**
- `src/components/settings/ContextEditor.tsx`

**Изменить:**
- `src/api/contexts.ts` — `upsertContext(body)`, `deleteContext(id)`
- `src/components/settings/ContextsTab.tsx` — wire editor, create/edit actions

**Не трогать без явного указания:** instructions components.

## Контракт (если задача создаёт/меняет сущность)
`upsertContext({ agent_kind, gate_id | null, key, content })` → PUT upsert.

`deleteContext(context_id)` → DELETE.

Save in progress — disabled button; refetch list после успеха; form preserved при ошибке (базовое поведение, 409 UX — `m5-conflict-handling`).

## Решения / якоря реализации
- Обязательно: global upsert — `gate_id: null`; per-gate — explicit gate_id.
- Обязательно: ждать ответ сервера, без optimistic card removal.
- Не делать: специализированный 409 toast (следующая задача).

## Зависимости
- `m5-contexts-list` — filter state, list refetch.
- `m0-api-client` — `apiPutJson`, `apiDeleteJson`.
- `m0-toast-provider` — generic `mapApiError`.

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| Context PUT roundtrip | `tests/unit/settings/ContextEditor.test.tsx` | Upsert payload matches form |

## DoD
- [ ] Upsert global + per-gate на mock
- [ ] DELETE context wired
- [ ] Тесты из раздела «Тесты» зелёные
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
