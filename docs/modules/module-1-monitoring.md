---
title: 'FE Module 1 — Monitoring'
plan: '.cursor/plans/FE/module-1-monitoring.plan.md'
last_reviewed: '2026-07-05'
---

# Monitoring (`/monitoring`)

## Назначение и границы

За что отвечает: live-дашборд последнего тика scheduler — gate, метрики на графиках, config snapshot, TX/SR state, статус подключения, вывод агента (Conclusion). Polling `GET /api/status` с адаптивным интервалом.

Что явно не входит: Deep chat (`/deep/{audit_id}`), Telegram delivery, редактирование `config_snapshot` на сервере, backend-изменения, список gates / `GET /api/gates` (gate вводится вручную).

Ссылка на план: `.cursor/plans/FE/module-1-monitoring.plan.md`

## Структура в репозитории

| Путь                                                | Назначение                                                          |
| --------------------------------------------------- | ------------------------------------------------------------------- |
| `src/pages/MonitoringPage.tsx`                      | Страница: grid зон, `useMonitoringPolling`, Conclusion modal state  |
| `src/components/monitoring/`                        | UI-зоны monitoring (экспорт через `index.ts`)                       |
| `src/components/monitoring/MetricsChartsSlider.tsx` | Carousel из 7 Recharts-графиков                                     |
| `src/components/monitoring/chartTheme.ts`           | Палитра, оси, легенда, курсор tooltip                               |
| `src/components/monitoring/ChartTooltip.tsx`        | Кастомный tooltip Recharts                                          |
| `src/api/monitoring.ts`                             | `getStatus`, `activateGate`                                         |
| `src/api/fixtures/statusResponse.ts`                | Zod `StatusResponse`, хелперы, fixture                              |
| `src/api/fixtures/metricsCharts.ts`                 | `metricsToolsSchema`, `buildMetricsChartSlides`, SQL-tools fixtures |
| `src/hooks/useMonitoringPolling.ts`                 | Polling status: 7s / 2.5s / backoff 503                             |
| `src/hooks/useHiddenChartSeries.ts`                 | Скрытие серий line-графика по клику на легенду                      |
| `src/lib/formatChartTime.ts`                        | Формат меток времени на оси X                                       |

Точка входа маршрута: `MonitoringPage` (React Router `/monitoring`).

## Публичный интерфейс

| Аспект              | Решение                                                                               |
| ------------------- | ------------------------------------------------------------------------------------- |
| Маршрут             | `/monitoring`                                                                         |
| Загрузка данных     | `useMonitoringPolling()` → `GET /api/status`                                          |
| Dev без API         | `getStatus()` возвращает `statusResponseFixture` если нет `VITE_ANOMALY_API_BASE_URL` |
| Смена gate          | `POST /api/gates/{gate_id}/activate` через `GateSelector`                             |
| Графики             | `data.metrics_tools` → `getStatusMetricsChartSlides(data)`                            |
| Экспорт компонентов | `@/components/monitoring` (`MetricsChartSlide`, props панелей)                        |

## Контракты и сущности

| Сущность                      | Файл                | Описание                                                                 |
| ----------------------------- | ------------------- | ------------------------------------------------------------------------ |
| `StatusResponse`              | `statusResponse.ts` | Ответ `GET /api/status`: `event`, `report`, `scheduler`, `metrics_tools` |
| `MetricsTools`                | `metricsCharts.ts`  | 7 SQL-tool наборов (tx, status, errors, users, top IP, success rate)     |
| `MetricsChartSlide`           | `metricsCharts.ts`  | Слайд carousel: `type`, `data`, `series`, опции осей/tooltip             |
| `MetricsChartType`            | `metricsCharts.ts`  | `line` \| `multiLine` \| `dualAxis` \| `bar`                             |
| `MetricsChartSeries`          | `metricsCharts.ts`  | `key`, `label`, `color`, опционально `description`, `yAxisId`            |
| `buildMetricsChartSlides`     | `metricsCharts.ts`  | Сборка 7 слайдов из `MetricsTools`                                       |
| `getStatusMetricsChartSlides` | `statusResponse.ts` | Обёртка над `buildMetricsChartSlides`                                    |

### Слайды графиков (порядок carousel)

1. `tx_24h` — bar, объём транзакций 24ч
2. `tx_status_24h` — multiLine, Approved / Declined
3. `errors_24h` — multiLine, ошибки по кодам (`error_description` в tooltip)
4. `users_tx_buckets_24h` — dualAxis, транзакции (право) / пользователи (лево)
5. `users_tx_buckets_3h_10m` — dualAxis, 10-минутные бакеты
6. `top_ips_tx_details_3h` — horizontal bar, Top IP + customer fields в tooltip
7. `success_rate_by_hour_country_24h` — multiLine, success rate 0–1 по странам

## Ошибки и коды

| Код                         | Константа        | Условие                           | Примечание                                        |
| --------------------------- | ---------------- | --------------------------------- | ------------------------------------------------- |
| `scheduler_not_initialized` | HTTP 503         | Scheduler не готов                | `isDegraded`, backoff 5→15→30 с, `DegradedBanner` |
| `gate_not_found`            | HTTP 404         | `POST .../activate` неверный gate | Toast через `mapApiError`, UI gate без изменений  |
| (транспорт)                 | `ApiClientError` | Сеть / прочие HTTP                | `isStale` на `StatusPanel`                        |

## Заглушки и временное поведение

| Что              | Где                                            | Поведение                                          |
| ---------------- | ---------------------------------------------- | -------------------------------------------------- |
| Status + metrics | `statusResponseFixture`, `metricsToolsFixture` | Dev/Vitest без `VITE_ANOMALY_API_BASE_URL`         |
| `activateGate`   | `monitoring.ts`                                | No-op в dev без base URL                           |
| Gate list        | —                                              | Нет `GET /api/gates`; только ручной ввод `gate_id` |

## Зависимости

### Модули проекта

- Module 0: layout, `StatusBadge`, `usePolling`, `api/client`, `mapApiError`, shadcn UI, design tokens
- M17 §7.1 — сценарий monitoring; OpenAPI — поля JSON

### Конфигурация

| Переменная                  | Назначение                             | Обязательная |
| --------------------------- | -------------------------------------- | ------------ |
| `VITE_ANOMALY_API_BASE_URL` | Base URL anomaly-api; пусто → fixtures | Нет (dev)    |

## Тесты

| Файл                                                  | Что проверяет                              | Уровень |
| ----------------------------------------------------- | ------------------------------------------ | ------- |
| `tests/unit/monitoring/StatusPanel.test.tsx`          | Live / stale / degraded                    | unit    |
| `tests/unit/monitoring/useMonitoringPolling.test.tsx` | Интервалы, 503 backoff                     | unit    |
| `tests/unit/monitoring/GateSelector.test.tsx`         | Activate, 404 toast                        | unit    |
| `tests/unit/monitoring/ConfigSnapshotPanel.test.tsx`  | Accordion, copy                            | unit    |
| `tests/unit/monitoring/TxStatePanel.test.tsx`         | TX / SR empty и данные                     | unit    |
| `tests/unit/monitoring/DegradedBanner.test.tsx`       | Видимость баннера                          | unit    |
| `tests/unit/monitoring/ConclusionModal.test.tsx`      | Panel + modal expand/Esc                   | unit    |
| `tests/unit/monitoring/MetricsChartsSlider.test.tsx`  | Carousel, смена слайда                     | unit    |
| `tests/unit/monitoring/metricsCharts.test.ts`         | 7 слайдов, fixtures, оси, descriptions     | unit    |
| `tests/unit/hooks/useHiddenChartSeries.test.ts`       | Toggle легенды, reset                      | unit    |
| `tests/e2e/monitoring.spec.ts`                        | Загрузка `/monitoring`, status, conclusion | e2e     |

Намеренно не покрыто: визуальный рендер Recharts в jsdom (легенда/tooltip — через unit хуков и fixtures); полный e2e tick update на staging.

## Как пользоваться

```bash
# Dev с fixtures (без API)
npm run dev
# открыть http://localhost:5173/monitoring

# С staging API
VITE_ANOMALY_API_BASE_URL=https://staging.example npm run dev
```

```tsx
import { MetricsChartsSlider } from '@/components/monitoring'
import { metricsChartSlidesFixture } from '@/api/fixtures/metricsCharts'
;<MetricsChartsSlider metricsCharts={metricsChartSlidesFixture} />
```

## Наблюдаемость и безопасность

- PII в tooltip Top IP (email, карта) — только из API/fixture; не логировать в prod.
- Секреты не в SPA; polling только публичный status endpoint.
- Datetime: naive MSK as-is из API (`formatChartTimeBucket` для оси X графиков).

## Совместимость и эталоны

- Поля `metrics_tools` и вложенные SQL-ряды — контракт FE-side Zod; при расхождении с OpenAPI — править схему и маппер, затем план.
- Графики: Recharts 2.x; `YAxis` на `multiLine` обязан иметь `yAxisId="left"` (совпадает с `Line`).
- Success rate в слайде: доли 0–1 (сырой `% / 100` при сборке слайда).

## История и миграции

- 2026-06: графики переведены с placeholder на 7 слайдов из `metrics_tools`; carousel под Gate; легенда toggle; tooltip с `error_description`; фикс оси Y (`yAxisId="left"`).
