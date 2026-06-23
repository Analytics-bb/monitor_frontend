---
name: fe-monitoring
overview: "Страница /monitoring: live-дашборд последнего тика — status, gate, config_snapshot, tx/sr state, графики (slider), Conclusion с expand-modal; polling GET /status."
todos:
  - id: m1-page-shell
    content: "MonitoringPage: grid layout §Концепция страницы — 7 зон; responsive desktop-first 1440"
    status: completed
  - id: m1-status-panel
    content: "StatusPanel: активность подключения, last_tick_at, last_status, tick_in_progress, pulse + StatusBadge"
    status: completed
  - id: m1-gate-selector
    content: "GateSelector: gate_id + имя; список gates; POST activate с confirm; refetch status"
    status: completed
  - id: m1-config-snapshot
    content: "ConfigSnapshotPanel: интерактивный просмотр config_snapshot (tree/accordion, copy field)"
    status: completed
  - id: m1-state-panels
    content: "TxStatePanel + SrStatePanel: структурированный вывод tx_state / sr_state из status"
    status: completed
  - id: m1-charts-slider
    content: "MetricsChartsSlider: несколько графиков, переключение Carousel/Slider; данные из status или §API"
    status: completed
  - id: m1-conclusion-modal
    content: "ConclusionPanel + ConclusionModal: превью в карточке; expand → Dialog overlay + backdrop; collapse обратно"
    status: completed
  - id: m1-status-polling
    content: "usePolling GET /status: 5-10s штатно, 2-3s при tick_in_progress, backoff при 503"
    status: completed
  - id: m1-degraded-banner
    content: Баннер scheduler_not_initialized (503) и empty state «ожидание первого тика»
    status: completed
  - id: m1-tests
    content: "Vitest: state panels render; conclusion expand/collapse modal; polling interval; gate activate 404"
    status: completed
isProject: false
---

# FE Module 1 — Monitoring (`/monitoring`)

Live-дашборд оператора: снимок последнего тика scheduler и контекст pipeline. Контракт сценария — M17 §7.1; polling — §10.s.

**Зависит от:** [module-0-index.plan.md](./module-0-index.plan.md)

---

## Цель

Дать оператору единый экран «что происходит прямо сейчас»: статус подключения и тика, активный gate, config snapshot, состояния tx/sr, метрики на графиках и вывод агента (Conclusion) — без перехода на другие страницы.

---

## Границы

**Входит:**

- Страница `/monitoring` с polling `GET /api/status`.
- Семь UI-зон (см. §Концепция страницы).
- Active gate: `GET /api/gates/active`, список gates; `POST /api/gates/{gate_id}/activate` с confirm-dialog.
- `config_snapshot`, `tx_state`, `sr_state`, `conclusion` (и поля графиков) — из `GET /api/status` или связанных GET по M17 §10.y / OpenAPI.
- Conclusion: inline-превью + полноэкранный modal overlay (затемнённый backdrop).
- Edge-cases: 503, empty first tick, skipped/error report, длинный conclusion.

**Не входит:**

- Deep chat (module-3); ссылка «Deep analysis →» опциональна в Conclusion modal.
- Telegram delivery status.
- Редактирование `config_snapshot` на сервере (только просмотр/интеракция в UI, если нет POST в контракте).
- Backend изменения.

---

## Концепция страницы (апрув UX)

Один экран, desktop-first (1440px). Токены и light/dark — из module-0. Все зоны обновляются diff при polling, без blink всей страницы.

### 1. Status (подключение и последний тик)

Компактная полоса вверху страницы.

| Элемент | Источник | Поведение |
|---------|----------|-----------|
| Индикатор подключения | polling alive / last successful fetch | `Live` — dot success token (module-0 §операционные); `Stale` — muted; 503 — accent-warn |
| `last_tick_at` | `GET /status` | JetBrains Mono, naive MSK as-is |
| `last_status` | `GET /status` | `StatusBadge` |
| `tick_in_progress` | `GET /status` | Violet pulse dot (module-0); ускоренный polling 2–3 с |
| Manual refresh | — | Кнопка справа; немедленный refetch без сброса interval |

### 2. Gate (номер и имя) — интерактивная

Карточка вверху страницы (первая зона).

- Показывает `gate_id` (номер) + human-readable имя из `event.gate_name`.
- Интерактив: поле ввода только цифр + кнопка «Активировать».
- Смена gate: `POST /api/gates/{gate_id}/activate` (без confirm-dialog) → `onActivated` / refetch status.
- Fail 404 → toast `gate_not_found` через `mapApiError`; UI gate не менять.
- Пустой ввод или тот же `gate_id` — submit игнорируется.

### 3. Config snapshot — интерактивная

Карточка справа от Gate (или на всю ширину под Status на узком viewport).

- Данные: `config_snapshot` из последнего status response.
- Интерактивность: accordion/tree по ключам; expand/collapse секций; copy-to-clipboard на поле; поиск по ключу (optional).
- Длинные значения: truncate в свёрнутом виде, expand inline внутри панели.
- Read-only, если контракт не предусматривает PATCH.

### 4. TX state

Отдельная карточка: структурированный вывод `tx_state` (key-value grid или nested list).

- Заголовок «TX state»; пустое состояние — muted «Нет данных».
- Числа — `tabular-nums`, mono.

### 5. SR state

Аналогично TX: карточка `sr_state`, тот же паттерн отображения.

- TX и SR — в одном ряду 50/50 на desktop; stack на &lt;1024px.

### 6. Графики — carousel из 7 слайдов (Recharts)

Зона под Gate; данные из `status.metrics_tools` → `buildMetricsChartSlides`.

**Источник:** поле `metrics_tools` в `GET /api/status` (Zod `metricsToolsSchema` в `src/api/fixtures/metricsCharts.ts`). Маппер `getStatusMetricsChartSlides` / `buildMetricsChartSlides` собирает слайды; пустые (`data.length === 0`) отфильтровываются.

**7 слайдов (порядок):**

| # | key | title | type |
|---|-----|-------|------|
| 1 | `tx_24h` | Объём транзакций (24ч) | `bar` |
| 2 | `tx_status_24h` | Approved / Declined (24ч) | `multiLine` |
| 3 | `errors_24h` | Ошибки по кодам (24ч) | `multiLine` |
| 4 | `users_tx_buckets_24h` | Транзакции и пользователи (24ч) | `dualAxis` |
| 5 | `users_tx_buckets_3h_10m` | Транзакции и пользователи (3ч / 10м) | `dualAxis` |
| 6 | `top_ips_tx_details_3h` | Top IP (3ч) | `bar` (horizontal) |
| 7 | `success_rate_by_hour_country_24h` | Success rate по странам (24ч) | `multiLine` |

**UI (`MetricsChartsSlider`):**

- Навигация: кнопки «Предыдущий / Следующий», индикатор `N/7`.
- Библиотека: **Recharts** (`LineChart`, `BarChart`, `ResponsiveContainer`).
- Стили: `chartTheme.ts` (палитра Plotly/GitHub dark, оси, легенда, tooltip, курсор).
- Оси: левая Y + нижняя X (время); `dualAxis` — правая Y для транзакций, левая для пользователей; без горизонтальной сетки.
- `multiLine` / `dualAxis`: `YAxis yAxisId="left"` (обязательно совпадает с `Line yAxisId`); тики Y — `tickCount: 5`, `allowDecimals: false` (кроме success rate).
- Tooltip: `ChartTooltipContent`; для ошибок — `{code} : {cnt} — {error_description}`; нулевые серии в tooltip скрыты; Top IP — доп. поля (`TOP_IP_TOOLTIP_FIELDS`).
- Легенда (`multiLine`, `dualAxis`): клик скрывает/показывает серию (`useHiddenChartSeries`); сброс при смене слайда.
- Вертикальный курсор hover: `CHART_TOOLTIP_CURSOR` (цвет как у осей).
- Нет данных → placeholder «Нет данных для графиков».

**Fixtures (dev / Vitest):** `metricsToolsFixture`, `metricsChartSlidesFixture`; 24-часовые ряды — 24 точки; коды ошибок — `942405`, `950952`, `1015`, `947167`, `942427` с `error_description`.

### 7. Conclusion (вывод агента) — expand / collapse

Карточка внизу (или правая колонка на ultra-wide).

**Свёрнутое (default на странице):**

- Заголовок «Conclusion» + `StatusBadge` отчёта.
- Превью текста: truncate ~6–8 строк (`line-clamp`); scroll внутри карточки при overflow.
- Кнопка «Развернуть» / icon `Maximize2`.

**Развёрнутое (modal):**

- `Dialog` (shadcn) на весь viewport: `max-w-4xl` или `90vw`, `max-h-[85vh]`, scroll body.
- Backdrop: `bg-background/80` + backdrop-blur лёгкий; клик по backdrop **не** закрывает (только явная «Свернуть» / Esc) — чтобы не потерять контекст случайно.
- Полный текст conclusion; блок `report.error` для skipped/error.
- Кнопка «Свернуть» / `Minimize2` → возврат к inline-карточке без потери scroll position страницы.
- Optional: ссылка «Deep analysis →» на `/deep/{audit_id}` если `audit_id` есть в status.

---

## Layout (desktop 1440)

Фактический порядок зон в `MonitoringPage.tsx`:

```
┌─────────────────────────────────────────────────────────────┐
│ GateSelector — gate_id + имя; ввод номера + Активировать    │
├─────────────────────────────────────────────────────────────┤
│ MetricsChartsSlider — [ ◀ ] Chart N/7 [ ▶ ]                 │
├─────────────────────────────────────────────────────────────┤
│ DegradedBanner (503, условно)                               │
├──────────────────────────┬──────────────────────────────────┤
│ ConfigSnapshotPanel      │ StatusPanel                      │
├──────────────────────────┴──────────────────────────────────┤
│ TxStatePanel              │ SrStatePanel                    │
├─────────────────────────────────────────────────────────────┤
│ ConclusionPanel — preview … [Развернуть]                    │
└─────────────────────────────────────────────────────────────┘
        ConclusionModal (overlay при expand)
```

Breakpoints: `lg` — Config/Status и TX/SR в 2 колонки; иначе stack.

---

## Промпт дизайна (UI)

```
Контекст: light-default ops dashboard, токены module-0 (violet primary, semantic surfaces).
Цель: оператор видит live snapshot последнего тика в 7 зонах без перегрузки.

Компоненты: Card, Select, Accordion, Carousel, Dialog, StatusBadge, Button, sonner.
Шрифты: Inter UI; timestamps/числа — JetBrains Mono tabular-nums.

Состояния:
- First mount: skeleton по зонам (не один spinner на весь экран).
- Empty (last_tick_at null): StatusPanel + empty copy в Conclusion/графиках.
- 503: amber DegradedBanner под StatusPanel; retry indicator.
- tick_in_progress: pulse на StatusPanel.
- Conclusion modal: focus trap, Esc закрывает, aria-labelledby.

Анимации: 150–200ms colors/opacity; prefers-reduced-motion — без pulse/carousel autoplay.
A11y: каждая Card с aria-label; gate select — keyboard; modal — role=dialog.
```

---

## Ключевые гарантии и инварианты

1. **Live snapshot:** страница = последний тик; не путать с deep chat snapshot (M17 инвариант 2).
2. **Polling:** 5–10 с штатно; 2–3 с при `tick_in_progress=true`; stop on unmount.
3. **503:** exponential backoff 5s → 15s → 30s; баннер degraded, зоны с last good data или placeholders.
4. **Datetime:** naive MSK as-is из API.
5. **skipped/error:** Conclusion пуст или краток; `report.error` виден в ConclusionPanel и modal.
6. **Длинный conclusion:** truncate в карточке; полный текст только в modal.
7. **Gate activate:** confirm → POST → refetch; 404 → toast, UI без изменений.
8. **Тема:** все зоны на semantic tokens; графики и modal корректны в light и dark.

---

## Edge-cases

| Ситуация | Ожидаемое поведение |
|----------|---------------------|
| `GET /status` 503 `scheduler_not_initialized` | DegradedBanner; StatusPanel «Stale»/degraded |
| Пустой тик, `last_tick_at: null` | Empty state в Conclusion и графиках |
| `report.status=skipped` / `error` | StatusBadge + error в Conclusion |
| Длинный `conclusion` | line-clamp в карточке; modal — full scroll |
| `config_snapshot` null / {} | Config panel: «Нет snapshot» |
| `tx_state` / `sr_state` отсутствуют | Muted empty в соответствующей карточке |
| Нет series для графиков | Placeholder slide в carousel |
| `POST /gates/{id}/activate` 404 | Toast `gate_not_found` |
| Tab hidden | Polling ×2 (usePolling) |
| Modal open + новый poll | Обновить conclusion в modal если тот же audit; иначе badge «обновлено» |
| Network fail | StatusPanel stale; Retry на уровне страницы |

---

## Схема

```mermaid
flowchart TB
  MP[MonitoringPage]
  MP --> SP[StatusPanel]
  MP --> GS[GateSelector]
  MP --> CS[ConfigSnapshotPanel]
  MP --> TX[TxStatePanel]
  MP --> SR[SrStatePanel]
  MP --> CH[MetricsChartsSlider]
  MP --> CP[ConclusionPanel]
  CP --> CM[ConclusionModal]
  MP --> Poll[usePolling]
  Poll --> Status[GET /api/status]
  GS --> Gates[GET /api/gates/active + list]
  GS --> Activate[POST /api/gates/id/activate]
```

---

## Флоу (клиент ↔ сервер)

1. Mount: `GET /api/gates/active` + список gates → GateSelector.
2. Start polling `GET /api/status` (interval §10.s).
3. Распределить поля response по зонам: status → StatusPanel; `config_snapshot` → Config; `tx_state` / `sr_state` → state panels; chart series → Carousel; `conclusion` / report → ConclusionPanel.
4. Оператор меняет gate → confirm → POST activate → refetch.
5. Оператор «Развернуть» Conclusion → ConclusionModal; «Свернуть» / Esc → inline card.
6. Оператор листает графики → локальный state слайда, без refetch.
7. Unmount: stop polling; закрыть modal если открыт.

---

## Структура

```
src/
├── pages/
│   └── MonitoringPage.tsx
├── components/
│   └── monitoring/
│       ├── StatusPanel.tsx
│       ├── GateSelector.tsx
│       ├── ConfigSnapshotPanel.tsx
│       ├── TxStatePanel.tsx          # TxStatePanel + SrStatePanel
│       ├── MetricsChartsSlider.tsx
│       ├── ChartTooltip.tsx
│       ├── chartTheme.ts
│       ├── ConclusionPanel.tsx
│       ├── ConclusionModal.tsx
│       ├── ConclusionHeader.tsx
│       ├── ConclusionScrollArea.tsx
│       ├── AgentConclusionContent.tsx
│       ├── DegradedBanner.tsx
│       └── index.ts
├── api/
│   ├── monitoring.ts               # getStatus, activateGate
│   └── fixtures/
│       ├── metricsCharts.ts        # metricsToolsSchema, buildMetricsChartSlides, fixtures
│       └── statusResponse.ts       # statusResponseSchema, getStatusMetricsChartSlides
├── hooks/
│   ├── useMonitoringPolling.ts
│   └── useHiddenChartSeries.ts     # toggle серий по легенде
└── lib/
    └── formatChartTime.ts
tests/
├── unit/monitoring/
│   ├── StatusPanel.test.tsx
│   ├── ConclusionModal.test.tsx
│   ├── GateSelector.test.tsx
│   ├── useMonitoringPolling.test.ts
│   ├── TxStatePanel.test.tsx
│   ├── ConfigSnapshotPanel.test.tsx
│   ├── DegradedBanner.test.tsx
│   ├── MetricsChartsSlider.test.tsx
│   └── metricsCharts.test.ts
├── unit/hooks/
│   └── useHiddenChartSeries.test.ts
└── e2e/monitoring.spec.ts
```

---

## Публичный API

| HTTP (M17 §10.y) | Назначение UI | Зона |
|------------------|---------------|------|
| `GET /api/status` | Scheduler snapshot + `event` + `report` + `metrics_tools` | Все зоны |
| `POST /api/gates/{gate_id}/activate` | Смена gate | GateSelector |

Поля status: `event.config_snapshot`, `event.tx_state`, `event.sr_state`, `report.conclusion`, `metrics_tools` — Zod в `statusResponse.ts` / `metricsCharts.ts`; FE не дублирует OpenAPI-схемы вне парсинга.

---

## Тесты

| Сценарий | Уровень | Критерий |
|----------|---------|----------|
| StatusPanel live/stale | unit | Успешный poll → Live; ошибка → Stale |
| tick_in_progress pulse | unit | Pulse dot при true |
| GateSelector activate 404 | unit | Toast; gate не меняется |
| ConfigSnapshot expand | unit | Accordion; copy field |
| Tx/Sr empty | unit | Muted placeholder без crash |
| Charts carousel | unit | Next/prev меняет `data-chart-key` |
| Charts legend toggle | unit | `useHiddenChartSeries` hide/show + reset на смене слайда |
| metricsCharts fixtures | unit | 7 слайдов, 24h points, error descriptions, y-axis config |
| Conclusion truncate | unit | scroll area в panel |
| Conclusion modal | unit | Expand → dialog; Esc закрывает |
| polling interval switch | unit | tick_in_progress → 2.5s; 503 → backoff |
| 503 banner | unit | DegradedBanner visible |
| e2e page load | e2e | `/monitoring` — page, status, conclusion preview |

---

## DoD

- [x] `/monitoring` рендерит 7 зон (фактический порядок — §Layout).
- [x] Polling с ускорением при `tick_in_progress`; stop on unmount.
- [x] GateSelector: активация gate и обработка 404.
- [x] Conclusion: превью + modal expand/collapse.
- [x] Графики: carousel 7 слайдов Recharts, легенда, tooltip, оси Y.
- [x] 503 и empty states по edge-cases.
- [x] Light + dark на semantic tokens.
- [x] Unit-тесты monitoring реализованы; e2e — базовая загрузка страницы.
- [ ] Acceptance M17 §9.2 monitoring tick update — staging (ручная проверка).

---

## Зависимости

- module-0-index (layout, StatusBadge, ThemeProvider, usePolling, api client)
- M17 §7.1, §10.s
- Backend: `GET /status`, gates (staging)

---

## Артефакты

- `MonitoringPage.tsx`, компоненты `src/components/monitoring/*`
- `api/monitoring.ts`, `useMonitoringPolling.ts`
- Unit + e2e тесты monitoring

---

## Владелец контракта

**Module-1 владеет:** UX и компоненты страницы `/monitoring`.

**Ссылается на:** M17 §7.1; M13 GateInfo; OpenAPI полей status response.
