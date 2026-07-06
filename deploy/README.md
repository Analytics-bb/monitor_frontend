# Deploy

SPA-образ `bb-spa` для orchestrator в backend-репо `bb_traffic_analysis`.
Отдельного prod `docker-compose` в этом репозитории **нет**.

Orchestrator: `bb_traffic_analysis/deploy/prod/docker-compose.yml`

## Артефакты

| Файл | Назначение |
|------|------------|
| [`Dockerfile`](../Dockerfile) | multi-stage: Node build → `nginx:alpine` runtime |
| [`nginx.conf`](../nginx.conf) | SPA `try_files`, gzip, `client_max_body_size 1m`; **без** `location /api` |
| [`.github/workflows/docker.yml`](../.github/workflows/docker.yml) | CI: build + push в GHCR |

**Registry:** `ghcr.io/analytics-bb/bb-spa:<sha|latest|semver>`

Предпочтительно GHCR; Docker Hub с РФ нестабилен.

## Prod-схема

```
LB (TLS)
  → http://<app-server>:80   (хостовый nginx)
      ├── /api/*  → 127.0.0.1:20000  anomaly-api
      └── /*      → 127.0.0.1:20002  bb-spa (этот контейнер)

docker internal: anomaly-api → fastmcp-analytics:8080/mcp
```

- Same-origin: API на `/api/*`, SPA на `/*`
- CORS в prod не нужен
- MCP, Anthropic, MySQL/Mongo credentials — только backend, не в SPA bundle
- Домен и TLS — на внешнем LB; в prod bundle **нет** hardcode `https://…`

Конфиг хостового nginx: `bb_traffic_analysis/deploy/prod/nginx-host/monitor-behind-lb.conf`

**Firewall app-сервера:**

| Порт | Доступ |
|------|--------|
| `80/tcp` | только с IP LB |
| `20000`, `20002` | localhost only |

## Build-time env

| Окружение | `VITE_API_BASE_URL` |
|-----------|----------------------|
| Prod / Docker | `/api` |
| Dev | `http://localhost:8000/api` |

```bash
docker build --build-arg VITE_API_BASE_URL=/api -t bb-spa:local .
```

## Runtime (контейнер bb-spa)

- `EXPOSE 80`, статика в `/usr/share/nginx/html`
- `try_files $uri $uri/ /index.html` — SPA routing
- **Нет** `proxy_pass /api`, **нет** TLS/certbot, **нет** `/health`
- Healthcheck orchestrator: `wget --spider http://127.0.0.1:80/` (wget есть в `nginx:alpine`)

## Auth M19

- `POST /api/auth/login` `{username, password}` → `{token, user_id, username, expires_at}`
- Bearer на всех `/api/*` (кроме login)
- `401` → redirect `/login`
- `POST /api/auth/logout` + очистка token

## CI

Push в GHCR при push в `main` или tag `v*.*.*`:

- `ghcr.io/analytics-bb/bb-spa:<sha>`
- `ghcr.io/analytics-bb/bb-spa:latest` (main)
- `ghcr.io/analytics-bb/bb-spa:<semver>` (git tag)

## Обновление образа на сервере

1. CI push нового tag в GHCR
2. В `bb_traffic_analysis/.env`: `BB_SPA_IMAGE` / `FASTMCP_IMAGE` (при обновлении backend-сервисов)
3. `docker compose -f deploy/prod/docker-compose.yml pull <service>`
4. `docker compose -f deploy/prod/docker-compose.yml up -d <service>`

Для SPA:

```bash
# bb_traffic_analysis/.env
BB_SPA_IMAGE=ghcr.io/analytics-bb/bb-spa:1.0.0

docker compose -f deploy/prod/docker-compose.yml pull bb-spa
docker compose -f deploy/prod/docker-compose.yml up -d bb-spa
```

| Параметр | Значение |
|----------|----------|
| Имя сервиса | `bb-spa` (фиксировано) |
| Порт на хосте | `127.0.0.1:20002` → container `:80` |
| Наружу | не публикуем (только loopback + хостовый nginx) |

**LB upstream:** `http://<app-server-IP>:80`

## Локальная проверка (DoD)

```bash
docker build --build-arg VITE_API_BASE_URL=/api -t bb-spa:local .
docker run --rm -d -p 20002:80 --name bb-spa-test bb-spa:local

curl -sf http://127.0.0.1:20002/          # → 200 HTML
docker exec bb-spa-test wget --spider -q http://127.0.0.1:80/  # → exit 0

docker stop bb-spa-test
```

На сервере после pull:

```bash
curl http://127.0.0.1/                    # SPA через хостовый nginx :80
# Login: POST https://<домен>/api/auth/login — same-origin
```

## Не делать

- Отдельный `deploy/docker-compose.yml` для prod в этом репо
- `location /api` / `proxy_pass` в SPA `nginx.conf`
- `VITE_API_BASE_URL=https://…` в prod build
- Origin `:8080` в документации (хостовый nginx — `:80`)
- `/health` endpoint в SPA-контейнере
- CORS workaround для prod
