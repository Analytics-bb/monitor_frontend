---

## title: "anomaly-api — HTTP API"
last_reviewed: "2026-06-26"

# anomaly-api — HTTP API

Единая точка входа: `apps/anomaly_api/main.py` (`uvicorn apps.anomaly_api.main:app`).

- **Базовый URL (локально):** `http://127.0.0.1:8000`
- **OpenAPI / Swagger:** `http://127.0.0.1:8000/docs`
- **Аутентификация:** нет (R1/R2 — защита на уровне сети/деплоя)
- **Формат ошибок (доменные):** `{ "error_code": string, "message": string, "details": object }`
- **Временные метки:** naive MSK (`tzinfo=None`), ISO 8601 в JSON

Источники: `src/*/routes.py`, Pydantic-модели в `src/*/models.py`, модульные документы в `docs/modules/`.

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

Событие детектора (M4). Используется в `AuditEntry` и `POST /agent/preview`.


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
**PendingAction:** `{ action_id, tool_name, arguments_preview, created_at }`  
**DeepChatState:** `not_started | active | awaiting_approval | completed | cancelled | error`

### ChatSnapshot

Polling deep chat (M16).


| Поле             | Тип                    |
| ---------------- | ---------------------- |
| `audit_id`       | `uuid`                 |
| `session_id`     | `uuid | null`          |
| `state`          | `DeepChatState`        |
| `messages`       | `ChatMessage[]`        |
| `pending_action` | `PendingAction | null` |


### TokenUsage


| Поле                 | Тип              |
| -------------------- | ---------------- |
| `model`              | `string`         |
| `prompt_tokens`      | `integer | null` |
| `completion_tokens`  | `integer | null` |
| `total_tokens`       | `integer | null` |
| `estimated_cost_usd` | `number | null`  |


---

## Observability

### GET /status

Агрегированный статус для мониторинга (M10): scheduler + последние audit + optional publisher.


|                 |                            |
| --------------- | -------------------------- |
| **Метод**       | `GET`                      |
| **Путь**        | `/status`                  |
| **Вход**        | —                          |
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

### POST /status/tick

Ручной запуск тика пайплайна (debug, M5).


|                 |                |
| --------------- | -------------- |
| **Метод**       | `POST`         |
| **Путь**        | `/status/tick` |
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

> **Примечание:** отдельный `GET /status/publisher` реализован в `src/publisher/routes.py`, но в текущем `create_app()` не подключён; publisher доступен через поле `publisher` в `GET /status`.

---

## Gates (M13)

### GET /gates/active

Текущий активный гейт.


|                 |                 |
| --------------- | --------------- |
| **Метод**       | `GET`           |
| **Путь**        | `/gates/active` |
| **Вход**        | —               |
| **Выход `200`** | `GateInfo`      |


**GateInfo:** `{ "gate_id": string, "gate_name": string }`

**Ошибки:**


| HTTP | `error_code`               |
| ---- | -------------------------- |
| 404  | `no_active_gate`           |
| 503  | `pipeline_not_initialized` |


---

### POST /gates/{gate_id}/activate

Смена активного гейта: MySQL validate → Mongo upsert → reschedule scheduler.


|                 |                                  |
| --------------- | -------------------------------- |
| **Метод**       | `POST`                           |
| **Путь**        | `/gates/{gate_id}/activate`      |
| **Вход (path)** | `gate_id: string` (min length 1) |
| **Выход `200`** | `GateInfo`                       |


**Ошибки:**


| HTTP | `error_code`                                        |
| ---- | --------------------------------------------------- |
| 404  | `gate_not_found`                                    |
| 503  | `pipeline_not_initialized`, `scheduler_not_started` |


---

## Settings — detector config (M2)

Префикс: `/settings`.

### GET /settings/detector

Список всех конфигов (global + per-gate overrides).


|                 |                      |
| --------------- | -------------------- |
| **Метод**       | `GET`                |
| **Путь**        | `/settings/detector` |
| **Вход**        | —                    |
| **Выход `200`** | `DetectorConfig[]`   |


---

### GET /settings/detector/effective

Effective конфиг после fallback `gate → global`.


|                  |                                             |
| ---------------- | ------------------------------------------- |
| **Метод**        | `GET`                                       |
| **Путь**         | `/settings/detector/effective`              |
| **Вход (query)** | `gate_id?: string` — опущен → только global |
| **Выход `200`**  | `DetectorConfig`                            |


**Ошибки:** 404 `config_not_found`, 500 `config_corrupted`

---

### PATCH /settings/detector

Partial update global конфига.


|                 |                       |
| --------------- | --------------------- |
| **Метод**       | `PATCH`               |
| **Путь**        | `/settings/detector`  |
| **Вход (body)** | `DetectorConfigPatch` |
| **Выход `200`** | `DetectorConfig`      |


**Ошибки:** 404 `config_not_found`, 409 `config_conflict`, 422 `config_validation_failed`, 500 `config_corrupted`

---

### PATCH /settings/detector/{gate_id}

Upsert per-gate override.


|                 |                                |
| --------------- | ------------------------------ |
| **Метод**       | `PATCH`                        |
| **Путь**        | `/settings/detector/{gate_id}` |
| **Вход (path)** | `gate_id: string`              |
| **Вход (body)** | `DetectorConfigPatch`          |
| **Выход `200`** | `DetectorConfig`               |


**Ошибки:** те же, что PATCH global (404 если нет global)

---

### DELETE /settings/detector/{gate_id}

Удалить per-gate override.


|                 |                                          |
| --------------- | ---------------------------------------- |
| **Метод**       | `DELETE`                                 |
| **Путь**        | `/settings/detector/{gate_id}`           |
| **Вход (path)** | `gate_id: string`                        |
| **Выход `200`** | `{ "deleted": true, "gate_id": string }` |


**Ошибки:** 404 `config_not_found`

---

### POST /settings/detector/reset

Сброс global к `DEFAULT_GLOBAL_CONFIG`.


|                 |                            |
| --------------- | -------------------------- |
| **Метод**       | `POST`                     |
| **Путь**        | `/settings/detector/reset` |
| **Вход**        | —                          |
| **Выход `204`** | No Content                 |


**Ошибки:** 404, 409, 500

---

## Settings — instructions (M6)

### GET /settings/instructions

Список всех инструкций.


|                  |                                            |
| ---------------- | ------------------------------------------ |
| **Метод**        | `GET`                                      |
| **Путь**         | `/settings/instructions`                   |
| **Вход (query)** | `enabled_only?: boolean` (default `false`) |
| **Выход `200`**  | `AgentInstruction[]`                       |


---

### GET /settings/instructions/{instruction_id}

Одна инструкция по UUID.


|                 |                                           |
| --------------- | ----------------------------------------- |
| **Метод**       | `GET`                                     |
| **Путь**        | `/settings/instructions/{instruction_id}` |
| **Вход (path)** | `instruction_id: uuid`                    |
| **Выход `200`** | `AgentInstruction`                        |


**Ошибки:** 404 `instruction_not_found`, 500 `instruction_corrupted`

---

### POST /settings/instructions

Создать инструкцию.


|                 |                                                                       |
| --------------- | --------------------------------------------------------------------- |
| **Метод**       | `POST`                                                                |
| **Путь**        | `/settings/instructions`                                              |
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

### PATCH /settings/instructions/{instruction_id}

Partial update инструкции.


|                 |                                           |
| --------------- | ----------------------------------------- |
| **Метод**       | `PATCH`                                   |
| **Путь**        | `/settings/instructions/{instruction_id}` |
| **Вход (path)** | `instruction_id: uuid`                    |
| **Вход (body)** | `AgentInstructionPatch`                   |
| **Выход `200`** | `AgentInstruction`                        |


**AgentInstructionPatch:** все поля optional (`name`, `enabled`, `match`, `action`, `prompt_template`).

---

### DELETE /settings/instructions/{instruction_id}


|                 |                                               |
| --------------- | --------------------------------------------- |
| **Метод**       | `DELETE`                                      |
| **Путь**        | `/settings/instructions/{instruction_id}`     |
| **Вход (path)** | `instruction_id: uuid`                        |
| **Выход `200`** | `{ "deleted": true, "instruction_id": uuid }` |


---

### POST /settings/instructions/match

Preview матчинга без эмита события.


|                 |                                |
| --------------- | ------------------------------ |
| **Метод**       | `POST`                         |
| **Путь**        | `/settings/instructions/match` |
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

### GET /audit/recent

Последние audit-записи (новые первыми).


|                  |                                       |
| ---------------- | ------------------------------------- |
| **Метод**        | `GET`                                 |
| **Путь**         | `/audit/recent`                       |
| **Вход (query)** | `limit?: integer` (default 20, 1–200) |
| **Выход `200`**  | `AuditEntry[]`                        |


**Ошибки:** 503 `audit_store_not_initialized`

---

### GET /audit/{audit_id}

Полная запись audit по ID.


|                 |                     |
| --------------- | ------------------- |
| **Метод**       | `GET`               |
| **Путь**        | `/audit/{audit_id}` |
| **Вход (path)** | `audit_id: uuid`    |
| **Выход `200`** | `AuditEntry`        |


**Ошибки:** 404 `audit_entry_not_found`, 503 `audit_store_not_initialized`

---

## Deep cases list (M8)

### GET /deep/cases

Список deep cases для SPA `/deep`.


|                  |                    |
| ---------------- | ------------------ |
| **Метод**        | `GET`              |
| **Путь**         | `/deep/cases`      |
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
| `conclusion`      | `string`        |
| `deep_chat_state` | `DeepChatState` |


---

## Deep chat (M16)

Префикс: `/deep/cases/{audit_id}`.

### POST /deep/cases/{audit_id}/chat/open

Открыть deep chat для audit.


|                 |                                    |
| --------------- | ---------------------------------- |
| **Метод**       | `POST`                             |
| **Путь**        | `/deep/cases/{audit_id}/chat/open` |
| **Вход (path)** | `audit_id: uuid`                   |
| **Вход (body)** | —                                  |
| **Выход `200`** | `ChatSnapshot`                     |


**Ошибки:** 404 `audit_entry_not_found`, 409 `deep_chat_terminal_state`, 503 `deep_analyst_not_initialized`

---

### POST /deep/cases/{audit_id}/chat/messages

Отправить сообщение оператора (без execute MCP).


|                 |                                        |
| --------------- | -------------------------------------- |
| **Метод**       | `POST`                                 |
| **Путь**        | `/deep/cases/{audit_id}/chat/messages` |
| **Вход (path)** | `audit_id: uuid`                       |
| **Вход (body)** | `{ "content": string }` (min length 1) |
| **Выход `200`** | `ChatSnapshot`                         |


**Ошибки:** 409 `pending_action_blocks_message`, 409 `budget_exceeded`

---

### POST /deep/cases/{audit_id}/actions/{action_id}/approve

Подтвердить pending MCP step: budget check + execute + usage.


|                 |                                                      |
| --------------- | ---------------------------------------------------- |
| **Метод**       | `POST`                                               |
| **Путь**        | `/deep/cases/{audit_id}/actions/{action_id}/approve` |
| **Вход (path)** | `audit_id: uuid`, `action_id: uuid`                  |
| **Вход (body)** | —                                                    |
| **Выход `200`** | `ChatSnapshot`                                       |


**Ошибки:** 404 `pending_action_not_found`, 409 `budget_exceeded`

---

### POST /deep/cases/{audit_id}/actions/{action_id}/reject

Отклонить pending MCP step без backend run.


|                 |                                                     |
| --------------- | --------------------------------------------------- |
| **Метод**       | `POST`                                              |
| **Путь**        | `/deep/cases/{audit_id}/actions/{action_id}/reject` |
| **Вход (path)** | `audit_id: uuid`, `action_id: uuid`                 |
| **Вход (body)** | —                                                   |
| **Выход `200`** | `ChatSnapshot`                                      |


**Ошибки:** 404 `pending_action_not_found`

---

### GET /deep/cases/{audit_id}/chat

Polling snapshot deep chat (read-only).


|                 |                               |
| --------------- | ----------------------------- |
| **Метод**       | `GET`                         |
| **Путь**        | `/deep/cases/{audit_id}/chat` |
| **Вход (path)** | `audit_id: uuid`              |
| **Выход `200`** | `ChatSnapshot`                |


---

## Agent — debug preview (M7)

### POST /agent/preview

Preview обработки одного `AnomalyEvent` через hypothesis-агента.


|                 |                  |
| --------------- | ---------------- |
| **Метод**       | `POST`           |
| **Путь**        | `/agent/preview` |
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

### GET /agent/contexts

Список контекстов агентов с pagination.


|                  |                                                                                                                             |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Метод**        | `GET`                                                                                                                       |
| **Путь**         | `/agent/contexts`                                                                                                           |
| **Вход (query)** | `agent_kind?: "hypothesis" | "deep"`, `gate_id?: string`, `page?: int` (default 1), `page_size?: int` (default 50, max 200) |
| **Выход `200`**  | `AgentContextListPage`                                                                                                      |


**AgentContextListPage:** `{ items: AgentContext[], total, page, page_size }`

**AgentContext:**


| Поле           | Тип                                                          |
| -------------- | ------------------------------------------------------------ |
| `context_id`   | `uuid`                                                       |
| `agent_kind`   | `"hypothesis" | "deep"`                                      |
| `gate_id`      | `string | null`                                              |
| `context_body` | `string` (max `AGENT_CONTEXT_MAX_BODY_CHARS`, default 32768) |
| `created_at`   | `datetime`                                                   |
| `updated_at`   | `datetime`                                                   |


---

### GET /agent/contexts/{context_id}


|                 |                                |
| --------------- | ------------------------------ |
| **Метод**       | `GET`                          |
| **Путь**        | `/agent/contexts/{context_id}` |
| **Вход (path)** | `context_id: uuid`             |
| **Выход `200`** | `AgentContext`                 |


**Ошибки:** 404 `context_not_found`, 503 `context_store_unavailable`

---

### PUT /agent/contexts

Upsert по business key `(agent_kind, gate_id)`.


|                 |                      |
| --------------- | -------------------- |
| **Метод**       | `PUT`                |
| **Путь**        | `/agent/contexts`    |
| **Вход (body)** | `AgentContextUpsert` |
| **Выход `200`** | `AgentContext`       |


**AgentContextUpsert:**


| Поле           | Тип                     |
| -------------- | ----------------------- |
| `agent_kind`   | `"hypothesis" | "deep"` |
| `gate_id`      | `string | null`         |
| `context_body` | `string`                |


---

### DELETE /agent/contexts/{context_id}


|                 |                                           |
| --------------- | ----------------------------------------- |
| **Метод**       | `DELETE`                                  |
| **Путь**        | `/agent/contexts/{context_id}`            |
| **Вход (path)** | `context_id: uuid`                        |
| **Выход `200`** | `{ "deleted": true, "context_id": uuid }` |


---

## Agent — usage (M14)

Read-only. Запись runs — через `UsageRecorder` (M7/M16), не через HTTP.

### GET /agent/usage/runs

Список usage runs с фильтрами.


|                  |                     |
| ---------------- | ------------------- |
| **Метод**        | `GET`               |
| **Путь**         | `/agent/usage/runs` |
| **Вход (query)** | см. ниже            |
| **Выход `200`**  | `UsageRunListPage`  |


**Query-параметры:**


| Параметр     | Тип                             |
| ------------ | ------------------------------- |
| `gate_id`    | `string`                        |
| `agent_kind` | `"hypothesis" | "deep"`         |
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
| `agent_kind`         | `"hypothesis" | "deep"`           |
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

### GET /agent/usage/runs/{run_id}


|                 |                              |
| --------------- | ---------------------------- |
| **Метод**       | `GET`                        |
| **Путь**        | `/agent/usage/runs/{run_id}` |
| **Вход (path)** | `run_id: uuid`               |
| **Выход `200`** | `AgentUsageRun`              |


**Ошибки:** 404 `usage_run_not_found`

---

### GET /agent/usage/daily

Дневные агрегаты deep usage.


|                  |                                                          |
| ---------------- | -------------------------------------------------------- |
| **Метод**        | `GET`                                                    |
| **Путь**         | `/agent/usage/daily`                                     |
| **Вход (query)** | `gate_id?: string`, `date_from?: date`, `date_to?: date` |
| **Выход `200`**  | `AgentUsageDailyRollup[]`                                |


**AgentUsageDailyRollup:**


| Поле             | Тип       |
| ---------------- | --------- |
| `date`           | `date`    |
| `gate_id`        | `string`  |
| `agent_kind`     | `"deep"`  |
| `total_tokens`   | `integer` |
| `total_cost_usd` | `number`  |
| `run_count`      | `integer` |


---

## Сводная таблица эндпоинтов


| Метод    | Путь                                                 | Модуль | Назначение                   |
| -------- | ---------------------------------------------------- | ------ | ---------------------------- |
| `GET`    | `/status`                                            | M10    | Агрегированный observability |
| `POST`   | `/status/tick`                                       | M5     | Ручной тик (debug)           |
| `GET`    | `/gates/active`                                      | M13    | Текущий активный гейт        |
| `POST`   | `/gates/{gate_id}/activate`                          | M13    | Смена активного гейта        |
| `GET`    | `/settings/detector`                                 | M2     | Список конфигов              |
| `GET`    | `/settings/detector/effective`                       | M2     | Effective конфиг             |
| `PATCH`  | `/settings/detector`                                 | M2     | PATCH global                 |
| `PATCH`  | `/settings/detector/{gate_id}`                       | M2     | PATCH override               |
| `DELETE` | `/settings/detector/{gate_id}`                       | M2     | Удалить override             |
| `POST`   | `/settings/detector/reset`                           | M2     | Сброс global                 |
| `GET`    | `/settings/instructions`                             | M6     | Список инструкций            |
| `GET`    | `/settings/instructions/{id}`                        | M6     | Инструкция по ID             |
| `POST`   | `/settings/instructions`                             | M6     | Создать инструкцию           |
| `PATCH`  | `/settings/instructions/{id}`                        | M6     | PATCH инструкции             |
| `DELETE` | `/settings/instructions/{id}`                        | M6     | Удалить инструкцию           |
| `POST`   | `/settings/instructions/match`                       | M6     | Preview матчинга             |
| `GET`    | `/audit/recent`                                      | M8     | Последние audit              |
| `GET`    | `/audit/{audit_id}`                                  | M8     | Audit по ID                  |
| `GET`    | `/deep/cases`                                        | M8     | Список deep cases            |
| `POST`   | `/deep/cases/{audit_id}/chat/open`                   | M16    | Открыть deep chat            |
| `POST`   | `/deep/cases/{audit_id}/chat/messages`               | M16    | Сообщение в chat             |
| `POST`   | `/deep/cases/{audit_id}/actions/{action_id}/approve` | M16    | Approve MCP step             |
| `POST`   | `/deep/cases/{audit_id}/actions/{action_id}/reject`  | M16    | Reject MCP step              |
| `GET`    | `/deep/cases/{audit_id}/chat`                        | M16    | Polling snapshot             |
| `POST`   | `/agent/preview`                                     | M7     | Debug preview агента         |
| `GET`    | `/agent/contexts`                                    | M15    | Список контекстов            |
| `GET`    | `/agent/contexts/{context_id}`                       | M15    | Контекст по ID               |
| `PUT`    | `/agent/contexts`                                    | M15    | Upsert контекста             |
| `DELETE` | `/agent/contexts/{context_id}`                       | M15    | Удалить контекст             |
| `GET`    | `/agent/usage/runs`                                  | M14    | Список usage runs            |
| `GET`    | `/agent/usage/runs/{run_id}`                         | M14    | Usage run по ID              |
| `GET`    | `/agent/usage/daily`                                 | M14    | Daily rollup                 |


---

## См. также

- Модульная документация: `docs/modules/`
- Swagger (интерактивно): `http://127.0.0.1:8000/docs`
- Runbook: `docs/runbook.md`

