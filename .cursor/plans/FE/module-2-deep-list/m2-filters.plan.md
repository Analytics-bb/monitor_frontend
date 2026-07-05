---
id: m2-filters
parent_module: .cursor/plans/FE/module-2-deep-list.plan.md
depends_on:
  - m2-page-shell
  - m0-api-client
  - m0-mock-samples
  - m0-toast-provider
план читать: "да, §Концепция — панель фильтров; §Публичный API"
status: completed
---

# Задача: DeepCasesFilters + listDeepCases API

## Что сделать
Filter bar: `audit_id` (UUID shortcut → navigate), `gate_id` (digits only), `from`/`to`; URL sync; Apply/Reset; `listDeepCases` в `api/deep.ts` с Zod `parseDeepCaseSummary`; fetch + envelope pagination на странице.

## Файлы
**Создать:**
- `src/components/deep/DeepCasesFilters.tsx`
- `src/api/deep.ts` — `listDeepCases(params)`

**Изменить:**
- `src/pages/DeepListPage.tsx` — wire filters, fetch state, error/retry
- `src/components/deep/index.ts`

**Не трогать без явного указания:** `DeepCasesTable`, chat routes.

## Контракт (если задача создаёт/меняет сущность)
`listDeepCases({ gate_id?, from?, to?, page, page_size })` → `{ items: DeepCaseSummary[], total, page, page_size }` (envelope по OpenAPI M8).

Server query **без** `audit_id` (M8). Полный UUID в поле audit + Apply → `navigate(/deep/{uuid})`.

`DeepCasesFilters`: Apply → refetch `page=1`; Reset → очистка URL; naive MSK dates без TZ-конвертации.

## Решения / якоря реализации
- Повторить паттерн: `src/components/monitoring/GateSelector.tsx` — digits-only input для gate.
- Повторить паттерн: `src/api/monitoring.ts` + fixtures dev fallback.
- Обязательно: `parseDeepCaseSummary` из `src/api/fixtures/deepCaseSummary.ts`.
- Не делать: server-side `audit_id` filter; Combobox gates (нет list API в M17).

## Зависимости
- `m2-page-shell` — слот filter bar.
- `m0-api-client` — `apiGetJson`, error envelope.
- `m0-mock-samples` — `deepCaseSummaryFixture`, list fixture envelope.
- `m0-toast-provider` — toast на API/validation errors.

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| gate_id URL sync | `tests/unit/deep-list/DeepCasesFilters.test.tsx` | `?gate_id=` после Apply |
| audit UUID shortcut | `tests/unit/deep-list/DeepCasesFilters.test.tsx` | navigate `/deep/uuid` |

## DoD
- [ ] `api/deep.ts` + filters wired; URL sync gate/period/page
- [ ] UUID shortcut navigate; invalid audit_id → toast
- [ ] Тесты из раздела «Тесты» зелёные
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
