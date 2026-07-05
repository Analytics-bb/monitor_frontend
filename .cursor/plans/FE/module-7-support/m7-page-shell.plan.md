---
id: m7-page-shell
parent_module: .cursor/plans/FE/module-7-support.plan.md
depends_on:
  - m7-use-support-chat
  - m0-app-layout
план читать: "да, §Промпт дизайна (UI)"
status: completed
---

# Задача: SupportPage — shell + ChatWindow

## Что сделать
Заменить placeholder `SupportPage`: full-height layout в AppLayout, `ChatWindow` из deep, wire `useSupportChat`, слоты под header/banner/composer (заполняются последующими задачами).

## Файлы
**Изменить:**
- `src/pages/SupportPage.tsx`

**Создать:**
- `src/components/support/index.ts` (re-export по мере появления)

**Не трогать без явного указания:** `routes.tsx` (маршрут уже есть), auth.

## Контракт (если задача создаёт/меняет сущность)
`/support` — protected route (уже в `routes.tsx`). Высота: паттерн `DeepChatPage` / `MonitoringPage` (calc под AppLayout header).

## Решения / якоря реализации
- Повторить паттерн: `src/pages/DeepChatPage.tsx` — LLM column + hook.
- Обязательно: read-only import `ChatWindow`, `ChatMessageList` из `components/deep`.
- Не делать: ApprovalBar; audit meta.

## Зависимости
- `m7-use-support-chat` — snapshot + refetch.
- `m0-app-layout` — layout shell.

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| LLM layout smoke | `tests/unit/support/SupportPage.test.tsx` | ChatWindow testid present |

## DoD
- [ ] Placeholder «скоро» удалён
- [ ] ChatWindow + hook wired
- [ ] Тесты из раздела «Тесты» зелёные
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
