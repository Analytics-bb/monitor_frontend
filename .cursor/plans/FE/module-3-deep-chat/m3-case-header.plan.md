---
id: m3-case-header
parent_module: .cursor/plans/FE/module-3-deep-chat.plan.md
depends_on:
  - m3-page-shell
  - m3-use-deep-chat
план читать: "да, §Compact meta strip"
status: completed
---

# Задача: CaseMetaStrip — audit, gate, время

## Что сделать
Одна строка под breadcrumb: `gate_id`, event time (mono MSK as-is); optional collapsible conclusion excerpt (truncate 2 lines, read-only).

## Файлы
**Создать:**
- `src/components/deep/CaseMetaStrip.tsx`

**Изменить:**
- `src/pages/DeepChatPage.tsx`
- `src/components/deep/index.ts`

**Не трогать без явного указания:** breadcrumb, chat window.

## Контракт (если задача создаёт/меняет сущность)
`CaseMetaStrip`: props из chat snapshot / audit meta (`gate_id`, `created_at`, optional `conclusion` excerpt).

Не отдельный sidebar 280px.

## Решения / якоря реализации
- N/A — паттерн очевиден из `m3-page-shell`.

## Зависимости
- `m3-use-deep-chat` — snapshot fields.
- `m3-page-shell` — slot под header.

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| Meta render | `tests/unit/deep-chat/CaseMetaStrip.test.tsx` | gate + time visible |

## DoD
- [ ] Compact meta strip wired
- [ ] Тесты из раздела «Тесты» зелёные
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
