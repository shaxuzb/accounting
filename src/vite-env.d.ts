/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL_PATH: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
