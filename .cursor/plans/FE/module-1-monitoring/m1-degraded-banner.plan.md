---
id: m1-degraded-banner
parent_module: .cursor/plans/FE/module-1-monitoring.plan.md
depends_on:
  - m1-page-shell
  - m1-status-polling
  - m1-status-panel
план читать: "нет"
status: pending
---

# Задача: DegradedBanner + empty first tick

## Что сделать
Amber баннер под StatusPanel при 503 `scheduler_not_initialized` с retry indicator; empty state «ожидание первого тика» при `last_tick_at: null` в Conclusion и графиках (координация с существующими зонами).

## Файлы
**Создать:**
- `src/components/monitoring/DegradedBanner.tsx`

**Изменить:**
- `src/pages/MonitoringPage.tsx`
- `src/components/monitoring/ConclusionPanel.tsx` — empty copy при null tick (если ещё не сделано)
- `src/components/monitoring/MetricsChartsSlider.tsx` — empty placeholder при null tick (если ещё не сделано)
- `src/components/monitoring/index.ts`

**Не трогать без явного указания:** backoff logic в hook (уже в `m1-status-polling`).

## Контракт (если задача создаёт/меняет сущность)
`DegradedBannerProps`: `visible: boolean`, optional `onRetry`.

Показ при `isDegraded` из polling; зоны сохраняют last good data или placeholders.

## Решения / якоря реализации
- Обязательно: accent-warn / amber semantic token; не очищать last good data при 503.
- Обязательно: empty first tick — согласованный copy в Conclusion + charts.
- Не делать: дублировать backoff в UI.

## Зависимости
- `m1-page-shell` — позиция под Status.
- `m1-status-polling` — `isDegraded`, `data.last_tick_at`.
- `m1-status-panel` — StatusPanel «Stale»/degraded согласованность.

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| 503 banner | `tests/unit/monitoring/DegradedBanner.test.tsx` | visible при degraded |

## DoD
- [ ] DegradedBanner + empty first tick states
- [ ] Last good data при 503
- [ ] Тесты из раздела «Тесты» зелёные
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
