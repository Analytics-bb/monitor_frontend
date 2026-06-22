---
id: m0-use-polling
parent_module: .cursor/plans/FE/module-0-index.plan.md
depends_on: []
план читать: "да, §Ключевые гарантии п.4; M17 §10.s"
status: pending
---

# Задача: usePolling hook

## Что сделать
Хук `usePolling`: interval switch, `document.visibilityState=hidden` → интервал ×2, `clearInterval` on unmount, helper немедленного refetch.

## Файлы
**Создать:**
- `src/hooks/usePolling.ts`

**Изменить:**
- `src/hooks/index.ts`

**Не трогать без явного указания:** `useDeepChat` (module-3).

## Контракт (если задача создаёт/меняет сущность)
```ts
interface UsePollingOptions<T> {
  fetcher: () => Promise<T>
  intervalMs: number
  enabled?: boolean
  onData?: (data: T) => void
  onError?: (error: unknown) => void
}

interface UsePollingResult {
  refetch: () => Promise<void>
  isPolling: boolean
}
```

Инварианты: stop on unmount; смена `intervalMs` перезапускает timer; hidden tab → ×2 interval.

## Решения / якоря реализации
- Обязательно: `visibilitychange` listener с cleanup.
- Обязательно: TSDoc на русском (сеть, polling, unmount).
- Не делать: domain-specific interval policy (monitoring/deep — в обёртках module-1/3).

## Зависимости
N/A

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| Stop on unmount | `tests/unit/usePolling.test.ts` | fetcher не вызывается после unmount |
| Interval switch | `tests/unit/usePolling.test.ts` | смена `intervalMs` перезапускает timer |
| Visibility ×2 | `tests/unit/usePolling.test.ts` | hidden → удвоенный интервал |

## DoD
- [ ] usePolling экспортирован из `hooks/`
- [ ] Три unit-сценария зелёные
- [ ] Тесты из раздела «Тесты» зелёные
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
