---
id: m3-message-list
parent_module: .cursor/plans/FE/module-3-deep-chat.plan.md
depends_on:
  - m3-chat-window
  - m3-use-deep-chat
план читать: "да, §Messages (scroll area)"
status: pending
---

# Задача: ChatMessage list + scroll

## Что сделать
`ChatMessage` component + list: roles user/assistant/system/tool; bubbles left/right; auto scroll-to-bottom on new messages; tool blocks без секретов; optional «N новых» если user scrolled up.

## Файлы
**Создать:**
- `src/components/deep/ChatMessage.tsx`

**Изменить:**
- `src/components/deep/ChatWindow.tsx`
- `src/components/deep/index.ts`

**Не трогать без явного указания:** composer, approval.

## Контракт (если задача создаёт/меняет сущность)
`ChatMessage`: props `{ role, content, ... }` по `ChatSnapshot.messages[]`.

Layout: user right `bg-primary/10`, assistant left `bg-card border`, system/tool compact mono.

## Решения / якоря реализации
- Повторить паттерн: `ScrollArea` shadcn.
- Обязательно: `aria-live="polite"` на messages container.
- Не делать: markdown WYSIWYG.

## Зависимости
- `m3-chat-window` — scroll slot.
- `m3-use-deep-chat` — `snapshot.messages`.

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| Roles layout | `tests/unit/deep-chat/ChatMessage.test.tsx` | user right, assistant left |

## DoD
- [ ] Message list renders all roles
- [ ] Scroll-to-bottom on new message
- [ ] Тесты из раздела «Тесты» зелёные
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
