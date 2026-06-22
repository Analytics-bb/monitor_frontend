# monitor_frontend

React SPA для **BB Anomaly Detection R2** — потребитель REST `anomaly-api`.

## Стек

React 19 · Vite · TypeScript · Tailwind CSS · shadcn/ui · React Router v7 · Vitest · Playwright

## Быстрый старт

```bash
npm install
cp .env.example .env
npm run dev
```

`VITE_ANOMALY_API_BASE_URL` — base URL API **включая `/api`**, без trailing slash (пример: `http://localhost:8000/api`).

## Проверки

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

## Контракт

Source of truth: `.cursor/plans/R2/module-17-web-frontend-contract.plan.md`
