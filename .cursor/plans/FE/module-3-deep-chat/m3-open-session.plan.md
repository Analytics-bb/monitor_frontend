---
id: m3-open-session
parent_module: .cursor/plans/FE/module-3-deep-chat.plan.md
depends_on:
  - m3-page-shell
  - m3-use-deep-chat
план читать: "да, §Состояния чата — not_started"
status: completed
---

# Задача: CTA «Открыть анализ» + POST open

## Что сделать
Empty state при `state=not_started`: centered CTA «Открыть анализ» → `openSession()` → messages area; loading/error на CTA; после open — start polling.

## Файлы
**Изменить:**
- `src/pages/DeepChatPage.tsx`
- `src/components/deep/ChatWindow.tsx` (если уже создан — иначе placeholder в page)

**Не трогать без явного указания:** composer, approval bar.

## Контракт (если задача создаёт/меняет сущность)
CTA label: **«Открыть анализ»** (M17 §7.3). `POST /api/deep/cases/{audit_id}/chat/open` идемпотентен (200 + текущий snapshot).

## Решения / якоря реализации
- Обязательно: entry также с `/monitoring` ConclusionModal link (module-1) — тот же flow.
- Не делать: auto-open без user action.

## Зависимости
- `m3-use-deep-chat` — `openSession`, initial GET.
- `m3-page-shell` — page mount.

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| not_started CTA | `tests/unit/deep-chat/DeepChatPage.test.tsx` | «Открыть анализ» → open → messages |

## DoD
- [ ] Empty state + CTA wired
- [ ] POST open → snapshot + polling
- [ ] Тесты из раздела «Тесты» зелёные
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
