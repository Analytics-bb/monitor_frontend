---
title: 'FE Module 2 — Deep List'
plan: '.cursor/plans/FE/module-2-deep-list.plan.md'
last_reviewed: '2026-07-05'
---

# Deep List (`/deep`)

## Назначение и границы

За что отвечает: каталог deep audits — фильтры (gate, state, период), server-side pagination, таблица `DeepCaseSummary`, переход в чат по клику на строку. Query-параметры фильтров и страницы синхронизируются с URL.

Что явно не входит: UI чата (`/deep/{audit_id}` — module-3), фильтр/shortcut по `audit_id`, мутации чата, создание cases, bulk/export.

Ссылка на план: `.cursor/plans/FE/module-2-deep-list.plan.md`

## Структура в репозитории

| Путь                                          | Назначение                                                                              |
| --------------------------------------------- | --------------------------------------------------------------------------------------- |
| `src/pages/DeepListPage.tsx`                  | Страница: зоны фильтров / таблицы / pagination, URL sync, navigate в чат                |
| `src/components/deep/DeepCasesFilters.tsx`    | Панель фильтров: gate, state, from/to, Apply/Reset, валидация                           |
| `src/components/deep/DeepCasesTable.tsx`      | Таблица audits: Time, Gate, Event, Conclusion, State                                    |
| `src/components/deep/DeepCasesPagination.tsx` | Footer: summary, prev/next, page size 20/50                                             |
| `src/components/deep/index.ts`                | Barrel export компонентов deep list                                                     |
| `src/api/deep.ts`                             | `listDeepCases` + Zod envelope                                                          |
| `src/api/fixtures/deepCaseSummary.ts`         | `DeepCaseSummary` schema, `deepCaseSummaryFixture`, `deepCasesListFixture` (30 записей) |
| `src/hooks/useDeepCasesList.ts`               | Загрузка списка с `isLoading` / `error` / `refetch`                                     |
| `src/lib/deepCasesFiltersValidation.ts`       | Валидация gate и дат перед Apply                                                        |
| `src/index.css`                               | Класс `.deep-table-scroll` — тонкий scrollbar таблицы                                   |

Точка входа маршрута: `DeepListPage` (React Router `/deep`).

## Публичный интерфейс

| Аспект              | Решение                                                                 |
| ------------------- | ----------------------------------------------------------------------- |
| Маршрут             | `/deep`                                                                 |
| Загрузка данных     | `useDeepCasesList(params)` → `GET /api/deep/cases`                      |
| Dev без API         | `listDeepCases()` — fixture 30 записей, client-side filter + pagination |
| Фильтры в URL       | `gate_id`, `state`, `from`, `to`, `page`, `page_size`                   |
| Apply               | Обновляет URL, сбрасывает `page=1`, refetch                             |
| Reset               | Очищает фильтры, `page=1`, сохраняет `page_size`                        |
| Переход в чат       | `navigate(/deep/{audit_id}, { state: { deepListSearch } })`             |
| Экспорт компонентов | `@/components/deep`                                                     |

## Контракты и сущности

| Сущность                   | Файл                            | Описание                                                                                             |
| -------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `DeepCaseSummary`          | `deepCaseSummary.ts`            | Строка списка: `audit_id`, `gate_id`, `event_summary`, `conclusion`, `deep_chat_state`, `created_at` |
| `deep_chat_state`          | `deepCaseSummary.ts`            | `not_started` \| `active` \| `awaiting_approval` \| `completed` \| `cancelled` \| `error`            |
| `DeepCasesListResponse`    | `deep.ts`                       | `{ items, total, page, page_size }`                                                                  |
| `ListDeepCasesParams`      | `deep.ts`                       | Query: `gate_id?`, `state?`, `from?`, `to?`, `page?`, `page_size?`                                   |
| `DeepCasesFilterValues`    | `DeepCasesFilters.tsx`          | Draft фильтров: gate, state, from, to                                                                |
| `validateDeepCasesFilters` | `deepCasesFiltersValidation.ts` | Gate — только цифры; даты — `yyyy-mm-dd`; `to >= from`                                               |

### Колонки таблицы

| Колонка    | Поле              | Отображение                |
| ---------- | ----------------- | -------------------------- |
| Time       | `created_at`      | Mono, as-is (naive MSK)    |
| Gate       | `gate_id`         | Chip (mono)                |
| Event      | `event_summary`   | Truncate + `title` tooltip |
| Conclusion | `conclusion`      | Truncate + `title` tooltip |
| State      | `deep_chat_state` | `StatusBadge`              |

Заголовки колонок — по центру. Строка кликабельна целиком (`hover:bg-muted/40`, Enter/Space на focus).

## Ошибки и коды

| Код            | Константа        | Условие                        | Примечание                                                    |
| -------------- | ---------------- | ------------------------------ | ------------------------------------------------------------- |
| (транспорт)    | `ApiClientError` | Ошибка `GET /api/deep/cases`   | Inline alert «Не удалось загрузить список deep cases» + Retry |
| (валидация UI) | —                | Невалидный gate/дата при Apply | Сообщение под полем; `onApply` не вызывается                  |
| (валидация UI) | —                | `to < from`                    | Ошибка на поле «To»                                           |

## Заглушки и временное поведение

| Что               | Где                    | Поведение                                                                                           |
| ----------------- | ---------------------- | --------------------------------------------------------------------------------------------------- |
| Список cases      | `deepCasesListFixture` | 30 записей, gates 42/43, все `deep_chat_state` по кругу; dev/Vitest без `VITE_ANOMALY_API_BASE_URL` |
| Filter/pagination | `deep.ts`              | Client-side filter + slice в fixture-режиме                                                         |

## Зависимости

### Модули проекта

- Module 0: `AppLayout`, `StatusBadge`, `api/client`, `mapApiError`, shadcn UI, design tokens
- Module 1: образец digit-only gate input; `ConclusionModal` → `/deep/{audit_id}` (вход в чат вне списка)
- M17 §7.2 — сценарий deep list; M8 OpenAPI — поля `DeepCaseSummary`

### Конфигурация

| Переменная                  | Назначение                             | Обязательная |
| --------------------------- | -------------------------------------- | ------------ |
| `VITE_ANOMALY_API_BASE_URL` | Base URL anomaly-api; пусто → fixtures | Нет (dev)    |

## Тесты

| Файл                                                      | Что проверяет                                                                     | Уровень |
| --------------------------------------------------------- | --------------------------------------------------------------------------------- | ------- |
| `tests/unit/deep-list/DeepCasesFilters.test.tsx`          | Gate digits-only, state onChange, блок Apply при невалидной дате, URL `?gate_id=` | unit    |
| `tests/unit/deep-list/deepCasesFiltersValidation.test.ts` | Gate, даты, диапазон from/to                                                      | unit    |
| `tests/unit/deep-list/DeepCasesTable.test.tsx`            | Rows + StatusBadge, truncate, row click, Enter на `not_started`                   | unit    |
| `tests/unit/deep-list/DeepCasesPagination.test.tsx`       | Prev/next, summary «Показано X–Y из total»                                        | unit    |
| `tests/unit/deep-list/DeepListPage.test.tsx`              | `deepListSearch` в location state при row click                                   | unit    |
| `tests/e2e/deep-list.spec.ts`                             | Загрузка `/deep`, gate filter сужает fixture (20→15 строк)                        | e2e     |

Намеренно не покрыто: визуальный layout viewport/scroll; sticky header таблицы внутри scroll-контейнера; полный e2e pagination next page на staging API.

## Как пользоваться

```bash
# Dev с fixtures (30 audits, pagination)
npm run dev
# открыть http://localhost:5173/deep

# С staging API
VITE_ANOMALY_API_BASE_URL=https://staging.example npm run dev
```

```tsx
import { listDeepCases } from '@/api/deep'

const { items, total } = await listDeepCases({
  gate_id: '42',
  state: 'active',
  from: '2025-07-01',
  to: '2025-07-31',
  page: 1,
  page_size: 20,
})
```

Shareable URL примера: `/deep?gate_id=42&state=active&from=2025-07-01&to=2025-07-31&page=1&page_size=20`

## Наблюдаемость и безопасность

- `audit_id` не отображается в таблице; передаётся только при navigate в чат.
- `gate_id` из URL санитизируется (`replace(/\D/g, '')`) при чтении search params.
- Секреты не в SPA; ошибки API через `mapApiError`, без логирования PII в prod.

## Совместимость и эталоны

- Query `GET /api/deep/cases`: `gate_id`, `state`, `from`, `to`, `page`, `page_size` — без `audit_id` (M8).
- Даты фильтра: naive MSK, формат ввода `yyyy-mm-dd`; без TZ-конвертации на клиенте.
- Layout: страница `h-[calc(100svh-3rem)]`, вертикальный скролл только внутри блока таблицы (`.deep-table-scroll`).
- Отличие от раннего UX-плана: нет колонки Audit, нет chevron, нет фильтра audit_id shortcut.

## История и миграции

- 2026-06: реализован M2 — фильтры gate/state/period с валидацией; таблица 5 колонок; viewport-contained scroll; dev fixture 30 записей; мягкие hover/focus на pagination и полях фильтров.
