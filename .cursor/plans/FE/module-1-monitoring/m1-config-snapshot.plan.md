---
id: m1-config-snapshot
parent_module: .cursor/plans/FE/module-1-monitoring.plan.md
depends_on:
  - m1-page-shell
  - m1-status-polling
план читать: "нет"
status: pending
---

# Задача: ConfigSnapshotPanel — tree/accordion, copy

## Что сделать
Интерактивный read-only просмотр `config_snapshot`: accordion/tree, expand/collapse, copy-to-clipboard на поле; truncate длинных значений; empty «Нет snapshot».

## Файлы
**Создать:**
- `src/components/monitoring/ConfigSnapshotPanel.tsx`

**Изменить:**
- `src/pages/MonitoringPage.tsx`
- `src/components/monitoring/index.ts`

**Не трогать без явного указания:** PATCH config на сервере.

## Контракт (если задача создаёт/меняет сущность)
`ConfigSnapshotPanelProps`: `configSnapshot: Record<string, unknown> | null | undefined`.

Поведение: `null` / `{}` → muted empty; copy field → clipboard + brief feedback (sonner optional).

## Решения / якоря реализации
- Повторить паттерн: shadcn `Accordion` / `Collapsible`.
- Обязательно: read-only; числа — `tabular-nums` где применимо.
- Не делать: поиск по ключу (optional в плане — вне scope unless trivial).

## Зависимости
- `m1-page-shell` — слот Config.
- `m1-status-polling` — `data.config_snapshot`.

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| Expand + copy | `tests/unit/monitoring/ConfigSnapshotPanel.test.tsx` | клик секции → раскрытие; copy field |

## DoD
- [ ] ConfigSnapshotPanel wired; empty state
- [ ] Accordion + copy по §Концепция зона 3
- [ ] Тесты из раздела «Тесты» зелёные
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
