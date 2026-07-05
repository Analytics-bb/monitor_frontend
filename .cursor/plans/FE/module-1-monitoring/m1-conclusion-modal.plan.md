---
id: m1-conclusion-modal
parent_module: .cursor/plans/FE/module-1-monitoring.plan.md
depends_on:
  - m1-page-shell
  - m1-status-polling
  - m0-status-badge
план читать: "да, §Концепция зона 7 (modal backdrop, Esc)"
status: completed
---

# Задача: ConclusionPanel + ConclusionModal

## Что сделать
Карточка: превью `line-clamp` 6–8 строк, `StatusBadge` отчёта, кнопка «Развернуть»; modal `Dialog` full viewport, backdrop blur, клик по backdrop **не** закрывает; Esc / «Свернуть» → inline без потери scroll страницы; `report.error` для skipped/error; optional link `/deep/{audit_id}`.

## Файлы
**Создать:**
- `src/components/monitoring/ConclusionPanel.tsx`
- `src/components/monitoring/ConclusionModal.tsx`

**Изменить:**
- `src/pages/MonitoringPage.tsx`
- `src/components/monitoring/index.ts`

**Не трогать без явного указания:** deep chat (module-3).

## Контракт (если задача создаёт/меняет сущность)
`ConclusionPanel` + controlled `ConclusionModal` (`open`, `onOpenChange`).

Modal: `max-w-4xl` / `90vw`, `max-h-[85vh]`, focus trap, `aria-labelledby`; при poll с открытым modal — обновить текст если тот же audit, иначе badge «обновлено».

## Решения / якоря реализации
- Повторить паттерн: shadcn `Dialog`; `StatusBadge` для report status.
- Обязательно: backdrop `bg-background/80` + blur; только явное закрытие (не click-outside).
- Не делать: Telegram status; редактирование conclusion.

## Зависимости
- `m1-page-shell` — слот Conclusion.
- `m1-status-polling` — `conclusion`, report fields.
- `m0-status-badge` — report status variants.

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| Truncate preview | `tests/unit/monitoring/ConclusionPanel.test.tsx` | line-clamp в panel |
| Expand/collapse | `tests/unit/monitoring/ConclusionModal.test.tsx` | dialog + backdrop; collapse → panel visible |
| Esc closes | `tests/unit/monitoring/ConclusionModal.test.tsx` | Esc закрывает modal |

## DoD
- [ ] Panel + Modal wired; skipped/error visible
- [ ] Backdrop, Esc, scroll position invariant
- [ ] Тесты из раздела «Тесты» зелёные
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
