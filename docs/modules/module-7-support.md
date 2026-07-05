---
title: 'FE Module 7 — Support'
plan: '.cursor/plans/FE/module-7-support.plan.md'
last_reviewed: '2026-07-05'
---

# Support (`/support`)

## Назначение и границы

За что отвечает: user-centric support-чат — polling `SupportChatSnapshot`, text + attachments, reset history, `context_reset` banner, link на usage filter `agent_kind=support`.

Что явно не входит: auth session (module-6), backend M18 agent logic, `usage_total` как primary UI metric.

Ссылка на план: `.cursor/plans/FE/module-7-support.plan.md`

## Структура в репозитории

| Путь | Назначение |
|------|------------|
| `src/pages/SupportPage.tsx` | Header + ChatWindow + banners |
| `src/components/support/SupportHeader.tsx` | StatusBadge, reset, usage link |
| `src/components/support/SupportComposer.tsx` | Text + file input + chips |
| `src/components/support/SupportMessageList.tsx` | Bubbles с attachments |
| `src/components/support/ContextResetBanner.tsx` | Dismissible при context_reset |
| `src/components/support/SupportHistoryLimitBanner.tsx` | History limit warning |
| `src/hooks/useSupportChat.ts` | Polling + mutations |
| `src/api/support.ts` | GET/POST support chat + multipart upload |
| `src/api/fixtures/supportChatSnapshot.ts` | Zod snapshot + fixtures |
| `src/lib/supportHistory.ts` | History limit env + counting |

Точка входа: `SupportPage` (`/support`).

## Публичный интерфейс

| Аспект | Решение |
|--------|---------|
| Маршрут | `/support` (protected) |
| Snapshot | `GET /api/support/chat` |
| Send | `POST /api/support/chat/messages` (+ attachment_ids) |
| Upload | `POST /api/support/chat/attachments` multipart |
| Reset | `POST /api/support/chat/reset` |
| Polling | 1.5s при `state=processing`; stop on unmount |
| Usage link | `/usage?agent_kind=support` |
| Layout | Reuses `ChatWindow` from module-3 |

## Контракты и сущности

| Сущность | Файл | Описание |
|----------|------|----------|
| `SupportChatSnapshot` | `supportChatSnapshot.ts` | state, messages, context_generation, context_reset |
| `SupportChatSnapshot.state` | `supportChatSnapshot.ts` | idle, processing, error |
| `SendSupportMessageInput` | `support.ts` | text + attachment_ids |
| `attachmentLabels` | `useSupportChat.ts` | Map id → filename from upload cache |

## Ошибки и коды

| Код | Константа | Условие | Примечание |
|-----|-----------|---------|------------|
| `chat_processing` | — | 409 on send | Refetch; composer draft outside |
| (transport) | `ApiClientError` | GET/POST failures | Toast via `mapApiError` |
| History limit | — | Client rotate in fixture | Empty messages + context_reset |

## Заглушки и временное поведение

| Что | Где | Поведение |
|-----|-----|-----------|
| In-memory fixture | `support.ts` | Simulates upload, send, reset, processing |
| `VITE_SUPPORT_HISTORY_LIMIT` | `supportHistory.ts` | Client-side limit for banner |

## Зависимости

### Модули проекта

- module-0 — `usePolling`, layout, toast
- module-3 — `ChatWindow` component
- module-4 — `agent_kind=support` filter literal
- module-6 — Bearer auth

### Конфигурация

| Переменная | Назначение | Обязательная |
|------------|------------|--------------|
| `VITE_ANOMALY_API_BASE_URL` | REST upstream | Нет (fixtures) |
| `VITE_SUPPORT_HISTORY_LIMIT` | Max messages before rotate | Нет |

## Тесты

| Файл | Что проверяет | Уровень |
|------|--------------|---------|
| `tests/unit/support/useSupportChat.test.ts` | polling, send, reset | unit |
| `tests/unit/support/SupportPage.test.tsx` | page integration | unit |
| `tests/unit/support/SupportComposer.test.tsx` | attachments | unit |
| `tests/unit/support/ContextResetBanner.test.tsx` | banner dismiss | unit |
| `tests/unit/support/supportApi.test.ts` | API + fixtures | unit |
| `tests/e2e/support.spec.ts` | auth + send flow | e2e |

Намеренно не покрыто: large file upload limits against staging.

## Как пользоваться

Открыть `/support` → ввести текст → optional attach file → Send.
Reset через header confirm → empty history.

Deep-link usage: `/usage?agent_kind=support`.

## Наблюдаемость и безопасность

- Attachment filenames cached client-side only
- `usage_total` в snapshot не primary UI (ADR usage single read path)
- Polling stop on unmount

## Совместимость и эталоны

- M18 Support chat в `docs/api.md`
- Transport аналог deep chat (polling + POST mutations)

## История и миграции

- SupportPage.test перенесён из `tests/unit/auth/` → `tests/unit/support/`
