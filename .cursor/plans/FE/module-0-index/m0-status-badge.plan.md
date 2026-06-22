---
id: m0-status-badge
parent_module: .cursor/plans/FE/module-0-index.plan.md
depends_on: [m0-design-tokens]
план читать: "да, §StatusBadge"
status: pending
---

# Задача: StatusBadge

## Что сделать
Единый компонент `StatusBadge` для monitoring report и `deep_chat_state`: цвет + текстовая метка, TSDoc на русском, экспорт из `components/`.

## Файлы
**Создать:**
- `src/components/StatusBadge.tsx`

**Изменить:**
- нет (опционально barrel `src/components/index.ts`)

**Не трогать без явного указания:** страницы module-1…6.

## Контракт (если задача создаёт/меняет сущность)
```ts
type StatusBadgeVariant =
  | 'success' | 'error' | 'skipped' | 'active' | 'awaiting_approval' | 'completed'
  | 'not_started' | 'cancelled'

interface StatusBadgeProps {
  status: StatusBadgeVariant
  label?: string  // override; default — человекочитаемая метка по status
}
```

Цвета только через CSS `status-*` / semantic tokens — **без** inline hex в компоненте.

## Решения / якоря реализации
- Повторить паттерн: shadcn `Badge` в `src/components/ui/` как базовый примитив.
- Обязательно: `active` использует `--primary`; a11y — цвет не единственный индикатор (всегда текст).
- Не делать: ad-hoc цвета на страницах; дублирование в module-1…6.

## Зависимости
- `m0-design-tokens` — `--status-*` переменные.

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| All variants render | `tests/unit/StatusBadge.test.tsx` | monitoring 6 + `not_started`/`cancelled` с label |

## DoD
- [ ] StatusBadge экспортирован; TSDoc на русском
- [ ] Все 8 вариантов рендерятся
- [ ] Тесты из раздела «Тесты» зелёные
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
