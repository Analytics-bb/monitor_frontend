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
| Prod / Docker | `/api` (same-origin, без домена) |
| Dev | `http://localhost:8000/api` |

В prod-сборке **не** использовать полный `https://…` URL — только относительный `/api`.

## Проверки

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

## Deploy (Docker / prod)

Образ публикуется в GHCR: `ghcr.io/analytics-bb/bb-spa:<tag>`

| Параметр | Значение |
|----------|----------|
| Registry | `ghcr.io/analytics-bb/bb-spa` (`:latest`, `:sha`, semver tag) |
| Имя сервиса в compose (backend-репо) | `bb-spa` |
| Порт контейнера | `80` |
| Порт на хосте app-сервера | `127.0.0.1:20002` → container `:80` |
| Prod API base (build-time) | `VITE_API_BASE_URL=/api` |

### Prod-схема

```
HTTPS (внешний LB/CDN)
  → http://<app-server>:80   (хостовый nginx, listen 80)
      ├── /api/*  → 127.0.0.1:20000  anomaly-api
      └── /*      → 127.0.0.1:20002  bb-spa
```

Same-origin: браузер видит один домен; CORS в prod не нужен.
TLS, certbot и `listen 443` — **не** в SPA-контейнере и **не** на app-сервере.
Прокси `/api` — **хостовый** nginx (`bb_traffic_analysis/deploy/prod/nginx-host/monitor-behind-lb.conf`), не SPA-nginx.

### Локальная сборка и проверка

```bash
docker build --build-arg VITE_API_BASE_URL=/api -t bb-spa:local .
docker run --rm -d -p 20002:80 --name bb-spa-test bb-spa:local
curl -sf http://127.0.0.1:20002/ | head
docker exec bb-spa-test wget --spider -q http://127.0.0.1:80/
docker stop bb-spa-test
```

### Обновление на сервере

В `bb_traffic_analysis` (orchestrator compose, **не** отдельный compose в этом репо):

```bash
# .env backend-репо
BB_SPA_IMAGE=ghcr.io/analytics-bb/bb-spa:1.0.0

docker compose -f deploy/prod/docker-compose.yml pull bb-spa
docker compose -f deploy/prod/docker-compose.yml up -d bb-spa
```

После pull: `curl http://127.0.0.1/` → SPA (через хостовый nginx `:80`).

**Внешний LB:** upstream `http://<app-server-IP>:80`.

**Firewall app-сервера:** открыть `80/tcp` (желательно только с IP LB).

Подробнее: [deploy/README.md](deploy/README.md)

## Контракт

Source of truth: `bb_traffic_analysis/.cursor/plans/R2/module-17-web-frontend-contract.plan.md`

OpenAPI: `bb_traffic_analysis/docs/api.md`
