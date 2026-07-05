---
id: m1-status-panel
parent_module: .cursor/plans/FE/module-1-monitoring.plan.md
depends_on:
  - m1-page-shell
  - m1-status-polling
  - m0-status-badge
план читать: "нет"
status: completed
---

# Задача: StatusPanel — live/stale/tick pulse

## Что сделать
Компактная полоса: индикатор Live/Stale, `last_tick_at` (mono MSK), `last_status` через `StatusBadge`, pulse при `tick_in_progress`, кнопка Manual refresh → `refetch`.

## Файлы
**Создать:**
- `src/components/monitoring/StatusPanel.tsx`

**Изменить:**
- `src/pages/MonitoringPage.tsx` (wire StatusPanel + hook)
- `src/components/monitoring/index.ts`

**Не трогать без явного указания:** `DegradedBanner` (задача `m1-degraded-banner`).

## Контракт (если задача создаёт/меняет сущность)
`StatusPanelProps`: данные из `useMonitoringPolling` + `onRefresh: () => void`.

Состояния: Live (success dot), Stale (muted), degraded accent-warn при 503; `prefers-reduced-motion` — без pulse.

## Решения / якоря реализации
- Повторить паттерн: `StatusBadge` из module-0.
- Обязательно: timestamps — JetBrains Mono, naive MSK as-is.
- Не делать: DegradedBanner, gate, остальные зоны.

## Зависимости
- `m1-page-shell` — слот Status в grid.
- `m1-status-polling` — `data`, `isStale`, `refetch`.
- `m0-status-badge` — `last_status`.

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| Live vs Stale | `tests/unit/monitoring/StatusPanel.test.tsx` | успешный poll → Live; ошибка → Stale |
| tick pulse | `tests/unit/monitoring/StatusPanel.test.tsx` | pulse при `tick_in_progress`; static при reduced-motion |

## DoD
- [ ] StatusPanel wired в MonitoringPage
- [ ] Live/Stale/pulse/refresh по §Концепция зона 1
- [ ] Тесты из раздела «Тесты» зелёные
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
