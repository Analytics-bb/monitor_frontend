---
id: m6-auth-storage
parent_module: .cursor/plans/FE/module-6-mock-auth.plan.md
depends_on: []
план читать: "да, §Ключевые гарантии п.2,6–7; §Публичный API (client)"
status: completed
---

# Задача: mockSession — localStorage flag + MOCK_AUTH_ENABLED

## Что сделать
`auth/mockSession.ts`: `isMockAuthenticated()`, `setMockSession()`, `clearMockSession()`; env `MOCK_AUTH_ENABLED` (default true); при `false` — guard bypass для dev/e2e.

## Файлы
**Создать:**
- `src/auth/mockSession.ts`

**Изменить:**
- `.env.example` — документировать `VITE_MOCK_AUTH_ENABLED` (или принятый префикс Vite)

**Не трогать без явного указания:** routes, pages, Sidebar.

## Контракт (если задача создаёт/меняет сущность)
| Export | Поведение |
|--------|-----------|
| `isMockAuthenticated()` | `true` если flag в storage И auth enabled |
| `setMockSession()` | set boolean flag (без секретов) |
| `clearMockSession()` | remove flag |
| `isMockAuthEnabled()` | read env; `false` → always authed for guard |

Storage: `localStorage` (единое решение); ключ — константа в модуле.

## Решения / якоря реализации
- Повторить паттерн: `src/app/theme/ThemeProvider.tsx` — persist в localStorage.
- Обязательно: только boolean flag, не JWT/токены.
- Не делать: backend auth calls.

## Зависимости
N/A — foundation для остальных m6-*.

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| MOCK_AUTH_ENABLED=false | `tests/unit/auth/mockSession.test.ts` | `isMockAuthenticated()` true без flag |
| set/clear roundtrip | `tests/unit/auth/mockSession.test.ts` | flag lifecycle |

## DoD
- [ ] Exports mockSession wired
- [ ] `.env.example` документирует env
- [ ] Тесты из раздела «Тесты» зелёные
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
