/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL_PATH: string;
  readonly VITE_EIMZO_DOMAIN?: string;
  readonly VITE_EIMZO_API_KEY?: string;
  readonly VITE_INTEGRATIONS_MOCK_MODE?: string;
  readonly VITE_EDO_ORGANIZATION_ID_OVERRIDE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
