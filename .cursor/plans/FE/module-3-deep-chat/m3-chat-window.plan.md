---
id: m3-chat-window
parent_module: .cursor/plans/FE/module-3-deep-chat.plan.md
depends_on:
  - m3-page-shell
план читать: "да, §Стандартное окно общения с LLM"
status: pending
---

# Задача: ChatWindow — LLM layout shell

## Что сделать
Вертикальный shell: flex-1 scroll messages area + sticky approval slot + sticky composer slot; full height content area; slots для MessageList, ApprovalBar, ChatComposer.

## Файлы
**Создать:**
- `src/components/deep/ChatWindow.tsx`

**Изменить:**
- `src/pages/DeepChatPage.tsx`
- `src/components/deep/index.ts`

**Не трогать без явного указания:** hook logic, API.

## Контракт (если задача создаёт/меняет сущность)
`ChatWindow`: children/slots для messages, approval, composer; `min-h-0 flex-1` scroll pattern.

Mobile: тот же vertical stack (не sidebar).

## Решения / якоря реализации
- Обязательно: composer всегда внизу (§Инварианты п.2).
- Не делать: message rendering (m3-message-list).

## Зависимости
- `m3-page-shell` — parent page layout.

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| LLM layout | `tests/unit/deep-chat/ChatWindow.test.tsx` | composer внизу, messages flex-1 |

## DoD
- [ ] ChatWindow shell wired на страницу
- [ ] Тесты из раздела «Тесты» зелёные
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
