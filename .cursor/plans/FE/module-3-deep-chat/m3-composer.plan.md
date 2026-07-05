---
id: m3-composer
parent_module: .cursor/plans/FE/module-3-deep-chat.plan.md
depends_on:
  - m3-chat-window
  - m3-use-deep-chat
  - m0-toast-provider
план читать: "да, §Composer (низ, sticky)"
status: completed
---

# Задача: ChatComposer — textarea + Send

## Что сделать
`ChatComposer`: auto-grow textarea (max 4 rows), Send / Enter; disabled при `pending_action` или terminal; placeholder по state; `sendMessage` → 409 при pending → refetch + preserve draft.

## Файлы
**Создать:**
- `src/components/deep/ChatComposer.tsx`

**Изменить:**
- `src/components/deep/ChatWindow.tsx`
- `src/components/deep/index.ts`

**Не трогать без явного указания:** ApprovalBar.

## Контракт (если задача создаёт/меняет сущность)
`ChatComposer`: props `{ disabled, placeholder, onSend, draft }`.

Terminal states — composer hidden (не только disabled).

409 `message` + pending → refetch snapshot, draft preserved (§Edge-cases).

## Решения / якоря реализации
- Обязательно: `pending_action != null` → disabled (M17 инвариант).
- Не делать: optimistic append message.

## Зависимости
- `m3-use-deep-chat` — `sendMessage`, `snapshot.state`, `pending_action`.
- `m0-toast-provider` — optional toast on errors.

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| pending blocks input | `tests/unit/deep-chat/ChatComposer.test.tsx` | textarea disabled |

## DoD
- [ ] Composer wired; disabled rules
- [ ] 409 refetch + draft preserved
- [ ] Тесты из раздела «Тесты» зелёные
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
