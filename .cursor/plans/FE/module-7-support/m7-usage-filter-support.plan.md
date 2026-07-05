---
id: m7-usage-filter-support
parent_module: .cursor/plans/FE/module-7-support.plan.md
depends_on: []
план читать: "нет"
status: completed
---

# Задача: agent_kind=support в usage filters

## Что сделать
Добавить literal `support` в FE usage filters и Zod fixture — deep-link `/usage?agent_kind=support` из SupportHeader работает.

## Файлы
**Изменить:**
- `src/lib/usageFilters.ts` — `AGENT_KINDS`, тип filter
- `src/components/usage/UsageFilters.tsx` — option в select
- `src/api/fixtures/agentUsageRun.ts` — `agent_kind` enum + sample fixture row

**Не трогать без явного указания:** Usage table columns logic.

## Контракт (если задача создаёт/меняет сущность)
`AgentKindFilter` включает `support` (M14). URL parse принимает `?agent_kind=support`.

## Решения / якоря реализации
- Синхрон с `docs/api.md` M14 `agent_kind` literals.
- Не делать: менять primary usage read path (остаётся runs API).

## Зависимости
- N/A (module-4 completed; delta только FE types/UI).

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| URL parse support | `tests/unit/usage/usageFilters.test.ts` | `agent_kind=support` accepted |

## DoD
- [ ] Filter UI + Zod + URL sync
- [ ] Тесты из раздела «Тесты» зелёные
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
