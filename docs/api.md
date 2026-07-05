---
title: "anomaly-api — HTTP API"
last_reviewed: "2026-07-01"
---

# anomaly-api — HTTP API

Единая точка входа: `apps/anomaly_api/main.py` (`uvicorn apps.anomaly_api.main:app`).

- **Базовый URL (локально):** `http://127.0.0.1:8000`
- **Префикс API:** `/api` — все REST-эндпоинты ниже относительно `http://127.0.0.1:8000/api`
- **OpenAPI / Swagger:** `http://127.0.0.1:8000/docs`
- **Аутентификация:** до M18 — нет; **M18 (план)** — opaque session Bearer на всех `/api/*`, кроме allowlist (см. § Auth)
- **CORS:** включён для dev/staging SPA (`src/http_cors/`); whitelist origin по `CORS_ALLOWED_ORIGINS`; prod same-origin — можно `CORS_ENABLED=false`
- **Формат ошибок (доменные):** `{ "error_code": string, "message": string, "details": object }`
- **Временные метки:** naive MSK (`tzinfo=None`), ISO 8601 в JSON

Источники: `src/*/routes.py`, Pydantic-модели в `src/*/models.py`, модульные документы в `docs/modules/`, план M18 — `.cursor/plans/R2/module-18-support-agent.plan.md`.

> **M18:** секции Auth и Support chat описывают **целевой контракт** (план `draft`, wire в `main.py` — в разработке). Остальные эндпоинты — реализованы в текущем `main.py`; после внедрения M18 они потребуют `Authorization: Bearer`, кроме allowlist ниже.

---

## Общие типы

### ErrorEnvelope

Используется большинством модулей при HTTP 4xx/5xx.


| Поле         | Тип      | Описание                           |
| ------------ | -------- | ---------------------------------- |
| `error_code` | `string` | Стабильный код для клиента         |
| `message`    | `string` | Человекочитаемое сообщение         |
| `details`    | `object` | Опциональные детали (без секретов) |


### DetectorConfig

Конфигурация детектора (M2). Владелец контракта — `src/config_store/models.py`.


| Поле            | Тип                  | Описание                                 |
| --------------- | -------------------- | ---------------------------------------- |
| `gate_id`       | `string | null`      | `null` — global; иначе per-gate override |
| `slice_minutes` | `integer`            | `>= 1`                                   |
| `window_slices` | `integer`            | `>= 1`                                   |
| `quantile_low`  | `number`             | `(0, 1)`                                 |
| `quantile_high` | `number`             | `(0, 1)`                                 |
| `persistence`   | `integer`            | `>= 1`                                   |
| `mode`          | `"anomaly" | "full"` |                                          |
| `created_at`    | `datetime`           | MSK naive, сервер                        |
| `updated_at`    | `datetime`           | MSK naive, сервер                        |


### DetectorConfigPatch

Partial update global/override. Поля `gate_id`, `created_at`, `updated_at` отсутствуют.


| Поле            | Тип                         |
| --------------- | --------------------------- |
| `slice_minutes` | `integer | null`            |
| `window_slices` | `integer | null`            |
| `quantile_low`  | `number | null`             |
| `quantile_high` | `number | null`             |
| `persistence`   | `integer | null`            |
| `mode`          | `"anomaly" | "full" | null` |


### MatchPredicate / Action / AgentInstruction

См. M6 (`src/instruction_store/models.py`).

**MatchPredicate:**


| Поле              | Тип                                    |
| ----------------- | -------------------------------------- |
| `gate_id`         | `string | null`                        |
| `triggered_by`    | `"tx_count" | "success_rate" | "any"`  |
| `direction`       | `"LOW" | "HIGH" | "any"`               |
| `other_metric`    | `{ name, classification_in[] } | null` |
| `zeros_share_min` | `number | null`                        |
| `zeros_share_max` | `number | null`                        |


**Action:**


| Поле          | Тип                               |
| ------------- | --------------------------------- |
| `decision`    | `"close_fast" | "escalate"`       |
| `severity`    | `"info" | "warning" | "critical"` |
| `require_sql` | `boolean`                         |
| `sql_tools`   | `string[] | null`                 |


**AgentInstruction** (ответ GET/POST/PATCH):


| Поле              | Тип                             |
| ----------------- | ------------------------------- |
| `instruction_id`  | `uuid`                          |
| `name`            | `string` (`^[a-z0-9_]+$`, 1–64) |
| `enabled`         | `boolean`                       |
| `match`           | `MatchPredicate`                |
| `action`          | `Action`                        |
| `prompt_template` | `string`                        |
| `created_at`      | `datetime`                      |
| `updated_at`      | `datetime`                      |


### AnomalyEvent

Событие детектора (M4). Используется в `AuditEntry` и `POST /api/agent/preview`.


| Поле              | Тип                           |
| ----------------- | ----------------------------- |
| `event_id`        | `uuid`                        |
| `gate_id`         | `string`                      |
| `triggered_by`    | `"tx_count" | "success_rate"` |
| `direction`       | `"LOW" | "HIGH"`              |
| `tx_state`        | `MetricState`                 |
| `sr_state`        | `SuccessRateState`            |
| `zeros_share`     | `number` [0, 1]               |
| `history_len`     | `integer`                     |
| `detected_at`     | `datetime`                    |
| `config_snapshot` | `DetectorConfig`              |


`MetricState`: `{ value, classification, direction, streak, baseline }`.  
`SuccessRateState` extends `MetricState` + `baseline_slices_count`.

### AgentReport

Результат hypothesis-агента (M7).


| Поле                     | Тип                                      |
| ------------------------ | ---------------------------------------- |
| `report_id`              | `uuid`                                   |
| `event_id`               | `uuid`                                   |
| `instruction_id`         | `uuid | null`                            |
| `matched_instruction_id` | `uuid | null`                            |
| `prompt_rendered`        | `string`                                 |
| `tool_calls`             | `ToolCall[]`                             |
| `conclusion`             | `string | null`                          |
| `latency_ms`             | `integer`                                |
| `status`                 | `"success" | "skipped" | "error"`        |
| `error`                  | `string | null`                          |
| `decision`               | `"close_fast" | "escalate" | null`       |
| `severity`               | `"info" | "warning" | "critical" | null` |
| `usage_run_id`           | `uuid | null`                            |
| `usage`                  | `TokenUsage | null`                      |
| `created_at`             | `datetime`                               |


### AuditEntry

Запись audit (M8).


| Поле              | Тип                                         |
| ----------------- | ------------------------------------------- |
| `audit_id`        | `uuid`                                      |
| `tick_id`         | `uuid`                                      |
| `event`           | `AnomalyEvent`                              |
| `report`          | `AgentReport`                               |
| `telegram_status` | `"pending" | "delivered" | "failed" | null` |
| `deep_chat`       | `DeepChatSlot | null`                       |
| `created_at`      | `datetime`                                  |


**DeepChatSlot:** `{ state, messages[], pending_action, session_id, updated_at }`  
**ChatMessage:** `{ message_id, role: "user"|"assistant"|"system", content, created_at }`  
**PendingAction:** `{ action_id, tool_name, arguments_preview, tool_call_id?, arguments?, created_at }`  
**DeepChatState:** `not_started | active | awaiting_approval | completed | cancelled | error`

`error` — recoverable: assistant-сообщение об ошибке в ленте, оператор может продолжить через `POST .../messages` (state → `active`). Терминальные состояния: только `completed` и `cancelled` (409 `deep_chat_terminal_state`).

**System message (deep chat, `role: "system"`):** machine-readable seed для FE. Обязательные строки (plain text, одна пара `ключ: значение` на строку):

| Ключ | Описание |
| ---- | -------- |
| `audit_id` | UUID audit |
| `gate_id` | Гейт события |
| `detected_at` | ISO datetime (naive MSK) |
| `conclusion` | `report.conclusion` hypothesis-агента (как есть) |
| `hypothesis_prompt` | Truncated `report.prompt_rendered` (опц.) |

FE извлекает hypothesis bubble из `conclusion:` (`extractHypothesisConclusionFromSystem`). User message с conclusion **не** создаётся API.

**Assistant message (hypothesis):** Markdown (react-markdown): заголовки ``##`` с emoji, списки, blockquote, inline `` `code` ``. Без HTML.

**Assistant message (deep):** Markdown (react-markdown): ``## 📈 Детекция``, ``## 🔧 Действия``, ``## 🎯 Итог``, … При исчерпании MCP auto-retry — ``state=error`` и текст ошибки в ленте; промежуточные неудачные SQL не показываются.

### ChatSnapshot

Polling deep chat (M16).


| Поле             | Тип                    |
| ---------------- | ---------------------- |
| `audit_id`       | `uuid`                 |
| `session_id`     | `uuid | null`          |
| `state`          | `DeepChatState`        |
| `messages`       | `ChatMessage[]`        |
| `pending_action` | `PendingAction | null` |
| `usage_total`    | `TokenUsage | null`    |


### SupportChatSnapshot

Polling support chat (M18, план). Владелец — `src/support_agent/models.py`.


| Поле                 | Тип                              |
| -------------------- | -------------------------------- |
| `chat_id`            | `uuid`                           |
| `user_id`            | `string`                         |
| `state`              | `"active" | "processing" | "error"` |
| `messages`           | `SupportMessage[]`               |
| `context_generation` | `integer`                        |
| `context_reset`      | `boolean`                        |
| `usage_total`        | `TokenUsage`                     |


**SupportMessage:** `{ message_id, role: "user"|"assistant"|"system", content, attachment_ids?: uuid[], created_at }`

**AttachmentUploadResponse** (после `POST .../attachments`): `{ attachment_id, filename, mime_type, size_bytes }` — без `storage_path`.

### TokenUsage


| Поле                 | Тип              |
| -------------------- | ---------------- |
| `model`              | `string`         |
| `prompt_tokens`      | `integer | null` |
| `completion_tokens`  | `integer | null` |
| `total_tokens`       | `integer | null` |
| `estimated_cost_usd` | `number | null`  |


`estimated_cost_usd` — оценка по `AGENT_PRICING_JSON` (per-model) или `AGENT_COST_PER_MILLION_TOKENS` (default **15** USD / 1M tokens). В deep chat — также в `ChatSnapshot.usage_total`.
---

## Observability

### GET /api/status

Агрегированный статус для мониторинга (M10): scheduler + последние audit + optional publisher.


|                 |                            |
| --------------- | -------------------------- |
| **Метод**       | `GET`                      |
| **Путь**        | `/api/status`                  |
| **Вход**        | —                          |
| **Auth (M18)**  | **не требуется** (allowlist) |
| **Выход `200`** | `AggregatedStatusResponse` |


**AggregatedStatusResponse:**


| Поле            | Тип                             |
| --------------- | ------------------------------- |
| `scheduler`     | `LastTickStateSnapshot`         |
| `recent_audits` | `AuditEntry[]` (последние 5)    |
| `publisher`     | `PublisherStatusSummary | null` |


**LastTickStateSnapshot:**


| Поле                      | Тип                                   |
| ------------------------- | ------------------------------------- |
| `created_at`              | `datetime`                            |
| `last_tick_at`            | `datetime | null`                     |
| `last_tick_started_at`    | `datetime | null`                     |
| `tick_in_progress`        | `boolean`                             |
| `current_tick_started_at` | `datetime | null`                     |
| `last_status`             | `"ok" | "no_events" | "error" | null` |
| `last_error_code`         | `string | null`                       |
| `ticks_total`             | `integer`                             |
| `ticks_error_total`       | `integer`                             |
| `recent_ticks`            | `TickResult[]` (до 10)                |


**PublisherStatusSummary** (если publisher инициализирован):


| Поле              | Тип               |
| ----------------- | ----------------- |
| `connected`       | `boolean`         |
| `exchange`        | `string`          |
| `last_publish_at` | `datetime | null` |


**Ошибки:**


| HTTP | `error_code`                  | Условие               |
| ---- | ----------------------------- | --------------------- |
| 503  | `scheduler_not_initialized`   | Scheduler не собран   |
| 503  | `audit_store_not_initialized` | Audit store не собран |


---

### POST /api/status/tick

Ручной запуск тика пайплайна (debug, M5).


|                 |                |
| --------------- | -------------- |
| **Метод**       | `POST`         |
| **Путь**        | `/api/status/tick` |
| **Вход**        | —              |
| **Выход `200`** | `TickResult`   |


**TickResult:**


| Поле          | Тип                            |
| ------------- | ------------------------------ |
| `tick_id`     | `uuid`                         |
| `gate_id`     | `string`                       |
| `started_at`  | `datetime`                     |
| `finished_at` | `datetime`                     |
| `status`      | `"ok" | "no_events" | "error"` |
| `n_events`    | `integer`                      |
| `error`       | `TickErrorCode | null`         |


HTTP 200 при любом бизнес-статусе тика.  
**Ошибки:** 503 `pipeline_not_initialized` — pipeline не собран.

> **Примечание:** отдельный `GET /status/publisher` реализован в `src/publisher/routes.py`, но в текущем `create_app()` не подключён; publisher доступен через поле `publisher` в `GET /api/status`.

---

## Gates (M13)

### GET /api/gates/active

Текущий активный гейт.


|                 |                 |
| --------------- | --------------- |
| **Метод**       | `GET`           |
| **Путь**        | `/api/gates/active` |
| **Вход**        | —               |
| **Выход `200`** | `GateInfo`      |


**GateInfo:** `{ "gate_id": string, "gate_name": string }`

**Ошибки:**


| HTTP | `error_code`               |
| ---- | -------------------------- |
| 404  | `no_active_gate`           |
| 503  | `pipeline_not_initialized` |


---

### POST /api/gates/{gate_id}/activate

Смена активного гейта: MySQL validate → Mongo upsert → reschedule scheduler.


|                 |                                  |
| --------------- | -------------------------------- |
| **Метод**       | `POST`                           |
| **Путь**        | `/api/gates/{gate_id}/activate`      |
| **Вход (path)** | `gate_id: string` (min length 1) |
| **Выход `200`** | `GateInfo`                       |


**Ошибки:**


| HTTP | `error_code`                                        |
| ---- | --------------------------------------------------- |
| 404  | `gate_not_found`                                    |
| 503  | `pipeline_not_initialized`, `scheduler_not_started` |


---

## Settings — detector config (M2)

Префикс: `/api/settings`.

### GET /api/settings/detector

Список всех конфигов (global + per-gate overrides).


|                 |                      |
| --------------- | -------------------- |
| **Метод**       | `GET`                |
| **Путь**        | `/api/settings/detector` |
| **Вход**        | —                    |
| **Выход `200`** | `DetectorConfig[]`   |


---

### GET /api/settings/detector/effective

Effective конфиг после fallback `gate → global`.


|                  |                                             |
| ---------------- | ------------------------------------------- |
| **Метод**        | `GET`                                       |
| **Путь**         | `/api/settings/detector/effective`              |
| **Вход (query)** | `gate_id?: string` — опущен → только global |
| **Выход `200`**  | `DetectorConfig`                            |


**Ошибки:** 404 `config_not_found`, 500 `config_corrupted`

---

### PATCH /api/settings/detector

Partial update global конфига.


|                 |                       |
| --------------- | --------------------- |
| **Метод**       | `PATCH`               |
| **Путь**        | `/api/settings/detector`  |
| **Вход (body)** | `DetectorConfigPatch` |
| **Выход `200`** | `DetectorConfig`      |


**Ошибки:** 404 `config_not_found`, 409 `config_conflict`, 422 `config_validation_failed`, 500 `config_corrupted`

---

### PATCH /api/settings/detector/{gate_id}

Upsert per-gate override.


|                 |                                |
| --------------- | ------------------------------ |
| **Метод**       | `PATCH`                        |
| **Путь**        | `/api/settings/detector/{gate_id}` |
| **Вход (path)** | `gate_id: string`              |
| **Вход (body)** | `DetectorConfigPatch`          |
| **Выход `200`** | `DetectorConfig`               |


**Ошибки:** те же, что PATCH global (404 если нет global)

---

### DELETE /api/settings/detector/{gate_id}

Удалить per-gate override.


|                 |                                          |
| --------------- | ---------------------------------------- |
| **Метод**       | `DELETE`                                 |
| **Путь**        | `/api/settings/detector/{gate_id}`           |
| **Вход (path)** | `gate_id: string`                        |
| **Выход `200`** | `{ "deleted": true, "gate_id": string }` |


**Ошибки:** 404 `config_not_found`

---

### POST /api/settings/detector/reset

Сброс global к `DEFAULT_GLOBAL_CONFIG`.


|                 |                            |
| --------------- | -------------------------- |
| **Метод**       | `POST`                     |
| **Путь**        | `/api/settings/detector/reset` |
| **Вход**        | —                          |
| **Выход `204`** | No Content                 |


**Ошибки:** 404, 409, 500

---

## Settings — instructions (M6)

### GET /api/settings/instructions

Список всех инструкций.


|                  |                                            |
| ---------------- | ------------------------------------------ |
| **Метод**        | `GET`                                      |
| **Путь**         | `/api/settings/instructions`                   |
| **Вход (query)** | `enabled_only?: boolean` (default `false`) |
| **Выход `200`**  | `AgentInstruction[]`                       |


---

### GET /api/settings/instructions/{instruction_id}

Одна инструкция по UUID.


|                 |                                           |
| --------------- | ----------------------------------------- |
| **Метод**       | `GET`                                     |
| **Путь**        | `/api/settings/instructions/{instruction_id}` |
| **Вход (path)** | `instruction_id: uuid`                    |
| **Выход `200`** | `AgentInstruction`                        |


**Ошибки:** 404 `instruction_not_found`, 500 `instruction_corrupted`

---

### POST /api/settings/instructions

Создать инструкцию.


|                 |                                                                       |
| --------------- | --------------------------------------------------------------------- |
| **Метод**       | `POST`                                                                |
| **Путь**        | `/api/settings/instructions`                                              |
| **Вход (body)** | `AgentInstructionCreate`                                              |
| **Выход `201`** | `AgentInstruction` + header `Location: /settings/instructions/{uuid}` |


**AgentInstructionCreate:**


| Поле              | Тип                        |
| ----------------- | -------------------------- |
| `name`            | `string`                   |
| `enabled`         | `boolean` (default `true`) |
| `match`           | `MatchPredicate`           |
| `action`          | `Action`                   |
| `prompt_template` | `string`                   |


**Ошибки:** 409 `instruction_conflict`, 422 `request_validation_failed`, 500 `instruction_corrupted`

---

### PATCH /api/settings/instructions/{instruction_id}

Partial update инструкции.


|                 |                                           |
| --------------- | ----------------------------------------- |
| **Метод**       | `PATCH`                                   |
| **Путь**        | `/api/settings/instructions/{instruction_id}` |
| **Вход (path)** | `instruction_id: uuid`                    |
| **Вход (body)** | `AgentInstructionPatch`                   |
| **Выход `200`** | `AgentInstruction`                        |


**AgentInstructionPatch:** все поля optional (`name`, `enabled`, `match`, `action`, `prompt_template`).

---

### DELETE /api/settings/instructions/{instruction_id}


|                 |                                               |
| --------------- | --------------------------------------------- |
| **Метод**       | `DELETE`                                      |
| **Путь**        | `/api/settings/instructions/{instruction_id}`     |
| **Вход (path)** | `instruction_id: uuid`                        |
| **Выход `200`** | `{ "deleted": true, "instruction_id": uuid }` |


---

### POST /api/settings/instructions/match

Preview матчинга без эмита события.


|                 |                                |
| --------------- | ------------------------------ |
| **Метод**       | `POST`                         |
| **Путь**        | `/api/settings/instructions/match` |
| **Вход (body)** | `MatchEventContext`            |
| **Выход `200`** | `MatchPreviewResponse`         |


**MatchEventContext:**


| Поле                   | Тип                                          |
| ---------------------- | -------------------------------------------- |
| `gate_id`              | `string`                                     |
| `triggered_by`         | `"tx_count" | "success_rate"`                |
| `direction`            | `"LOW" | "HIGH"`                             |
| `other_classification` | `"LOW" | "NORMAL" | "HIGH" | "INSUFFICIENT"` |
| `zeros_share`          | `number` [0, 1]                              |


**MatchPreviewResponse:**


| Поле         | Тип                                          |
| ------------ | -------------------------------------------- |
| `matched`    | `AgentInstruction | null`                    |
| `candidates` | `{ instruction_id, name, score: [int×5] }[]` |


---

## Audit (M8)

### GET /api/audit/recent

Последние audit-записи (новые первыми).


|                  |                                       |
| ---------------- | ------------------------------------- |
| **Метод**        | `GET`                                 |
| **Путь**         | `/api/audit/recent`                       |
| **Вход (query)** | `limit?: integer` (default 20, 1–200) |
| **Выход `200`**  | `AuditEntry[]`                        |


**Ошибки:** 503 `audit_store_not_initialized`

---

### GET /api/audit/{audit_id}

Полная запись audit по ID.


|                 |                     |
| --------------- | ------------------- |
| **Метод**       | `GET`               |
| **Путь**        | `/api/audit/{audit_id}` |
| **Вход (path)** | `audit_id: uuid`    |
| **Выход `200`** | `AuditEntry`        |


**Ошибки:** 404 `audit_entry_not_found`, 503 `audit_store_not_initialized`

---

## Deep cases list (M8)

### GET /api/deep/cases

Список deep cases для SPA `/deep`.


|                  |                    |
| ---------------- | ------------------ |
| **Метод**        | `GET`              |
| **Путь**         | `/api/deep/cases`      |
| **Вход (query)** | см. ниже           |
| **Выход `200`**  | `DeepCaseListPage` |


**Query-параметры:**


| Параметр    | Тип        | Описание                      |
| ----------- | ---------- | ----------------------------- |
| `gate_id`   | `string`   | Фильтр по гейту               |
| `from`      | `datetime` | Начало периода (`created_at`) |
| `to`        | `datetime` | Конец периода                 |
| `page`      | `integer`  | default 1                     |
| `page_size` | `integer`  | default 50, max 200           |


**DeepCaseListPage:**


| Поле        | Тип                 |
| ----------- | ------------------- |
| `items`     | `DeepCaseSummary[]` |
| `total`     | `integer`           |
| `page`      | `integer`           |
| `page_size` | `integer`           |


**DeepCaseSummary:**


| Поле              | Тип             |
| ----------------- | --------------- |
| `audit_id`        | `uuid`          |
| `gate_id`         | `string`        |
| `created_at`      | `datetime`      |
| `event_summary`   | `string`        |
| `conclusion`      | `string | null` | `report.conclusion`; `null` при `skipped`/`error` |
| `deep_chat_state` | `DeepChatState` |


---

## Deep chat (M16)

Префикс: `/api/deep/cases/{audit_id}`.

Human-in-the-loop **не используется**: при tool proposal на `open` / `messages` MCP execute **автоматически** в том же запросе. Эндпоинты `approve` / `reject` — legacy для старых сессий с `pending_action`.

**Типичный флоу (SPA `/deep/{audit_id}`):**

1. `deep_chat_state=not_started` → `POST .../chat/open` (session seed: только `system`, без LLM).
2. Оператор пишет в composer → `POST .../messages` (propose + auto MCP execute при tool).
3. Snapshot: `messages[]` растёт `[system, user, assistant, …]`; hypothesis UI — из `system.conclusion`.
4. Ошибки backend/MCP/LLM — `assistant` в ленте, `state=error` (recoverable новым сообщением).
5. Polling `GET .../chat`.

Один tool на шаг; в тексте агента до 3 пунктов в `🔧 Действия`.

### POST /api/deep/cases/{audit_id}/chat/open

Открыть deep chat для audit (идемпотентно).

При **первом** open для audit:

1. Создаёт `session_id`, пишет `system` message (audit seed).
2. Инициализирует LLM history (`system` prompt); **без** вызова модели.

Повторный вызов при `active` / `error` / legacy `awaiting_approval` → `200` с текущим snapshot без мутаций.

Ответ агента — только через `POST .../messages`.


|                 |                                    |
| --------------- | ---------------------------------- |
| **Метод**       | `POST`                             |
| **Путь**        | `/api/deep/cases/{audit_id}/chat/open` |
| **Вход (path)** | `audit_id: uuid`                   |
| **Вход (body)** | —                                  |
| **Выход `200`** | `ChatSnapshot`                     |


**Ошибки:** 404 `audit_entry_not_found`, 409 `deep_chat_terminal_state` (только `completed`/`cancelled`), 409 `budget_exceeded`, 409 `tool_not_whitelisted`, 503 `deep_analyst_not_initialized`

**Примечание:** `open` быстрый (без LLM). Долгие запросы — на `POST .../messages`.

---

### POST /api/deep/cases/{audit_id}/chat/messages

Отправить сообщение оператора — LLM propose + auto MCP execute при tool_calls.


|                 |                                        |
| --------------- | -------------------------------------- |
| **Метод**       | `POST`                                 |
| **Путь**        | `/api/deep/cases/{audit_id}/chat/messages` |
| **Вход (path)** | `audit_id: uuid`                       |
| **Вход (body)** | `{ "content": string }` (min length 1) |
| **Выход `200`** | `ChatSnapshot`                         |


**Ошибки:** 409 `pending_action_blocks_message`, 409 `budget_exceeded`, 409 `tool_not_whitelisted`

---

### POST /api/deep/cases/{audit_id}/actions/{action_id}/approve

Legacy: подтвердить pending MCP step (старые сессии с `awaiting_approval`).


|                 |                                                      |
| --------------- | ---------------------------------------------------- |
| **Метод**       | `POST`                                               |
| **Путь**        | `/api/deep/cases/{audit_id}/actions/{action_id}/approve` |
| **Вход (path)** | `audit_id: uuid`, `action_id: uuid`                  |
| **Вход (body)** | —                                                    |
| **Выход `200`** | `ChatSnapshot` (`pending_action: null`, `state: active`) |


**Ошибки:** 404 `pending_action_not_found`, 409 `budget_exceeded`, 409 `tool_not_whitelisted`

---

### POST /api/deep/cases/{audit_id}/actions/{action_id}/reject

Отклонить pending MCP step без backend MCP run.


|                 |                                                     |
| --------------- | --------------------------------------------------- |
| **Метод**       | `POST`                                              |
| **Путь**        | `/api/deep/cases/{audit_id}/actions/{action_id}/reject` |
| **Вход (path)** | `audit_id: uuid`, `action_id: uuid`                 |
| **Вход (body)** | —                                                   |
| **Выход `200`** | `ChatSnapshot` (`pending_action: null`, `state: active`) |


**Ошибки:** 404 `pending_action_not_found`

---

### GET /api/deep/cases/{audit_id}/chat

Polling snapshot deep chat (read-only).


|                 |                               |
| --------------- | ----------------------------- |
| **Метод**       | `GET`                         |
| **Путь**        | `/api/deep/cases/{audit_id}/chat` |
| **Вход (path)** | `audit_id: uuid`              |
| **Выход `200`** | `ChatSnapshot`                |


---

## Auth (M18, план)

MVP session auth для всего `anomaly-api`. Владелец — `src/auth/`. Opaque Bearer token в Mongo `auth_sessions`; seed user `admin`/`admin` (`AUTH_ADMIN_USERNAME` / `AUTH_ADMIN_PASSWORD`).

### Global guard

После внедрения M18 все `/api/*` требуют заголовок `Authorization: Bearer <token>`, **кроме allowlist:**


| Путь                     | Метод  | Примечание                |
| ------------------------ | ------ | ------------------------- |
| `/api/auth/login`        | `POST` | Выдача токена             |
| `/api/status`            | `GET`  | Observability без логина  |
| `/docs`, `/openapi.json` | `GET`  | OpenAPI                   |


Остальные эндпоинты этого документа (включая `POST /api/status/tick`, deep, settings, audit, agent) — **protected**.

**Ошибки auth (общие):**


| HTTP | `error_code`          | Условие                                      |
| ---- | --------------------- | -------------------------------------------- |
| 401  | `not_authenticated`   | Нет / невалидный / истёкший Bearer           |
| 401  | `invalid_credentials` | Неверный login/password (`POST /api/auth/login`) |


### POST /api/auth/login


|                 |                                      |
| --------------- | ------------------------------------ |
| **Метод**       | `POST`                               |
| **Путь**        | `/api/auth/login`                    |
| **Auth**        | не требуется                         |
| **Вход (body)** | `{ "username": string, "password": string }` |
| **Выход `200`** | `LoginResponse`                      |


**LoginResponse:**


| Поле         | Тип                                      |
| ------------ | ---------------------------------------- |
| `token`      | `string` — opaque session token          |
| `user_id`    | `string`                                 |
| `username`   | `string`                                 |
| `expires_at` | `datetime` — MSK naive                   |


Повторный login MVP инвалидирует предыдущие сессии того же пользователя.

### POST /api/auth/logout


|                 |                 |
| --------------- | --------------- |
| **Метод**       | `POST`          |
| **Путь**        | `/api/auth/logout` |
| **Auth**        | `Bearer` (обязателен) |
| **Вход**        | —               |
| **Выход `200`** | `{ "ok": true }` |


Удаляет документ сессии; последующие запросы с тем же token → 401.

### GET /api/auth/me


|                 |                    |
| --------------- | ------------------ |
| **Метод**       | `GET`              |
| **Путь**        | `/api/auth/me`     |
| **Auth**        | `Bearer` (обязателен) |
| **Выход `200`** | `AuthUserPublic`   |


**AuthUserPublic:** `{ user_id, username, created_at }` — без `password_hash`.

---

## Support chat (M18, план)

User-centric support-чат с auto-execute MCP. Владелец — `src/support_agent/`. `user_id` из сессии (`get_current_user`); клиент не передаёт `user_id`. Один чат на пользователя (lazy create на `GET`).

Transport — polling `GET /api/support/chat`, интервал **1–2 с** при `state=processing` (M17).

### GET /api/support/chat


|                 |                      |
| --------------- | -------------------- |
| **Метод**       | `GET`                |
| **Путь**        | `/api/support/chat`  |
| **Auth**        | `Bearer` (обязателен) |
| **Выход `200`** | `SupportChatSnapshot` |


Если документа чата нет — создаётся пустой чат для `user_id` из сессии.

### POST /api/support/chat/messages


|                 |                                                      |
| --------------- | ---------------------------------------------------- |
| **Метод**       | `POST`                                               |
| **Путь**        | `/api/support/chat/messages`                         |
| **Auth**        | `Bearer` (обязателен)                                |
| **Вход (body)** | `{ "content"?: string, "attachment_ids"?: uuid[] }` |
| **Выход `200`** | `SupportChatSnapshot`                                |


Хотя бы одно из `content` (непустой) или `attachment_ids` обязательно.


| HTTP | `error_code`    | Условие                          |
| ---- | --------------- | -------------------------------- |
| 409  | `chat_processing` | `state=processing`             |
| 422  | validation      | Пустое сообщение без вложений    |


При `len(user+assistant messages) >= SUPPORT_MAX_HISTORY_MESSAGES` перед обработкой — ротация: wipe `messages` + `llm_messages`, `context_generation++`, `context_reset=true` в snapshot (M15 context в system prompt не очищается).

### POST /api/support/chat/attachments


|                 |                                      |
| --------------- | ------------------------------------ |
| **Метод**       | `POST`                               |
| **Путь**        | `/api/support/chat/attachments`      |
| **Auth**        | `Bearer` (обязателен)                |
| **Вход**        | `multipart/form-data`, поле `file`   |
| **Выход `200`** | `AttachmentUploadResponse`           |


Бинарник — filesystem; metadata — Mongo `support_attachments`. Чужой `attachment_id` → 404 `attachment_not_found`.


| HTTP | `error_code`        | Условие                         |
| ---- | ------------------- | ------------------------------- |
| 422  | `attachment_rejected` | Превышен размер / bad mime    |


### POST /api/support/chat/reset


|                 |                      |
| --------------- | -------------------- |
| **Метод**       | `POST`               |
| **Путь**        | `/api/support/chat/reset` |
| **Auth**        | `Bearer` (обязателен) |
| **Вход**        | —                    |
| **Выход `200`** | `SupportChatSnapshot` |


Явный сброс истории: очистка `messages` + `llm_messages`, `context_generation++`, `context_reset=true`.

---

## Agent — debug preview (M7)

### POST /api/agent/preview

Preview обработки одного `AnomalyEvent` через hypothesis-агента.


|                 |                  |
| --------------- | ---------------- |
| **Метод**       | `POST`           |
| **Путь**        | `/api/agent/preview` |
| **Вход (body)** | `PreviewRequest` |
| **Выход `200`** | `AgentReport`    |


**PreviewRequest:**


| Поле                 | Тип                         | Описание                              |
| -------------------- | --------------------------- | ------------------------------------- |
| `event`              | `AnomalyEvent`              | Событие для обработки                 |
| `dry_run`            | `boolean`                   | default `true` — заглушки backend/SQL |
| `scripted_responses` | `BackendRunResult[] | null` | Ответы scripted backend при `dry_run` |


Бизнес-ошибки (backend/SQL/M6) возвращаются в `AgentReport.status` при HTTP 200.

**Ошибки HTTP:** 422 `request_validation_failed`, 503 `pipeline_not_initialized` (runner не собран), 500 `unexpected_error`

---

## Agent — contexts (M15)

### GET /api/agent/contexts

Список контекстов агентов с pagination.


|                  |                                                                                                                             |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Метод**        | `GET`                                                                                                                       |
| **Путь**         | `/api/agent/contexts`                                                                                                           |
| **Вход (query)** | `agent_kind?: "hypothesis" | "deep" | "support"`, `gate_id?: string`, `page?: int` (default 1), `page_size?: int` (default 50, max 200) |
| **Выход `200`**  | `AgentContextListPage`                                                                                                      |


**AgentContextListPage:** `{ items: AgentContext[], total, page, page_size }`

**AgentContext:**


| Поле           | Тип                                                          |
| -------------- | ------------------------------------------------------------ |
| `context_id`   | `uuid`                                                       |
| `agent_kind`   | `"hypothesis" | "deep" | "support"`                  |
| `gate_id`      | `string | null`                                              |
| `context_body` | `string` (max `AGENT_CONTEXT_MAX_BODY_CHARS`, default 32768) |
| `created_at`   | `datetime`                                                   |
| `updated_at`   | `datetime`                                                   |


---

### GET /api/agent/contexts/{context_id}


|                 |                                |
| --------------- | ------------------------------ |
| **Метод**       | `GET`                          |
| **Путь**        | `/api/agent/contexts/{context_id}` |
| **Вход (path)** | `context_id: uuid`             |
| **Выход `200`** | `AgentContext`                 |


**Ошибки:** 404 `context_not_found`, 503 `context_store_unavailable`

---

### PUT /api/agent/contexts

Upsert по business key `(agent_kind, gate_id)`.


|                 |                      |
| --------------- | -------------------- |
| **Метод**       | `PUT`                |
| **Путь**        | `/api/agent/contexts`    |
| **Вход (body)** | `AgentContextUpsert` |
| **Выход `200`** | `AgentContext`       |


**AgentContextUpsert:**


| Поле           | Тип                     |
| -------------- | ----------------------- |
| `agent_kind`   | `"hypothesis" | "deep" | "support"` |
| `gate_id`      | `string | null`         |
| `context_body` | `string`                |


---

### DELETE /api/agent/contexts/{context_id}


|                 |                                           |
| --------------- | ----------------------------------------- |
| **Метод**       | `DELETE`                                  |
| **Путь**        | `/api/agent/contexts/{context_id}`            |
| **Вход (path)** | `context_id: uuid`                        |
| **Выход `200`** | `{ "deleted": true, "context_id": uuid }` |


---

## Agent — usage (M14)

Read-only. Запись runs — через `UsageRecorder` (M7/M16), не через HTTP.

### GET /api/agent/usage/runs

Список usage runs с фильтрами.


|                  |                     |
| ---------------- | ------------------- |
| **Метод**        | `GET`               |
| **Путь**         | `/api/agent/usage/runs` |
| **Вход (query)** | см. ниже            |
| **Выход `200`**  | `UsageRunListPage`  |


**Query-параметры:**


| Параметр     | Тип                             |
| ------------ | ------------------------------- |
| `gate_id`    | `string`                        |
| `agent_kind` | `"hypothesis" | "deep" | "support"`         |
| `audit_id`   | `uuid`                          |
| `from`       | `datetime`                      |
| `to`         | `datetime`                      |
| `page`       | `integer` (default 1)           |
| `page_size`  | `integer` (default 50, max 200) |


**UsageRunListPage:** `{ items: AgentUsageRun[], total, page, page_size }`

**AgentUsageRun:**


| Поле                 | Тип                               |
| -------------------- | --------------------------------- |
| `run_id`             | `uuid`                            |
| `agent_kind`         | `"hypothesis" | "deep" | "support"`     |
| `gate_id`            | `string | null`                   |
| `audit_id`           | `uuid | null`                     |
| `session_id`         | `uuid | null`                     |
| `provider_run_id`    | `string | null`                   |
| `model`              | `string`                          |
| `prompt_tokens`      | `integer | null`                  |
| `completion_tokens`  | `integer | null`                  |
| `total_tokens`       | `integer | null`                  |
| `estimated_cost_usd` | `number | null`                   |
| `latency_ms`         | `integer`                         |
| `status`             | `"success" | "error" | "skipped"` |
| `error`              | `string | null`                   |
| `step_breakdown`     | `{ tool_name, latency_ms }[]`     |
| `created_at`         | `datetime`                        |


---

### GET /api/agent/usage/runs/{run_id}


|                 |                              |
| --------------- | ---------------------------- |
| **Метод**       | `GET`                        |
| **Путь**        | `/api/agent/usage/runs/{run_id}` |
| **Вход (path)** | `run_id: uuid`               |
| **Выход `200`** | `AgentUsageRun`              |


**Ошибки:** 404 `usage_run_not_found`

---

### GET /api/agent/usage/daily

Дневные агрегаты deep usage.


|                  |                                                          |
| ---------------- | -------------------------------------------------------- |
| **Метод**        | `GET`                                                    |
| **Путь**         | `/api/agent/usage/daily`                                     |
| **Вход (query)** | `gate_id?: string`, `date_from?: date`, `date_to?: date` |
| **Выход `200`**  | `AgentUsageDailyRollup[]`                                |


**AgentUsageDailyRollup:**


| Поле             | Тип       |
| ---------------- | --------- |
| `date`           | `date`    |
| `gate_id`        | `string`  |
| `agent_kind`     | `"hypothesis" | "deep" | "support"` |
| `total_tokens`   | `integer` |
| `total_cost_usd` | `number`  |
| `run_count`      | `integer` |


---

## Сводная таблица эндпоинтов


| Метод    | Путь                                                 | Модуль | Auth (M18)   | Назначение                   |
| -------- | ---------------------------------------------------- | ------ | ------------ | ---------------------------- |
| `GET`    | `/api/status`                                        | M10    | public       | Агрегированный observability |
| `POST`   | `/api/status/tick`                                   | M5     | Bearer       | Ручной тик (debug)           |
| `POST`   | `/api/auth/login`                                    | M18    | public       | Login → token                |
| `POST`   | `/api/auth/logout`                                   | M18    | Bearer       | Invalidate session           |
| `GET`    | `/api/auth/me`                                       | M18    | Bearer       | Текущий пользователь         |
| `GET`    | `/api/support/chat`                                  | M18    | Bearer       | Support snapshot (polling)   |
| `POST`   | `/api/support/chat/messages`                         | M18    | Bearer       | Сообщение в support chat     |
| `POST`   | `/api/support/chat/attachments`                      | M18    | Bearer       | Upload вложения              |
| `POST`   | `/api/support/chat/reset`                            | M18    | Bearer       | Сброс истории support chat   |
| `GET`    | `/api/gates/active`                                  | M13    | Bearer*      | Текущий активный гейт        |
| `POST`   | `/api/gates/{gate_id}/activate`                          | M13    | Bearer*      | Смена активного гейта        |
| `GET`    | `/api/settings/detector`                                 | M2     | Bearer*      | Список конфигов              |
| `GET`    | `/api/settings/detector/effective`                       | M2     | Bearer*      | Effective конфиг             |
| `PATCH`  | `/api/settings/detector`                                 | M2     | Bearer*      | PATCH global                 |
| `PATCH`  | `/api/settings/detector/{gate_id}`                       | M2     | Bearer*      | PATCH override               |
| `DELETE` | `/api/settings/detector/{gate_id}`                       | M2     | Bearer*      | Удалить override             |
| `POST`   | `/api/settings/detector/reset`                           | M2     | Bearer*      | Сброс global                 |
| `GET`    | `/api/settings/instructions`                             | M6     | Bearer*      | Список инструкций            |
| `GET`    | `/api/settings/instructions/{id}`                        | M6     | Bearer*      | Инструкция по ID             |
| `POST`   | `/api/settings/instructions`                             | M6     | Bearer*      | Создать инструкцию           |
| `PATCH`  | `/api/settings/instructions/{id}`                        | M6     | Bearer*      | PATCH инструкции             |
| `DELETE` | `/api/settings/instructions/{id}`                        | M6     | Bearer*      | Удалить инструкцию           |
| `POST`   | `/api/settings/instructions/match`                       | M6     | Bearer*      | Preview матчинга             |
| `GET`    | `/api/audit/recent`                                      | M8     | Bearer*      | Последние audit              |
| `GET`    | `/api/audit/{audit_id}`                                  | M8     | Bearer*      | Audit по ID                  |
| `GET`    | `/api/deep/cases`                                        | M8     | Bearer*      | Список deep cases            |
| `POST`   | `/api/deep/cases/{audit_id}/chat/open`                   | M16    | Bearer*      | Open session (system seed)   |
| `POST`   | `/api/deep/cases/{audit_id}/chat/messages`               | M16    | Bearer*      | Message + auto MCP           |
| `POST`   | `/api/deep/cases/{audit_id}/actions/{action_id}/approve` | M16    | Bearer*      | Legacy approve pending       |
| `POST`   | `/api/deep/cases/{audit_id}/actions/{action_id}/reject`  | M16    | Bearer*      | Reject MCP step              |
| `GET`    | `/api/deep/cases/{audit_id}/chat`                        | M16    | Bearer*      | Polling snapshot             |
| `POST`   | `/api/agent/preview`                                     | M7     | Bearer*      | Debug preview агента         |
| `GET`    | `/api/agent/contexts`                                    | M15    | Bearer*      | Список контекстов            |
| `GET`    | `/api/agent/contexts/{context_id}`                       | M15    | Bearer*      | Контекст по ID               |
| `PUT`    | `/api/agent/contexts`                                    | M15    | Bearer*      | Upsert контекста             |
| `DELETE` | `/api/agent/contexts/{context_id}`                       | M15    | Bearer*      | Удалить контекст             |
| `GET`    | `/api/agent/usage/runs`                                  | M14    | Bearer*      | Список usage runs            |
| `GET`    | `/api/agent/usage/runs/{run_id}`                         | M14    | Bearer*      | Usage run по ID              |
| `GET`    | `/api/agent/usage/daily`                                 | M14    | Bearer*      | Daily rollup                 |

\* Колонка **Auth (M18)** — после внедрения M18; до этого эндпоинты без аутентификации.

---

## См. также

- Модульная документация: `docs/modules/`
- План M18 (support + auth): `.cursor/plans/R2/module-18-support-agent.plan.md`
- Swagger (интерактивно): `http://127.0.0.1:8000/docs`
- Runbook: `docs/runbook.md`

