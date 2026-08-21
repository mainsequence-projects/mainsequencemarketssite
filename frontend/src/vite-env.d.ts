/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_COMMAND_CENTER_ORIGIN?: string;
  readonly VITE_FASTAPI_RELEASE_UID?: string;
  readonly VITE_E2E_HOST?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
