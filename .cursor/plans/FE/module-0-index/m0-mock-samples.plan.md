---
id: m0-mock-samples
parent_module: .cursor/plans/FE/module-0-index.plan.md
depends_on: [m0-api-client]
план читать: "нет"
status: completed
---

# Задача: Mock fixtures

## Что сделать
Добавить fixtures для dev и Vitest: `AuditEntry`, `ChatSnapshot`, `AgentUsageRun`, `StatusResponse`, `DeepCaseSummary` — минимально валидные сэмплы по OpenAPI/M17.

## Файлы
**Создать:**
- `src/api/fixtures/auditEntry.ts`
- `src/api/fixtures/chatSnapshot.ts`
- `src/api/fixtures/agentUsageRun.ts`
- `src/api/fixtures/statusResponse.ts`
- `src/api/fixtures/deepCaseSummary.ts`
- `src/api/fixtures/index.ts`

**Изменить:**
- `src/api/index.ts` (re-export fixtures)

**Не трогать без явного указания:** prod fetch path.

## Контракт (если задача создаёт/меняет сущность)
Каждый fixture — typed const + optional Zod parse helper; поля — по OpenAPI anomaly-api (не выдумывать).

Экспорт: `fixtures/*` для dev и unit-тестов downstream модулей.

## Решения / якоря реализации
- Обязательно: naive MSK datetime strings в сэмплах (как в API).
- Обязательно: не включать секреты, MCP tokens, `telegram_status` (null или omit).
- Не делать: автоматический fallback в client (можно flag env — отдельная задача при необходимости).

## Зависимости
- `m0-api-client` — общие error/types patterns; Zod если используется для валидации fixtures.

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| Fixtures parse | `tests/unit/fixtures.test.ts` (optional) | Zod/schema не падает на всех 5 типах |

## DoD
- [ ] 5 типов fixtures в `src/api/fixtures/`
- [ ] Barrel export `fixtures/index.ts`
- [ ] Тесты из раздела «Тесты» зелёные
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
