---
id: m3-use-deep-chat
parent_module: .cursor/plans/FE/module-3-deep-chat.plan.md
depends_on:
  - m0-api-client
  - m0-use-polling
  - m0-mock-samples
план читать: "да, §Ключевые гарантии п.4–5; M17 §10.s"
status: completed
---

# Задача: useDeepChat + api/deepChat.ts

## Что сделать
Хук `useDeepChat(auditId)`: polling `GET .../chat` по state (1–2s active, 3–5s awaiting_approval, stop terminal); immediate refetch after POST; `api/deepChat.ts` — getChat, openChat, sendMessage, approve, reject с Zod `ChatSnapshot`.

## Файлы
**Создать:**
- `src/hooks/useDeepChat.ts`
- `src/api/deepChat.ts`

**Не трогать без явного указания:** UI components, `DeepChatPage` layout.

## Контракт (если задача создаёт/меняет сущность)
`useDeepChat` returns: `{ snapshot, error, isPolling, refetch, openSession, sendMessage, approve, reject }`.

Интервалы §10.s; terminal states (`completed`, `cancelled`, `error`) — stop poll; unmount — `clearInterval` via `usePolling`.

After any POST → immediate GET then resume interval.

## Решения / якоря реализации
- Повторить паттерн: `src/hooks/useMonitoringPolling.ts` — domain hook на базе `usePolling`.
- Повторить паттерн: `src/api/monitoring.ts` — fixture fallback без `VITE_ANOMALY_API_BASE_URL`.
- Обязательно: `ChatSnapshot` fixture из `m0-mock-samples`.
- Не делать: optimistic UI; WebSocket.

## Зависимости
- `m0-use-polling` — base hook.
- `m0-api-client` — transport.
- `m0-mock-samples` — `ChatSnapshot` Zod.

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| Polling stop terminal | `tests/unit/deep-chat/useDeepChat.test.ts` | completed → no GET |
| Unmount stop | `tests/unit/deep-chat/useDeepChat.test.ts` | clearInterval |

## DoD
- [ ] API + hook; intervals по state
- [ ] Immediate refetch after POST
- [ ] Тесты из раздела «Тесты» зелёные
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
