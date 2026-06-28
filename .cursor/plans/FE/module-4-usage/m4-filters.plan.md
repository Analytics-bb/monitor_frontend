---
id: m4-filters
parent_module: .cursor/plans/FE/module-4-usage.plan.md
depends_on: []
план читать: "нет"
status: pending
---

# Задача: UsageFilters + URL sync

## Что сделать
Компонент `UsageFilters`: gate_id, agent_kind (`hypothesis`|`deep`), date range (`from`/`to`), `audit_id` chip; двусторонняя синхронизация с query string (`useSearchParams`).

## Файлы
**Создать:**
- `src/components/usage/UsageFilters.tsx`

**Не трогать без явного указания:** `api/usage.ts`, detail page.

## Контракт (если задача создаёт/меняет сущность)
Props: `value: UsageFiltersState`, `onChange: (next) => void` или controlled via URL hook в родителе — зафиксировать один паттерн в UsagePage (task `m4-runs-table`).

Query keys: `gate_id`, `agent_kind`, `from`, `to`, `audit_id` — совпадают с API list params.

## Решения / якоря реализации
- Повторить паттерн: `src/components/deep/DeepCasesFilters.tsx` — controlled values + URL sync в родителе.
- `audit_id` из M3 link (`/usage?audit_id=`) — предзаполнение при mount.

## Зависимости
N/A — standalone UI; интеграция в UsagePage в `m4-runs-table`.

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| audit_id URL filter | `tests/unit/usage/UsageFilters.test.tsx` | Param parsed and displayed |

## DoD
- [ ] Filters render; URL read/write
- [ ] Тесты из раздела «Тесты» зелёные
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
