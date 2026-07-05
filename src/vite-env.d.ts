/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_MOCK_AUTH_ENABLED?: string
  /** `true` — fixtures в production preview без API. */
  readonly VITE_USE_API_FIXTURES?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
