---
id: m1-charts-slider
parent_module: .cursor/plans/FE/module-1-monitoring.plan.md
depends_on:
  - m1-page-shell
  - m1-status-polling
  - m0-design-tokens
план читать: "да, §Концепция зона 6 (Recharts, carousel)"
status: completed
---

# Задача: MetricsChartsSlider — carousel графиков

## Что сделать
Несколько chart views из status (series по OpenAPI); переключение shadcn Carousel с dots/arrows; crossfade opacity 200ms; placeholder при отсутствии данных; light/dark оси и легенда.

## Файлы
**Создать:**
- `src/components/monitoring/MetricsChartsSlider.tsx`

**Изменить:**
- `src/pages/MonitoringPage.tsx`
- `src/components/monitoring/index.ts`

**Не трогать без явного указания:** отдельные GET для метрик (если не в status response).

## Контракт (если задача создаёт/меняет сущность)
`MetricsChartsSliderProps`: chart series из `StatusResponse` (имена полей — OpenAPI).

Локальный state активного слайда; смена слайда без refetch; `prefers-reduced-motion` — без autoplay.

## Решения / якоря реализации
- Обязательно: **Recharts** (зафиксировано module-0); semantic colors для осей.
- Обязательно: без layout-анимации при смене слайда — только opacity crossfade ~200ms.
- Не делать: refetch при листании; WebSocket.

## Зависимости
- `m1-page-shell` — широкая зона Charts.
- `m1-status-polling` — данные series.
- `m0-design-tokens` — цвета light/dark.

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| Carousel nav | `tests/unit/monitoring/MetricsChartsSlider.test.tsx` | next/prev меняет активный slide |

## DoD
- [ ] Carousel + Recharts; placeholder без series
- [ ] Light/dark читаемость осей
- [ ] Тесты из раздела «Тесты» зелёные
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
