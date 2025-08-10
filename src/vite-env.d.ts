/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string
  readonly VITE_API_URL: string
  readonly VITE_RESEND_API_KEY: string
  // más variables de entorno aquí
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
