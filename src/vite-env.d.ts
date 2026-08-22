/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL_PATH: string;
  readonly VITE_EIMZO_DOMAIN?: string;
  readonly VITE_EIMZO_API_KEY?: string;
  readonly VITE_EIMZO_BRIDGE_ENABLED?: string;
  readonly VITE_EIMZO_BRIDGE_ORIGIN?: string;
  readonly VITE_EIMZO_PARENT_ORIGIN?: string;
  readonly VITE_INTEGRATIONS_MOCK_MODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
