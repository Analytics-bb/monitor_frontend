---
id: m3-page-shell
parent_module: .cursor/plans/FE/module-3-deep-chat.plan.md
depends_on:
  - m0-app-layout
  - m0-status-badge
  - m2-filters
план читать: "да, §Концепция — header; §Layout"
status: completed
---

# Задача: DeepChatPage — shell + breadcrumb

## Что сделать
Страница `/deep/{audit_id}`: header с breadcrumb `Deep` → short id, слот StatusBadge, слот usage link, слот CaseMetaStrip, full-height ChatWindow placeholder; breadcrumb «Deep» → `/deep?${deepListSearch}` при наличии `location.state.deepListSearch`.

## Файлы
**Создать:**
- `src/pages/DeepChatPage.tsx` (если placeholder — заменить)

**Изменить:**
- `src/components/deep/index.ts` — re-export по мере появления

**Не трогать без явного указания:** `useDeepChat`, message components.

## Контракт (если задача создаёт/меняет сущность)
`DeepChatPage`: `auditId` из `useParams`; `deepListSearch` из `location.state` (ключ `deepListSearch`, контракт M2 `DeepListPage.handleRowClick`).

Breadcrumb link: если `deepListSearch` — `to={/deep?${deepListSearch}}`, иначе `to="/deep"`. Прямой вход (ConclusionModal, bookmark) — без query.

## Решения / якоря реализации
- Повторить паттерн: `MonitoringPage` layout height calc (`100vh - AppLayout header`).
- Обязательно: route `deep/:auditId` уже в `m0-app-layout`.
- Не делать: polling, chat messages.

## Зависимости
- `m0-status-badge` — `StatusBadge(chat.state)` в header.
- `m0-app-layout` — маршрут `deep/:auditId`.
- `m2-filters` (**completed**, module-2) — передаёт `location.state.deepListSearch` при row click; query: `gate_id`, `state`, `from`, `to`, `page`, `page_size`.

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| N/A на этом шаге | — | smoke в `m3-tests` |

## DoD
- [ ] Header + breadcrumb + meta strip slots
- [ ] Back link с saved query
- [ ] Тесты из раздела «Тесты» зелёные
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
