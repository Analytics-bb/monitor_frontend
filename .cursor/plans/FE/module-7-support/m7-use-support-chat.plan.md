---
id: m7-use-support-chat
parent_module: .cursor/plans/FE/module-7-support.plan.md
depends_on:
  - m7-api-support
  - m7-fixture-support
  - m0-use-polling
план читать: "да, §Ключевые гарантии п.2–4; M18 § SPA transport"
status: pending
---

# Задача: useSupportChat

## Что сделать
Хук `useSupportChat`: mount `GET /api/support/chat`; polling **1–2 с** только при `state=processing`; stop при `active`/`error` и unmount; после POST — immediate GET; мутации send/upload/reset.

## Файлы
**Создать:**
- `src/hooks/useSupportChat.ts`

**Не трогать без явного указания:** UI components, `SupportPage`.

## Контракт (если задача создаёт/меняет сущность)
Return: `{ snapshot, error, isPolling, refetch, sendMessage, uploadAttachment, resetChat }` (имена уточнить при реализации).

Polling: только `processing`; tab hidden ×2 через `usePolling`.

`409 chat_processing` на send → refetch, не бросать без обработки снаружи.

## Решения / якоря реализации
- Повторить паттерн: `src/hooks/useDeepChat.ts` — domain hook на `usePolling`, без approve flow.
- Обязательно: интервал processing 1–2 с (M18); не poll в `active`.
- Не делать: WebSocket; optimistic messages.

## Зависимости
- `m7-api-support` — API functions.
- `m7-fixture-support` — fixture в dev/tests.
- `m0-use-polling` — base interval + unmount.

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| Mount GET | `tests/unit/support/useSupportChat.test.ts` | GET on mount |
| processing polling | `tests/unit/support/useSupportChat.test.ts` | interval only if processing |
| unmount stop | `tests/unit/support/useSupportChat.test.ts` | clearInterval |

## DoD
- [ ] Hook + polling policy
- [ ] Immediate refetch after POST
- [ ] Тесты из раздела «Тесты» зелёные
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
