---
id: m1-state-panels
parent_module: .cursor/plans/FE/module-1-monitoring.plan.md
depends_on:
  - m1-page-shell
  - m1-status-polling
план читать: "нет"
status: completed
---

# Задача: TxStatePanel + SrStatePanel

## Что сделать
Две карточки 50/50 (stack `<1024px`): структурированный key-value / nested вывод `tx_state` и `sr_state`; empty «Нет данных»; числа mono + tabular-nums.

## Файлы
**Создать:**
- `src/components/monitoring/TxStatePanel.tsx`
- `src/components/monitoring/SrStatePanel.tsx`

**Изменить:**
- `src/pages/MonitoringPage.tsx`
- `src/components/monitoring/index.ts`

**Не трогать без явного указания:** charts, conclusion.

## Контракт (если задача создаёт/меняет сущность)
`TxStatePanelProps` / `SrStatePanelProps`: соответствующее поле из `StatusResponse` (`unknown` → render-safe nested display).

## Решения / якоря реализации
- Повторить паттерн: Card + muted empty из других monitoring-карточек.
- Обязательно: не crash на отсутствующих полях; один ряд Tx|Sr на desktop.
- Не делать: редактирование state.

## Зависимости
- `m1-page-shell` — ряд Tx|Sr.
- `m1-status-polling` — `tx_state`, `sr_state`.

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| Tx/Sr empty | `tests/unit/monitoring/TxStatePanel.test.tsx` (и Sr) | muted placeholder без crash |

## DoD
- [ ] Tx + Sr panels wired; responsive stack
- [ ] Empty states по edge-cases
- [ ] Тесты из раздела «Тесты» зелёные
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
