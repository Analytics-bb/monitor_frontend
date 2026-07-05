---
id: m3-usage-link
parent_module: .cursor/plans/FE/module-3-deep-chat.plan.md
depends_on:
  - m3-page-shell
план читать: "нет"
status: completed
---

# Задача: Link «Расход токенов» → /usage

## Что сделать
В header `DeepChatPage`: link «Расход токенов» → `/usage?audit_id={auditId}`; видим всегда на странице чата.

## Файлы
**Изменить:**
- `src/pages/DeepChatPage.tsx`

**Не трогать без явного указания:** usage page implementation (module-5/6).

## Контракт (если задача создаёт/меняет сущность)
N/A — React Router `Link` с query param `audit_id`.

## Решения / якоря реализации
- N/A

## Зависимости
- `m3-page-shell` — header slot.

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| Usage link href | `tests/unit/deep-chat/DeepChatPage.test.tsx` | `/usage?audit_id=` |

## DoD
- [ ] Link в header с корректным audit_id
- [ ] Тесты из раздела «Тесты» зелёные
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
