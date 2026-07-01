---
id: m7-fixture-support
parent_module: .cursor/plans/FE/module-7-support.plan.md
depends_on:
  - m0-mock-samples
план читать: "нет"
status: pending
---

# Задача: fixture SupportChatSnapshot

## Что сделать
Zod-схема + fixture `SupportChatSnapshot` для Vitest и fixture mode; экспорт из `api/fixtures/index.ts`.

## Файлы
**Создать:**
- `src/api/fixtures/supportChatSnapshot.ts`

**Изменить:**
- `src/api/fixtures/index.ts`

**Не трогать без явного указания:** `api/support.ts` (параллельно с `m7-api-support`).

## Контракт (если задача создаёт/меняет сущность)
`supportChatSnapshotFixture`: `state` active/processing/error, `messages[]`, `context_reset`, `usage_total` (не для UI total).

`SupportMessage`: `message_id`, `role`, `content`, `attachment_ids?`, `created_at`.

## Решения / якоря реализации
- Повторить паттерн: `src/api/fixtures/chatSnapshot.ts`.
- Обязательно: поля синхронны с `docs/api.md` § `SupportChatSnapshot`.
- Не делать: второй источник truth для полей JSON.

## Зависимости
- `m0-mock-samples` — образец fixture + export pattern.

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| Fixture parse | `tests/unit/support/supportChatSnapshot.test.ts` | Zod roundtrip |

## DoD
- [ ] Fixture + parse helper exported
- [ ] `fixtures/index.ts` обновлён
- [ ] Тесты из раздела «Тесты» зелёные
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
