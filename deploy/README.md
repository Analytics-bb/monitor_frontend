# Deploy

## GitHub Pages (SPA)

Project site: `https://analytics-bb.github.io/monitor_frontend/`

### Однократно в репозитории

1. **Settings → Pages → Build and deployment → Source** — **GitHub Actions**.
2. (Опционально) **Settings → Actions → Variables**:
   - `VITE_ANOMALY_API_BASE_URL` — URL staging/prod API; если задан, fixtures отключаются.
   - `VITE_MOCK_AUTH_ENABLED` — по умолчанию `true` в workflow.

По умолчанию workflow ставит `VITE_USE_API_FIXTURES=true` — monitoring, instructions, contexts и остальные страницы работают на fixtures без бэкенда.

### Автодеплой

Workflow [`.github/workflows/pages.yml`](../.github/workflows/pages.yml) на push в `chore/github-pages` (или вручную через **workflow_dispatch**):

- `npm run lint`, `typecheck`, `test`, `build`
- `VITE_BASE_PATH=/<repo-name>/` для assets и React Router
- `dist/404.html` — fallback для client-side routes
- `actions/deploy-pages`

### Локальная проверка Pages-сборки

```bash
VITE_BASE_PATH=/monitor_frontend/ npm run build
cp dist/index.html dist/404.html
npx vite preview --base /monitor_frontend/
```

Открыть `http://localhost:4173/monitor_frontend/`.

## nginx (staging/prod)

Docker-образ SPA + proxy `/api/*` → anomaly-api — Phase 7 (см. M0 §3.3).
