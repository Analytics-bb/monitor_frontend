---
id: m3-tests
parent_module: .cursor/plans/FE/module-3-deep-chat.plan.md
depends_on:
  - m3-page-shell
  - m3-open-session
  - m3-use-deep-chat
  - m3-chat-window
  - m3-message-list
  - m3-composer
  - m3-approval-bar
  - m3-case-header
  - m3-usage-link
план читать: "да, §Тесты; §DoD"
status: pending
---

# Задача: Vitest + e2e deep chat

## Что сделать
Unit-тесты по таблице плана; `tests/e2e/deep-chat.spec.ts` — list → chat → message flow на fixtures.

## Файлы
**Создать:**
- `tests/e2e/deep-chat.spec.ts`
- `tests/unit/deep-chat/` — недостающие тесты

**Изменить:**
- unit-файлы из задач m3-* при пробелах

**Не трогать без явного указания:** module-2 list tests (кроме shared fixtures).

## Контракт (если задача создаёт/меняет сущность)
N/A

## Решения / якоря реализации
- Повторить паттерн: `tests/unit/monitoring/`, `ChatSnapshot` fixture.
- Обязательно: mock API в unit; e2e на fixtures.
- Не делать: дублировать `usePolling` base tests.

## Зависимости
Все `m3-*` UI/hook задачи.

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| LLM layout | `tests/unit/deep-chat/ChatWindow.test.tsx` | composer bottom |
| not_started CTA | `tests/unit/deep-chat/DeepChatPage.test.tsx` | «Открыть анализ» |
| pending blocks | `tests/unit/deep-chat/ChatComposer.test.tsx` | disabled |
| approve flow | `tests/unit/deep-chat/ApprovalBar.test.tsx` | refetch |
| polling stop | `tests/unit/deep-chat/useDeepChat.test.ts` | terminal |
| unmount stop | `tests/unit/deep-chat/useDeepChat.test.ts` | clearInterval |
| breadcrumb back | `tests/unit/deep-chat/DeepChatPage.test.tsx` | `Deep` href `/deep?gate_id=42&page=1` при `state.deepListSearch` |
| e2e full flow | `tests/e2e/deep-chat.spec.ts` | list row → chat → breadcrumb back с тем же query |

## DoD
- [ ] Все сценарии из §Тесты плана модуля зелёные
- [ ] e2e `deep-chat.spec.ts` проходит
- [ ] DoD родительского плана готов к staging
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
