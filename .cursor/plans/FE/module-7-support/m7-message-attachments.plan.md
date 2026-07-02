---
id: m7-message-attachments
parent_module: .cursor/plans/FE/module-7-support.plan.md
depends_on:
  - m7-page-shell
  - m7-use-support-chat
  - m7-composer-attachments
план читать: "нет"
status: pending
---

# Задача: Вложения в message bubbles

## Что сделать
Отображение `attachment_ids` в sent messages: имена файлов из upload cache (Map `attachment_id → filename`); chips под текстом bubble; `role=system` — compact mono как deep.

## Файлы
**Изменить:**
- `src/pages/SupportPage.tsx` (или thin `SupportMessageList` wrapper в `components/support/`)

**Создать (опционально):**
- `src/components/support/SupportMessageList.tsx` — если wrapper чище, чем правка deep components

**Не трогать без явного указания:** `components/deep/ChatMessage.tsx` без необходимости — предпочесть wrapper/props.

## Контракт (если задача создаёт/меняет сущность)
Нет GET download endpoint — только отображение имён; unknown id → показать short uuid.

## Решения / якоря реализации
- Повторить паттерн: `ChatMessageList` + `ChatMessage` из deep — read-only import.
- Обязательно: filename cache передаётся из composer/hook layer (не второй fetch).
- Не делать: download links без API.

## Зависимости
- `m7-composer-attachments` — upload cache contract.
- `m7-page-shell` — messages area.

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| attachment label in bubble | `tests/unit/support/SupportPage.test.tsx` | filename visible |

## DoD
- [ ] Attachments visible in history
- [ ] system role styled
- [ ] Тесты из раздела «Тесты» зелёные
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
