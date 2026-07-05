---
id: m1-gate-selector
parent_module: .cursor/plans/FE/module-1-monitoring.plan.md
depends_on:
  - m1-page-shell
  - m1-status-polling
  - m0-toast-provider
план читать: "нет"
status: completed
---

# Задача: GateSelector — select, confirm, activate

## Что сделать
Карточка gate: `gate_id` + label; Select/Combobox со списком gates; confirm-dialog → `POST /api/gates/{gate_id}/activate` → refetch status; 404 → toast `gate_not_found`, UI без смены.

## Файлы
**Создать:**
- `src/components/monitoring/GateSelector.tsx`

**Изменить:**
- `src/api/monitoring.ts` — `getGates`, `getActiveGate`, `activateGate`
- `src/pages/MonitoringPage.tsx`
- `src/components/monitoring/index.ts`

**Не трогать без явного указания:** `useMonitoringPolling` interval logic.

## Контракт (если задача создаёт/меняет сущность)
`getActiveGate()`, `getGates()`, `activateGate(gateId: string)` — M17 §10.y / OpenAPI `GateInfo`.

`GateSelector`: mount fetch active + list; on activate success → refetch status + gates; on 404 → `mapApiError` toast, selected value unchanged.

## Решения / якоря реализации
- Повторить паттерн: `mapApiError` + sonner из `m0-toast-provider`.
- Обязательно: confirm перед POST; keyboard a11y для Select.
- Не делать: редактирование gate на сервере кроме activate.

## Зависимости
- `m1-page-shell` — слот Gate.
- `m1-status-polling` — `refetch` после activate; `api/monitoring.ts` уже существует.
- `m0-toast-provider` — toast на 404.

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| Activate 404 | `tests/unit/monitoring/GateSelector.test.tsx` | toast; selected gate не меняется |

## DoD
- [ ] Gate API + GateSelector wired
- [ ] Confirm → POST → refetch; 404 → toast без смены UI
- [ ] Тесты из раздела «Тесты» зелёные
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
