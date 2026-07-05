---
title: 'FE Module 3 — Deep Chat'
plan: '.cursor/plans/FE/module-3-deep-chat.plan.md'
last_reviewed: '2026-07-05'
---

# Deep Chat (`/deep/{audit_id}`)

## Назначение и границы

За что отвечает: LLM-чат оператора по конкретному audit — open session, polling `ChatSnapshot`, send message, approve/reject pending action, terminal states, breadcrumb back в список.

Что явно не входит: список audits (module-2), usage drill-down (module-4 inbound link only), backend M16 изменения.

Ссылка на план: `.cursor/plans/FE/module-3-deep-chat.plan.md`

## Структура в репозитории

| Путь | Назначение |
|------|------------|
| `src/pages/DeepChatPage.tsx` | Shell: breadcrumb, case strip, `ChatWindow` |
| `src/components/deep/ChatWindow.tsx` | Messages + composer + approval overlay |
| `src/components/deep/ChatComposer.tsx` | Textarea + Send; disabled при pending/terminal |
| `src/components/deep/ApprovalBar.tsx` | Approve/Reject над composer |
| `src/components/deep/ChatMessageList.tsx` | Roles user/assistant/system/tool |
| `src/components/deep/CaseMetaStrip.tsx` | audit_id, gate, время |
| `src/hooks/useDeepChat.ts` | Polling, mutations, optimistic UI |
| `src/api/deepChat.ts` | GET/POST chat endpoints + fixture store |
| `src/api/fixtures/chatSnapshot.ts` | Zod `ChatSnapshot`, fixtures |
| `src/lib/deepChat*.ts` | Thinking, errors, snapshot merge, pending |

Точка входа: `DeepChatPage` (`/deep/:auditId`).

## Публичный интерфейс

| Аспект | Решение |
|--------|---------|
| Маршрут | `/deep/:auditId` |
| Загрузка | `useDeepChat(auditId)` → `GET /api/deep/cases/{id}/chat` |
| Open | `POST .../chat/open` при `state=not_started` |
| Send | `POST .../chat/messages`; timeout 120s |
| Approve/Reject | `POST .../chat/approve` / `reject` |
| Polling | 1.5s пока не terminal; stop on unmount |
| Breadcrumb | `Deep` → `/deep?{deepListSearch}` из `location.state` |
| Usage link | `/usage?audit_id=` в header |

## Контракты и сущности

| Сущность | Файл | Описание |
|----------|------|----------|
| `ChatSnapshot` | `chatSnapshot.ts` | `state`, `messages`, `pending_action`, `system` |
| `ChatSnapshot.state` | `chatSnapshot.ts` | not_started, active, awaiting_approval, completed, cancelled, error, processing |
| `PendingAction` | `chatSnapshot.ts` | Tool approval payload |
| `TERMINAL_STATES` | `deepChat.ts` | completed, cancelled — polling off |
| `UseDeepChatResult` | `useDeepChat.ts` | snapshot, mutations, thinking flags |

## Ошибки и коды

| Код | Константа | Условие | Примечание |
|-----|-----------|---------|------------|
| `chat_processing` | — | 409 on send | Refetch; draft preserved |
| `budget_exceeded` | — | 409 on approve | Toast error_code |
| `not_found` | — | 404 audit/chat | Error panel |
| (transport) | `ApiClientError` | Network/5xx | Inline chat error + retry |

## Заглушки и временное поведение

| Что | Где | Поведение |
|-----|-----|-----------|
| In-memory fixture store | `deepChat.ts` | Per-auditId state без API URL |
| Agent thinking UI | `useDeepChat.ts` | Optimistic phase до refetch |

## Зависимости

### Модули проекта

- module-0 — `usePolling`, `StatusBadge`, `api/client`, theme
- module-2 — drill-down, `deepListSearch` state

### Конфигурация

| Переменная | Назначение | Обязательная |
|------------|------------|--------------|
| `VITE_ANOMALY_API_BASE_URL` | REST upstream | Нет (fixtures) |

## Тесты

| Файл | Что проверяет | Уровень |
|------|--------------|---------|
| `tests/unit/deep-chat/useDeepChat.test.ts` | polling stop, mutations | unit |
| `tests/unit/deep-chat/DeepChatPage.test.tsx` | layout, breadcrumb | unit |
| `tests/unit/deep-chat/ChatComposer.test.tsx` | pending blocks input | unit |
| `tests/unit/deep-chat/ApprovalBar.test.tsx` | approve flow | unit |
| `tests/unit/deep-chat/ChatWindow.test.tsx` | LLM layout | unit |
| `tests/e2e/deep-chat.spec.ts` | list → chat flow | e2e |

Намеренно не покрыто: staging latency 120s mutation timeout.

## Как пользоваться

```tsx
const { snapshot, sendMessage, approveAction, rejectAction } = useDeepChat(auditId, {
  seedConclusion: locationState?.conclusion,
})
```

Navigate из списка:

```tsx
navigate(`/deep/${auditId}`, { state: { deepListSearch: location.search } })
```

## Наблюдаемость и безопасность

- Tool messages без секретов в UI (truncate/filter)
- Polling cleared on unmount (`usePolling`)
- Deep mutation timeout отдельно от default 30s

## Совместимость и эталоны

- M17 §7.3, §10.s polling intervals
- M16 `ChatSnapshot` — поля из `docs/api.md`

## История и миграции

N/A
