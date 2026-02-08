/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_BASIC_AUTH_USER?: string;
  readonly VITE_BASIC_AUTH_PASS?: string;
  readonly VITE_BASIC_AUTH_HEADER?: string;
  // add more env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
