---
id: m7-header
parent_module: .cursor/plans/FE/module-7-support.plan.md
depends_on:
  - m7-page-shell
  - m7-use-support-chat
  - m0-status-badge
план читать: "да, §StatusBadge маппинг"
status: completed
---

# Задача: SupportHeader — status + usage link

## Что сделать
`SupportHeader`: заголовок «Саппорт», `StatusBadge` по `snapshot.state` (processing → active + label «Обработка…»), NavLink «Расход токенов» → `/usage?agent_kind=support`.

## Файлы
**Создать:**
- `src/components/support/SupportHeader.tsx`

**Изменить:**
- `src/pages/SupportPage.tsx`
- `src/components/support/index.ts`

**Не трогать без явного указания:** reset button (todo `m7-reset-action`).

## Контракт (если задача создаёт/меняет сущность)
StatusBadge маппинг без нового variant: `active`, `processing`→label override, `error`.

Не показывать `usage_total` из snapshot.

## Решения / якоря реализации
- Повторить паттерн: header strip в `DeepChatPage` (без breadcrumb).
- Не делать: новый StatusBadge variant `processing`.

## Зависимости
- `m7-use-support-chat` — `snapshot.state`.
- `m7-page-shell` — slot в SupportPage.
- `m0-status-badge` — компонент.

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| usage link | `tests/unit/support/SupportHeader.test.tsx` | href содержит `agent_kind=support` |

## DoD
- [ ] Header wired в SupportPage
- [ ] StatusBadge маппинг по state
- [ ] Тесты из раздела «Тесты» зелёные
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
