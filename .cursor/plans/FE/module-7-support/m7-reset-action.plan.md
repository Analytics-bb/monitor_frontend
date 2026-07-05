---
id: m7-reset-action
parent_module: .cursor/plans/FE/module-7-support.plan.md
depends_on:
  - m7-header
  - m7-use-support-chat
план читать: "да, §Флоу п.7"
status: completed
---

# Задача: Сброс чата — confirm + POST reset

## Что сделать
Кнопка «Сбросить чат» в `SupportHeader`: `AlertDialog` confirm → `resetChat()` из hook → refetch; пустая история + `context_reset` banner после ответа.

## Файлы
**Изменить:**
- `src/components/support/SupportHeader.tsx`

**Не трогать без явного указания:** `api/support.ts`, hook internals.

## Контракт (если задача создаёт/меняет сущность)
`POST /api/support/chat/reset` — без body; ответ `SupportChatSnapshot`.

## Решения / якоря реализации
- Обязательно: confirm dialog перед reset (destructive action).
- Не делать: reset без подтверждения.

## Зависимости
- `m7-header` — `SupportHeader` shell.
- `m7-use-support-chat` — `resetChat`.

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| reset flow | `tests/unit/support/SupportHeader.test.tsx` | confirm → reset вызван |

## DoD
- [ ] Reset button + dialog
- [ ] POST reset через hook
- [ ] Тесты из раздела «Тесты» зелёные
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
