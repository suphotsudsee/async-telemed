/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_LIFF_ID?: string;
  readonly VITE_LIFF_URL?: string;
  readonly VITE_LIFF_MOCK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}