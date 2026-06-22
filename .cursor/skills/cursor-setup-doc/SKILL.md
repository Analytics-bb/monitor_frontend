---
name: cursor-setup-doc
description: >-
  Создаёт или обновляет docs/cursor_setup.md — пронумерованный чеклист
  первичной настройки React/TypeScript-проекта в Cursor (Node, .cursor/rules,
  .cursor/skills, gitignore, package.json, Vite, tsconfig, Tailwind, ESLint,
  Prettier, .env, npm scripts, CI). Использовать когда пользователь просит
  cursor_setup, онбординг-документ, первичную настройку Cursor, или перечисляет
  блоки/шаги для нового или пересобранного frontend-репо.
disable-model-invocation: true
---

# Cursor setup document (`docs/cursor_setup.md`)

## When to use

- Новый frontend-репо или пересборка обвязки (без описания бизнес-логики страниц)
- User gives **numbered blocks** (`--- создание package.json ---`, …) → один блок = один `## N.`
- Update existing `docs/cursor_setup.md` (hotkeys, links, tables)

## Before writing

1. Read `README.md`, `package.json`, `vite.config.ts`, `tsconfig.json`, `eslint.config.*`, `.github/workflows/`, `.cursor/rules/` if present
2. Уточнить или вывести: версия Node, имя проекта, npm/pnpm, dev/prod deps, как хранятся env (`VITE_*`)
3. Не дублировать README — только шаги первичной настройки

## Document structure (обязательно)

```markdown
# Настройка проекта в Cursor

[проект, Node X.Y, git, npm scripts]

---

## 1. Установка Node.js и менеджера пакетов
## 2. Создание `.cursor` и папок `plans`, `rules`, `skills`
## 3. Создание правил и навыков
## 4. Создание `.gitignore`
## 5. Создание необходимых файлов и директорий перед package.json
## 6. Создание package.json, Vite, TypeScript, Tailwind, ESLint, Prettier
## 7. Создание `.env.example` и `.env`
## 8. npm scripts и CI

## Быстрый старт после настройки
## Связанные документы
```

Секции 1–8 добавляй/пропускай по списку пользователя; нумерация сквозная.

## Content per section

### §1 Node.js

- Минимум Node **20 LTS** (или версия из `.nvmrc` / `engines` в `package.json`)
- Проверка: `node --version`, `npm --version` (или `pnpm --version`)
- Опционально: `nvm use` / `fnm use` по `.nvmrc`
- **Cursor:** терминал по умолчанию — zsh/bash с тем же Node, что и в системе; при расхождении — `which node`
- `node_modules/` в `.gitignore`

### §2 `.cursor`

```bash
mkdir -p .cursor/plans/FE .cursor/plans/R2 .cursor/rules .cursor/skills
```

Таблица: путь | назначение

| Путь | Назначение |
|------|------------|
| `.cursor/plans/R2/` | интеграционный контракт M17 (read-only для FE) |
| `.cursor/plans/FE/` | модульные планы реализации frontend |
| `.cursor/rules/` | правила поведения агента |
| `.cursor/skills/` | протоколы повторяемых задач |

### §3 rules и skills

Таблица правил `.cursor/rules/`:

| Файл | Содержание | Когда активен |
|------|------------|---------------|
| `git.mdc` | ветки, commits, push/PR | всегда |
| `planning.mdc` | апрув, module 0, планы | всегда |
| `memory.md` | ADR, статус страниц, инварианты | всегда |
| `development.mdc` | ESLint, Prettier, TSDoc, Vitest/Playwright | `**/*.{ts,tsx}` |
| `documentation.mdc` | `docs/modules/...` | `docs/**/*.md` |
| `Russian-answers.mdc` | язык ответов | всегда |

Таблица навыков `.cursor/skills/`:

| Навык | Когда использовать |
|-------|--------------------|
| `plan-writer/` | написать новый модульный план |
| `plan-reviewer/` | проверить план на проблемы |
| `module-doc/` | задокументировать завершённый модуль |
| `task-packager/` | собрать task-пакет из плана |
| `task-runner/` | выполнить одну задачу из пакета |
| `module-runner/` | выполнить модуль целиком |
| `module-closer/` | закрыть модуль после DoD |
| `ui-ux-pro-max/` | дизайн и UX страниц |
| `cursor-setup-doc/` | создать или обновить этот документ |

Пример дерева `.cursor/plans/`:

```
.cursor/plans/
├── R2/
│   └── module-17-web-frontend-contract.plan.md   # контракт SPA (source of truth)
└── FE/
    ├── module-0-index.plan.md                    # стек, layout, env, polling
    ├── module-monitoring.plan.md
    └── ...
```

### §4 `.gitignore`

- Ссылка: [Node.gitignore](https://github.com/github/gitignore/blob/main/Node.gitignore) — скопировать и **дополнить**
- Bullets: `node_modules/`, `dist/`, `build/`, `.env`, `.env.local`, `coverage/`, `playwright-report/`, `test-results/`, `.vite/`, IDE, OS

### §5 каркас до package.json

- `mkdir -p` по **фактической** структуре репо (M17 §Структура):

```bash
mkdir -p src/app src/pages src/components/ui src/api src/hooks \
  tests/e2e tests/unit deploy docs .github/workflows
```

- Таблица: каталог/файл | зачем

| Путь | Назначение |
|------|------------|
| `src/app/` | routes, layout, sidebar |
| `src/pages/` | страницы SPA |
| `src/components/` | переиспользуемые компоненты, `ui/` — shadcn |
| `src/api/` | HTTP-клиент, типы/Zod на границе API |
| `src/hooks/` | `usePolling`, `useDeepChat` и др. |
| `tests/unit/` | Vitest |
| `tests/e2e/` | Playwright |
| `deploy/` | Docker/nginx для SPA |

- Кратко про `README.md` (стек, `ANOMALY_API_BASE_URL`, команды dev/build/test)

### §6 package.json и конфиги

Стек по умолчанию для `monitor_frontend` (M17):

| Слой | Технология |
|------|------------|
| Фреймворк | React 19 + Vite + TypeScript |
| Стили | Tailwind CSS + shadcn/ui |
| Роутинг | React Router v7 |
| Тесты | Vitest (unit), Playwright (e2e) |
| Линт | ESLint + Prettier |

Шаги скаффолда (если репо пустой):

```bash
npm create vite@latest . -- --template react-ts
npm install react-router@7 tailwindcss @tailwindcss/vite
npx shadcn@latest init
npm install -D vitest @playwright/test eslint prettier typescript-eslint
```

Ключевые файлы — таблица:

| Файл | Содержание |
|------|------------|
| `package.json` | `name`, `engines.node`, scripts (см. §8) |
| `vite.config.ts` | React plugin, Tailwind, alias `@/` → `src/` |
| `tsconfig.json` | `strict: true`, paths |
| `tsconfig.app.json` / `tsconfig.node.json` | split по шаблону Vite |
| `eslint.config.js` | flat config, typescript-eslint, react-hooks |
| `.prettierrc` | единый формат с ESLint |
| `components.json` | shadcn/ui paths |
| `vitest.config.ts` | jsdom, setup file |
| `playwright.config.ts` | baseURL, fixtures |

Проверка после установки:

```bash
npm install
npm run lint
npm run typecheck
npm test
npm run build
```

`package-lock.json` (или `pnpm-lock.yaml`) — коммитить; не дублировать зависимости в отдельных `requirements.txt`.

### §7 `.env`

```bash
cp .env.example .env
```

- `.env` и `.env.local` в gitignore
- Vite: только переменные с префиксом `VITE_` попадают в клиент
- Таблица env (M17 §10.z):

| Переменная | Обязательна | Пример | Назначение |
|------------|-------------|--------|------------|
| `VITE_ANOMALY_API_BASE_URL` | да (prod/staging/dev) | `http://localhost:8000/api` | Base URL API **включая `/api`**, без trailing slash |
| `VITE_*` | по необходимости | — | Публичные настройки bundler |

Секреты (`CURSOR_API_KEY`, `MCP_ANALYTICS_TOKEN` и т.п.) **не** в frontend `.env`.

Пример `.env.example`:

```bash
# Dev: Vite dev-server → staging или local anomaly-api
VITE_ANOMALY_API_BASE_URL=http://localhost:8000/api
```

### §8 npm scripts и CI

Таблица scripts из реального `package.json`:

| Script | Назначение |
|--------|------------|
| `dev` | `vite` — локальный dev-server |
| `build` | `tsc -b && vite build` — prod-сборка в `dist/` |
| `preview` | раздача `dist/` локально |
| `lint` | ESLint по `src/` и `tests/` |
| `format` | Prettier write (опционально) |
| `typecheck` | `tsc --noEmit` |
| `test` | Vitest unit |
| `test:e2e` | Playwright |
| `ci` | `lint && typecheck && test && build` — агрегат для CI |

`.github/workflows/ci.yml` (типовой поток):

1. `actions/setup-node` — версия из `engines` / `.nvmrc`
2. `npm ci`
3. `npm run lint`
4. `npm run typecheck`
5. `npm test`
6. `npm run build`
7. (опционально) `npm run test:e2e` с fixtures или `continue-on-error` до staging

Не использовать `make test` — source of truth для проверок: `npm run lint && npm run typecheck && npm test && npm run build` (см. `development.mdc`).

### Быстрый старт

```bash
npm install
cp .env.example .env
# отредактировать VITE_ANOMALY_API_BASE_URL
npm run dev
# в другом терминале — полная проверка:
npm run lint && npm run typecheck && npm test && npm run build
```

### Связанные документы

- `README.md`, `.env.example`
- `.cursor/plans/R2/module-17-web-frontend-contract.plan.md` — контракт SPA
- `.cursor/plans/FE/` — планы реализации страниц
- `.cursor/rules/*.mdc`, `.cursor/rules/memory.md`

## Style

- Язык: **русский** (если пользователь не просит иное)
- Стиль: команды и таблицы, минимум теории
- Таблицы без пустых строк
- Пути — как в репозитории, не абстрактный шаблон

## User block workflow

Блоки вида `--- создание X ---` → заголовок `## N. Создание X` в том же порядке. Не смешивать несвязанные шаги в одной секции.

## Do not

- Вставлять полный текст `.mdc` или `SKILL.md` в cursor_setup
- Описывать backend Python/venv/pyproject в основном потоке
- Секреты и реальные prod-значения в примерах
- Дублировать OpenAPI-поля — ссылаться на M17 и `/docs` anomaly-api

## Output

Один файл: `docs/cursor_setup.md`. При правках — точечно, сохраняя нумерацию и ссылки на реальные артефакты репо.
