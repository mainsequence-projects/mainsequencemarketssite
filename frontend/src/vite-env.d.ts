/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_COMMAND_CENTER_ORIGIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
