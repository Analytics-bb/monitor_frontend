---
id: m7-context-reset-banner
parent_module: .cursor/plans/FE/module-7-support.plan.md
depends_on:
  - m7-page-shell
  - m7-use-support-chat
план читать: "нет"
status: pending
---

# Задача: ContextResetBanner

## Что сделать
Dismissible banner при `snapshot.context_reset=true`: текст «История очищена (лимит)»; amber border; не блокирует composer.

## Файлы
**Создать:**
- `src/components/support/ContextResetBanner.tsx`

**Изменить:**
- `src/pages/SupportPage.tsx`
- `src/components/support/index.ts`

## Контракт (если задача создаёт/меняет сущность)
Props: `{ visible, onDismiss }`. Local dismiss state сбрасывается при новом `context_reset=true` из snapshot.

## Решения / якоря реализации
- Повторить паттерн: terminal/degraded banners в monitoring/deep (`ChatStateNotice`).
- Не делать: modal вместо banner.

## Зависимости
- `m7-use-support-chat` — `context_reset` flag.
- `m7-page-shell` — placement под header.

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| banner visible | `tests/unit/support/ContextResetBanner.test.tsx` | text visible when `visible` |

## DoD
- [ ] Banner component + wire
- [ ] Dismiss не ломает refetch
- [ ] Тесты из раздела «Тесты» зелёные
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
