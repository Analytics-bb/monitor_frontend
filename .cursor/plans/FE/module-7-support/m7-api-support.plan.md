---
id: m7-api-support
parent_module: .cursor/plans/FE/module-7-support.plan.md
depends_on:
  - m0-api-client
план читать: "да, §Публичный API; docs/api.md § Support chat"
status: completed
---

# Задача: api/support.ts + Zod SupportChatSnapshot

## Что сделать
REST-клиент support chat: `GET /api/support/chat`, `POST .../messages`, `POST .../attachments` (multipart), `POST .../reset`; Zod-парсинг `SupportChatSnapshot` и `AttachmentUploadResponse` на границе.

## Файлы
**Создать:**
- `src/api/support.ts`

**Не трогать без явного указания:** fixtures (todo `m7-fixture-support`), hooks, UI.

## Контракт (если задача создаёт/меняет сущность)
Экспорт функций чата для `useSupportChat`. Ответы — `SupportChatSnapshot` по [`docs/api.md`](../../../../docs/api.md).

Multipart upload: `FormData` + поле `file`; не `Content-Type: application/json` (исключение на границе этой функции).

Ошибки: `409 chat_processing`, `422 attachment_rejected`, `404 attachment_not_found` — через `ApiClientError`.

## Решения / якоря реализации
- Повторить паттерн: `src/api/deepChat.ts` — `apiGetJson` / `apiFetch`, fixture branch при `isFixtureMode()`.
- Обязательно: Bearer из `api/client` (module-6); fixture path для dev без API.
- Не делать: дублирование OpenAPI-полей вне Zod; optimistic UI.

## Зависимости
- `m0-api-client` — transport, error envelope.

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| Zod parse valid snapshot | `tests/unit/support/supportApi.test.ts` | parse без throw |
| N/A multipart e2e | — | в `m7-tests` |

## DoD
- [ ] Четыре endpoint-функции + Zod
- [ ] Multipart upload отдельно от JSON POST
- [ ] Тесты из раздела «Тесты» зелёные
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
