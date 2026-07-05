---
title: 'FE Module 5 — Agent Settings'
plan: '.cursor/plans/FE/module-5-agent-settings.plan.md'
last_reviewed: '2026-07-05'
---

# Agent Settings (`/settings/agents`)

## Назначение и границы

За что отвечает: CRUD agent instructions (M6), upsert/delete contexts (M15), просмотр detector config (M2) — три вкладки на `/settings/agents`.

Что явно не входит: monitoring gate activation, deep chat, RBAC.

Ссылка на план: `.cursor/plans/FE/module-5-agent-settings.plan.md`

## Структура в репозитории

| Путь | Назначение |
|------|------------|
| `src/pages/AgentSettingsPage.tsx` | Tabs: Instructions, Contexts, Detector |
| `src/components/settings/InstructionsTab.tsx` | Table + toggle enabled |
| `src/components/settings/InstructionEditor.tsx` | Create/edit/delete prompt |
| `src/components/settings/ContextsTab.tsx` | Global + per-gate contexts |
| `src/components/settings/ContextEditor.tsx` | PUT/DELETE context forms |
| `src/components/settings/DetectorConfigTab.tsx` | Read-only detector config |
| `src/api/instructions.ts` | GET/PATCH/POST/DELETE instructions |
| `src/api/contexts.ts` | GET/PUT/DELETE contexts |
| `src/api/detector.ts` | GET detector config |
| `src/components/settings/settingsErrors.ts` | Inline error mapping |

Точка входа: `AgentSettingsPage` (`/settings/agents`).

## Публичный интерфейс

| Аспект | Решение |
|--------|---------|
| Маршрут | `/settings/agents` (redirect from `/settings`) |
| Instructions | `GET /api/settings/instructions`; toggle → `PATCH` |
| Instruction CRUD | `POST` / `PATCH` / `DELETE` по id |
| Contexts | `GET /api/agent/contexts?agent_kind&gate_id` |
| Context upsert | `PUT` global (`gate_id=null`) или per-gate |
| Context delete | `DELETE /api/agent/contexts/{id}` |
| Mutations | No optimistic — refetch after success |
| Errors | Toast + inline via `error_code` |

## Контракты и сущности

| Сущность | Файл | Описание |
|----------|------|----------|
| `AgentInstruction` | `fixtures/agentInstruction.ts` | id, name, prompt_template, enabled |
| `AgentContext` | `fixtures/agentContext.ts` | agent_kind, gate_id, content |
| `agent_kind` | contexts API | hypothesis, deep (support — module-7) |
| Detector config | `detector.ts` | Read-only snapshot |

## Ошибки и коды

| Код | Константа | Условие | Примечание |
|-----|-----------|---------|------------|
| `conflict` | — | 409 on context upsert | Toast; form preserved |
| `not_found` | — | 404 on PATCH/DELETE | Toast |
| (transport) | `ApiClientError` | Network errors | Toast via `mapApiError` |

## Заглушки и временное поведение

| Что | Где | Поведение |
|-----|-----|-----------|
| Instruction/context fixtures | `api/*` | Fixture responses без API URL |

## Зависимости

### Модули проекта

- module-0 — layout, toast, `api/client`

### Конфигурация

| Переменная | Назначение | Обязательная |
|------------|------------|--------------|
| `VITE_ANOMALY_API_BASE_URL` | REST upstream | Нет (fixtures) |

## Тесты

| Файл | Что проверяет | Уровень |
|------|--------------|---------|
| `tests/unit/settings/AgentSettingsPage.test.tsx` | tabs render | unit |
| `tests/unit/settings/InstructionsTab.test.tsx` | toggle PATCH | unit |
| `tests/unit/settings/InstructionEditor.test.tsx` | CRUD forms | unit |
| `tests/unit/settings/ContextEditor.test.tsx` | PUT roundtrip, 409 | unit |
| `tests/unit/settings/settingsErrors.test.ts` | error mapping | unit |

Намеренно не покрыто: Detector tab против live staging API.

## Как пользоваться

Открыть `/settings/agents` → вкладка Instructions → toggle или Edit → Save.
Contexts: выбрать agent_kind и gate → редактировать → Save (PUT).

## Наблюдаемость и безопасность

- Prompt templates — operator content; не логировать в prod console
- Confirm dialog перед DELETE instruction/context

## Совместимость и эталоны

- M17 §7.5; M6 instructions; M15 contexts OpenAPI в `docs/api.md`

## История и миграции

N/A
