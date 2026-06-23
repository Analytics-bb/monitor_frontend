---
id: m2-pagination
parent_module: .cursor/plans/FE/module-2-deep-list.plan.md
depends_on:
  - m2-filters
план читать: "нет"
status: pending
---

# Задача: DeepCasesPagination — server envelope

## Что сделать
Pagination footer: «Показано X–Y из total», prev/next, page size 20/50; sync `page` и `page_size` в URL; refetch через callback страницы.

## Файлы
**Создать:**
- `src/components/deep/DeepCasesPagination.tsx`

**Изменить:**
- `src/pages/DeepListPage.tsx`
- `src/components/deep/index.ts`

**Не трогать без явного указания:** filter logic, table columns.

## Контракт (если задача создаёт/меняет сущность)
`DeepCasesPagination`: props `{ total, page, pageSize, onPageChange, onPageSizeChange }`.

Server-side pagination only (не client slice). Invalid `page > totalPages` → clamp last page или reset `page=1` (§Edge-cases).

## Решения / якоря реализации
- Обязательно: без flash при смене page (placeholder/skeleton rows или keepPreviousData pattern).
- Не делать: client-side slice массива.

## Зависимости
- `m2-filters` — envelope `total/page/page_size` с fetch.

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| Pagination next/prev | `tests/unit/deep-list/DeepCasesPagination.test.tsx` | page param меняется |

## DoD
- [ ] Prev/next + page size selector wired
- [ ] URL sync `page`, `page_size`
- [ ] Тесты из раздела «Тесты» зелёные
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
