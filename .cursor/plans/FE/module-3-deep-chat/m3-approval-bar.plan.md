---
id: m3-approval-bar
parent_module: .cursor/plans/FE/module-3-deep-chat.plan.md
depends_on:
  - m3-chat-window
  - m3-use-deep-chat
  - m0-toast-provider
план читать: "да, §Approval bar"
status: completed
---

# Задача: ApprovalBar — Approve/Reject

## Что сделать
Sticky bar между messages и composer при `pending_action`: tool name + args summary (без секретов); Approve/Reject buttons; `budget_exceeded` 409 → toast, hide Approve.

## Файлы
**Создать:**
- `src/components/deep/ApprovalBar.tsx`

**Изменить:**
- `src/components/deep/ChatWindow.tsx`
- `src/components/deep/index.ts`

**Не трогать без явного указания:** composer disable logic (already in m3-composer).

## Контракт (если задача создаёт/меняет сущность)
`ApprovalBar`: visible iff `pending_action != null`.

`approve(actionId)` / `reject(actionId)` → POST → immediate refetch.

Args summary — redact secrets/PII в UI.

## Решения / якоря реализации
- Обязательно: amber border-top accent (§Концепция).
- aria-label на кнопках с `action_id`.
- Не делать: optimistic approve state.

## Зависимости
- `m3-use-deep-chat` — approve/reject + pending_action.
- `m0-toast-provider` — budget_exceeded toast.

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| Approve flow mock | `tests/unit/deep-chat/ApprovalBar.test.tsx` | POST approve → refetch called |

## DoD
- [ ] Bar visible only with pending_action
- [ ] Approve/Reject wired; budget_exceeded handled
- [ ] Тесты из раздела «Тесты» зелёные
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
