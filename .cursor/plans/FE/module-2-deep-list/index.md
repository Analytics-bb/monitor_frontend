# Task-пакет: module-2-deep-list

Родительский план: [module-2-deep-list.plan.md](../module-2-deep-list.plan.md)

**Внешние зависимости (module-0, completed):** `m0-app-layout`, `m0-design-tokens`, `m0-status-badge`, `m0-api-client`, `m0-toast-provider`, `m0-mock-samples`.

**Upstream (module-1, completed):** gate digits input UX; cross-link «Deep analysis →» в `ConclusionModal`.

## Задачи

| id | Содержание | depends_on | Статус |
|----|------------|------------|--------|
| m2-page-shell | DeepListPage layout filter+table+pagination | m0-app-layout, m0-design-tokens | pending |
| m2-filters | Filters + listDeepCases + URL sync | m2-page-shell, m0-api-client, m0-mock-samples, m0-toast-provider | pending |
| m2-cases-table | DeepCasesTable колонки + StatusBadge | m2-page-shell, m2-filters, m0-status-badge | pending |
| m2-pagination | Envelope pagination prev/next + page size | m2-filters | pending |
| m2-row-nav | Row click → /deep/{audit_id} | m2-cases-table | pending |
| m2-tests | Vitest + e2e deep-list | все m2-* выше | pending |

## Граф зависимостей

```mermaid
flowchart TB
  subgraph m0["module-0 (external)"]
    M0AL[m0-app-layout]
    M0DT[m0-design-tokens]
    M0SB[m0-status-badge]
    M0AC[m0-api-client]
    M0TO[m0-toast-provider]
    M0FX[m0-mock-samples]
  end

  PS[m2-page-shell]
  FI[m2-filters]
  TB[m2-cases-table]
  PG[m2-pagination]
  RN[m2-row-nav]
  TS[m2-tests]

  M0AL --> PS
  M0DT --> PS
  PS --> FI
  M0AC --> FI
  M0FX --> FI
  M0TO --> FI
  PS --> TB
  FI --> TB
  M0SB --> TB
  FI --> PG
  TB --> RN
  PS --> TS
  FI --> TS
  TB --> TS
  PG --> TS
  RN --> TS
```

## Параллельность

**Волна 1:**
- `m2-page-shell`

**Волна 2** (после shell):
- `m2-filters`

**Волна 3** (после filters; wire в `DeepListPage.tsx` — последовательно):
- `m2-cases-table`
- `m2-pagination` (можно параллельно с table — разные файлы, но общий parent page)

**Волна 4:**
- `m2-row-nav`

**Финал:**
- `m2-tests`

## Рекомендуемый порядок (последовательный)

1. m2-page-shell  
2. m2-filters  
3. m2-cases-table  
4. m2-pagination  
5. m2-row-nav  
6. m2-tests  
