# Deploy

Multi-stage образ: Vite build → nginx:alpine со статикой.

| Файл | Назначение |
|------|------------|
| [`Dockerfile`](../Dockerfile) | build + runtime |
| [`nginx.conf`](../nginx.conf) | SPA routing, gzip, `client_max_body_size 1m` |
| [`.github/workflows/docker.yml`](../.github/workflows/docker.yml) | CI push в GHCR |

**Образ:** `ghcr.io/analytics-bb/bb-spa:<sha|latest|semver>`

**Сервис в compose backend-репо:** `bb-spa` (порт `80` внутри контейнера).

Prod build args:

```bash
docker build --build-arg VITE_API_BASE_URL=/api -t bb-spa .
```

На сервере:

```bash
BB_SPA_IMAGE=ghcr.io/analytics-bb/bb-spa:1.2.0 docker compose up -d bb-spa
```

`/api/*` проксирует **хостовый** nginx → anomaly-api; SPA-контейнер отдаёт только статику.
