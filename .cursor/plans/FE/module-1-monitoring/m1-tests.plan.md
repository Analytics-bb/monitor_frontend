---
id: m1-tests
parent_module: .cursor/plans/FE/module-1-monitoring.plan.md
depends_on:
  - m1-page-shell
  - m1-status-polling
  - m1-status-panel
  - m1-gate-selector
  - m1-config-snapshot
  - m1-state-panels
  - m1-charts-slider
  - m1-conclusion-modal
  - m1-degraded-banner
план читать: "да, §Тесты; §DoD"
status: completed
---

# Задача: Vitest + e2e monitoring

## Что сделать
Довести unit-тесты по таблице плана модуля и добавить `tests/e2e/monitoring.spec.ts` — fixture poll обновляет conclusion.

## Файлы
**Создать:**
- `tests/e2e/monitoring.spec.ts`

**Изменить / дополнить:**
- `tests/unit/monitoring/*.test.ts` — закрыть пробелы из §Тесты родительского плана

**Не трогать без явного указания:** контракт API, компоненты без failing tests.

## Контракт (если задача создаёт/меняет сущность)
N/A

## Решения / якоря реализации
- Повторить паттерн: fixtures `StatusResponse` из module-0; MSW или mock `apiFetch` в unit.
- Обязательно: e2e против fixtures или staging API по принятому в репо паттерну.
- Не делать: дублировать тесты module-0 (`usePolling` base).

## Зависимости
Все `m1-*` UI/API задачи — тесты покрывают итоговое поведение страницы.

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| StatusPanel live/stale | `tests/unit/monitoring/StatusPanel.test.tsx` | Live / Stale |
| tick pulse | `tests/unit/monitoring/StatusPanel.test.tsx` | pulse / reduced-motion |
| Gate 404 | `tests/unit/monitoring/GateSelector.test.tsx` | toast, no UI change |
| Config expand | `tests/unit/monitoring/ConfigSnapshotPanel.test.tsx` | expand + copy |
| Tx/Sr empty | `tests/unit/monitoring/TxStatePanel.test.tsx` | no crash |
| Carousel | `tests/unit/monitoring/MetricsChartsSlider.test.tsx` | slide switch |
| Conclusion modal | `tests/unit/monitoring/ConclusionModal.test.tsx` | expand/collapse/Esc |
| Polling interval | `tests/unit/monitoring/useMonitoringPolling.test.ts` | 2–3s при tick |
| 503 banner | `tests/unit/monitoring/DegradedBanner.test.tsx` | visible |
| e2e tick update | `tests/e2e/monitoring.spec.ts` | conclusion обновляется после poll |

## DoD
- [ ] Все сценарии из §Тесты плана модуля зелёные
- [ ] e2e `monitoring.spec.ts` проходит
- [ ] DoD родительского плана (acceptance M17 §9.2) готов к staging
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
