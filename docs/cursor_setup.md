# Настройка проекта в Cursor

**monitor-frontend** — React SPA для BB Anomaly Detection R2.  
Node **≥ 20** (`.nvmrc`: `20`), менеджер пакетов: **npm**.  
Проверки: `npm run lint && npm run typecheck && npm test && npm run build` (или `npm run ci`).

---

## 1. Установка Node.js и менеджера пакетов

Минимум Node **20 LTS** — зафиксировано в `package.json` (`engines.node`) и `.nvmrc`.

```bash
node --version   # ≥ v20
npm --version
```

При использовании nvm/fnm:

```bash
nvm use    # или: fnm use
```

**Cursor:** терминал IDE должен видеть тот же Node, что и система. При расхождении: `which node`.

`node_modules/` — в `.gitignore`, не коммитить.

---

## 2. Создание `.cursor` и папок `plans`, `rules`, `skills`

```bash
mkdir -p .cursor/plans/FE .cursor/plans/R2 .cursor/rules .cursor/skills
```

| Путь | Назначение |
|------|------------|
| `.cursor/plans/R2/` | интеграционный контракт M17 (локально, **не в remote** — см. §4) |
| `.cursor/plans/FE/` | модульные планы реализации frontend |
| `.cursor/rules/` | правила поведения агента |
| `.cursor/skills/` | протоколы повторяемых задач |

Пример дерева планов:

```
.cursor/plans/
├── R2/                                          # gitignore — только локально
│   └── module-17-web-frontend-contract.plan.md
├── FE/                                          # планы реализации (после plan-writer)
│   └── module-0-index.plan.md
└── frontend_cursor_setup_664edde1.plan.md       # setup-трекер (в git)
```

---

## 3. Создание правил и навыков

### Правила `.cursor/rules/`

| Файл | Содержание | Когда активен |
|------|------------|---------------|
| `git.mdc` | ветки, commits, push/PR | всегда |
| `planning.mdc` | апрув, module 0, планы | всегда |
| `memory.md` | ADR, статус страниц, инварианты | всегда |
| `development.mdc` | ESLint, Prettier, TSDoc, Vitest/Playwright | `**/*.{ts,tsx}` |
| `documentation.mdc` | `docs/modules/...` | `docs/**/*.md` |
| `Russian-answers.mdc` | язык ответов | всегда |

### Навыки `.cursor/skills/`

| Навык | Когда использовать |
|-------|--------------------|
| `plan-writer/` | написать новый модульный план |
| `plan-reviewer/` | проверить план на проблемы |
| `module-doc/` | задокументировать завершённый модуль |
| `task-packager/` | собрать task-пакет из плана |
| `task-runner/` | выполнить одну задачу из пакета |
| `module-runner/` | выполнить модуль целиком |
| `module-closer/` | закрыть модуль после DoD |
| `git-commit/` | сформировать и выполнить коммит |
| `git-merge/` | squash merge ветки в main |
| `ui-ux-pro-max/` | дизайн и UX страниц |
| `cursor-setup-doc/` | создать или обновить этот документ |

Вызов навыков вручную: `/git-commit`, `/plan-writer` и т.д. (поле `name` в frontmatter + `disable-model-invocation: true`).

---

## 4. Создание `.gitignore`

Основа: [Node.gitignore](https://github.com/github/gitignore/blob/main/Node.gitignore), дополнено под проект.

Ключевые записи:

- `.cursor/plans/R2/` — R2-контекст бэкенда, **не попадает в remote**
- `__pycache__/` — артефакты Python-скриптов ui-ux-pro-max
- `node_modules/`, `dist/`, `build/`, `.vite/`
- `.env`, `.env.local`, `.env.*.local`
- `coverage/`, `playwright-report/`, `test-results/`
- `.idea/`, `.vscode/*` (кроме `extensions.json`, `settings.json`)
- `tmp/`

---

## 5. Создание необходимых файлов и директорий перед package.json

```bash
mkdir -p src/app/layout src/pages src/components/ui src/api src/hooks src/lib \
  tests/e2e tests/unit deploy docs public .vscode
```

| Путь | Назначение |
|------|------------|
| `src/app/` | routes (`routes.tsx`), layout, sidebar |
| `src/pages/` | страницы SPA (monitoring, deep, usage, settings, login, cabinet) |
| `src/components/ui/` | shadcn/ui компоненты |
| `src/api/` | HTTP-клиент (`getApiBaseUrl`, `apiFetch`) |
| `src/hooks/` | `usePolling`, `useDeepChat` (Phase 4+) |
| `src/lib/` | утилиты (`cn` для Tailwind) |
| `tests/unit/` | Vitest |
| `tests/e2e/` | Playwright |
| `deploy/` | Docker/nginx для SPA (Phase 7) |
| `public/` | статика (`favicon.svg`) |

Кратко про `README.md`: стек, `VITE_ANOMALY_API_BASE_URL`, команды dev/build/test.

---

## 6. Создание package.json, Vite, TypeScript, Tailwind, ESLint, Prettier

### Стек (M17)

| Слой | Технология |
|------|------------|
| Фреймворк | React 19 + Vite 8 + TypeScript 6 |
| Стили | Tailwind CSS 4 + shadcn/ui (new-york) |
| Роутинг | React Router v7 |
| Тесты | Vitest 4 (unit), Playwright (e2e) |
| Линт | ESLint 10 + Prettier |

### Скаффолд (уже выполнен в репо)

```bash
npm create vite@latest tmp/scaffold -- --template react-ts
# перенести конфиги в корень; затем:
npm install react-router tailwindcss @tailwindcss/vite
npx shadcn@latest init
npx shadcn@latest add button
npm install -D vitest @playwright/test @testing-library/react @testing-library/jest-dom jsdom \
  eslint prettier prettier-plugin-tailwindcss typescript-eslint
```

### Ключевые файлы

| Файл | Содержание |
|------|------------|
| `package.json` | `name`, `engines.node`, scripts (§8) |
| `vite.config.ts` | React, Tailwind (`@tailwindcss/vite`), alias `@/` → `src/`, Vitest |
| `tsconfig.json` | project references (app + node) |
| `tsconfig.app.json` | `strict: true`, `paths` `@/*` → `./src/*` |
| `tsconfig.node.json` | конфиги Vite, Playwright |
| `eslint.config.js` | flat config, typescript-eslint, react-hooks |
| `.prettierrc` | single quotes, `prettier-plugin-tailwindcss` |
| `components.json` | shadcn/ui paths и стиль |
| `playwright.config.ts` | e2e, `baseURL` preview `http://127.0.0.1:4173` |
| `.vscode/settings.json` | Tailwind CSS: `unknownAtRules: ignore`, `*.css` → `tailwindcss` |
| `.vscode/extensions.json` | рекомендация `bradlc.vscode-tailwindcss` |

Vitest настроен **внутри** `vite.config.ts` (отдельного `vitest.config.ts` нет).

### Проверка после установки

```bash
npm install
npm run lint
npm run typecheck
npm test
npm run build
```

`package-lock.json` — коммитить.

---

## 7. Создание `.env.example` и `.env`

```bash
cp .env.example .env
```

Vite отдаёт в клиент только переменные с префиксом `VITE_`.

| Переменная | Обязательна | Пример | Назначение |
|------------|-------------|--------|------------|
| `VITE_ANOMALY_API_BASE_URL` | да | `http://localhost:8000/api` | Base URL API **включая `/api`**, без trailing slash |
| `VITE_*` | по необходимости | — | Публичные настройки bundler |

Секреты (`CURSOR_API_KEY`, `MCP_ANALYTICS_TOKEN` и т.п.) **не** в frontend `.env`.

Пример `.env.example`:

```bash
# Dev: Vite dev-server → local or staging anomaly-api
VITE_ANOMALY_API_BASE_URL=http://localhost:8000/api
```

---

## 8. npm scripts и CI

### Scripts (`package.json`)

| Script | Назначение |
|--------|------------|
| `dev` | `vite` — локальный dev-server |
| `build` | `tsc -b && vite build` — prod-сборка в `dist/` |
| `preview` | раздача `dist/` локально (порт 4173) |
| `lint` | ESLint по проекту |
| `format` | Prettier write |
| `format:check` | Prettier check |
| `typecheck` | `tsc -b --noEmit` |
| `test` | Vitest unit (`tests/unit/`) |
| `test:watch` | Vitest watch mode |
| `test:e2e` | Playwright (`tests/e2e/`) |
| `ci` | `lint && typecheck && test && build` |

### CI (планируется)

`.github/workflows/ci.yml` — **ещё не добавлен** (Phase 7 / отдельная задача). Типовой поток:

1. `actions/setup-node` — Node из `engines` / `.nvmrc`
2. `npm ci`
3. `npm run lint`
4. `npm run typecheck`
5. `npm test`
6. `npm run build`
7. (опционально) `npm run test:e2e` с fixtures

Не использовать `make test` — source of truth: `npm run ci` (см. `development.mdc`).

---

## Быстрый старт после настройки

```bash
npm install
cp .env.example .env
# отредактировать VITE_ANOMALY_API_BASE_URL
npm run dev
```

В другом терминале — полная проверка:

```bash
npm run ci
```

E2E (требует предварительный `npm run build` — Playwright поднимает `preview`):

```bash
npm run build && npm run test:e2e
```

---

## Связанные документы

- [`README.md`](../README.md) — обзор проекта
- [`.env.example`](../.env.example) — шаблон env
- `.cursor/plans/R2/module-17-web-frontend-contract.plan.md` — контракт SPA (локально)
- `.cursor/plans/FE/` — планы реализации страниц
- `.cursor/rules/*.mdc`, `.cursor/rules/memory.md`
