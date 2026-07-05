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

`VITE_API_BASE_URL` — base URL API **включая `/api`**, без trailing slash.

| Окружение | Значение |
|-----------|----------|
| Prod / Docker | `/api` (same-origin) |
| Dev | `http://localhost:8000/api` |

## Проверки

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

## Deploy (Docker / prod)

Образ публикуется в GHCR: `ghcr.io/analytics-bb/bb-spa:<tag>`

| Параметр | Значение |
|----------|----------|
| Имя сервиса в compose (backend-репо) | `bb-spa` |
| Порт контейнера | `80` |
| Prod API base (build-time) | `VITE_API_BASE_URL=/api` |

### Локальная сборка и проверка

```bash
docker build --build-arg VITE_API_BASE_URL=/api -t bb-spa:local .
docker run --rm -p 8080:80 bb-spa:local
curl -sf http://localhost:8080/ | head
docker run --rm bb-spa:local wget --spider -q http://127.0.0.1:80/
```

### Обновление на сервере

В `bb_traffic_analysis` (orchestrator compose):

```bash
export BB_SPA_IMAGE=ghcr.io/analytics-bb/bb-spa:1.2.0
docker compose pull bb-spa
docker compose up -d bb-spa
```

Хостовый nginx (`monitor.apibbstat.work`) проксирует `/api/*` → anomaly-api, `/*` → bb-spa.

Подробнее: [deploy/README.md](deploy/README.md)

## Контракт

Source of truth: `.cursor/plans/R2/module-17-web-frontend-contract.plan.md`
