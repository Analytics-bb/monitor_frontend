---
id: m7-tests
parent_module: .cursor/plans/FE/module-7-support.plan.md
depends_on:
  - m7-api-support
  - m7-fixture-support
  - m7-use-support-chat
  - m7-page-shell
  - m7-header
  - m7-reset-action
  - m7-context-reset-banner
  - m7-composer-attachments
  - m7-message-attachments
  - m7-usage-filter-support
план читать: "да, §Тесты"
status: pending
---

# Задача: Vitest + e2e — support module

## Что сделать
Закрыть таблицу тестов плана; перенести `tests/unit/auth/SupportPage.test.tsx` → `tests/unit/support/`; добавить `tests/e2e/support.spec.ts`.

## Файлы
**Создать:**
- `tests/e2e/support.spec.ts`

**Изменить / перенести:**
- `tests/unit/auth/SupportPage.test.tsx` → `tests/unit/support/SupportPage.test.tsx`
- Агрегировать недостающие unit tests по таблице плана

## Контракт (если задача создаёт/меняет сущность)
N/A

## Решения / якоря реализации
- Повторить паттерн: `tests/e2e/deep-chat.spec.ts`, `tests/unit/deep-chat/`.
- e2e auth: fixture/module-7-auth (**блокер** для real API e2e); до auth — mock API + fixture login или `VITE_MOCK_AUTH_ENABLED=false` + stub Bearer.
- Не делать: e2e против prod secrets.

## Зависимости
- Все m7-* UI/API tasks выше.
- **module-7-auth** (внешний) — для e2e send message против staging.

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| Full table §Тесты плана | `tests/unit/support/*`, `tests/e2e/support.spec.ts` | все строки покрыты |
| 409 chat_processing | `tests/unit/support/useSupportChat.test.ts` | draft preserved |
| unmount stop | `tests/unit/support/useSupportChat.test.ts` | clearInterval |

## DoD
- [ ] Таблица тестов плана — green
- [ ] Старый `tests/unit/auth/SupportPage.test.tsx` удалён
- [ ] e2e support.spec.ts pass (fixture или auth ready)
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
