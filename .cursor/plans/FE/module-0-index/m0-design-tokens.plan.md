---
id: m0-design-tokens
parent_module: .cursor/plans/FE/module-0-index.plan.md
depends_on: []
план читать: "да, §Дизайн-система (палитра light/dark, StatusBadge hex, типографика)"
status: completed
---

# Задача: Design tokens (light + dark)

## Что сделать
Применить в `index.css` полные палитры `:root` и `.dark` (colibrix violet), CSS-переменные `status-*` для StatusBadge, подключить шрифты Inter и JetBrains Mono.

## Файлы
**Создать:**
- нет

**Изменить:**
- `src/index.css`
- `index.html` (Google Fonts: Inter, JetBrains Mono)

**Не трогать без явного указания:** компоненты React, `components.json`.

## Контракт (если задача создаёт/меняет сущность)
CSS custom properties по таблицам §Палитра плана: `--background`, `--card`, `--elevated`, `--border`, `--foreground`, `--muted-foreground`, `--primary`, `--primary-foreground`, `--accent`, `--ring`, `--accent-warn`, `--destructive`, `--radius`.

Дополнительно `--status-*` (или эквивалент) для: `success`, `error`, `skipped`, `active`, `awaiting_approval`, `completed`, `not_started`, `cancelled` — hex из §StatusBadge.

Tailwind `@theme inline` должен маппить semantic colors на эти переменные (как в текущем scaffolde).

## Решения / якоря реализации
- Повторить паттерн: `src/index.css` — расширить существующий shadcn v4 `@theme inline` + `:root`, добавить блок `.dark`.
- Обязательно: oklch-значения из плана модуля; default = light (`:root`), без `prefers-color-scheme`.
- Обязательно: `--elevated` и `--accent-warn` — в `@theme` если нужны в Tailwind utilities.
- Не делать: ThemeProvider, компоненты, hardcoded hex в TSX.

## Зависимости
N/A

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| Visual smoke | manual / Storybook optional | `:root` и `.dark` задают разные `--background` |

## DoD
- [ ] Light + dark токены в `index.css`; шрифты подключены
- [ ] `status-*` переменные для всех вариантов StatusBadge
- [ ] `npm run build` без ошибок CSS
- [ ] Тесты из раздела «Тесты» зелёные (или N/A manual)
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
