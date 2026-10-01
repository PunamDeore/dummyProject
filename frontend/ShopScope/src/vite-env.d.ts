/// <reference types="vite/client" />


interface ImportMetaEnv {
  readonly VITE_APP_NAME?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_API_TIMEOUT_MS?: string;
  readonly VITE_LOG_LEVEL?: string;
  readonly VITE_FEATURE_UPLOADS?: string;
  readonly VITE_PAGE_SIZE?: string;
  readonly VITE_UPLOAD_BASE_URL?: string;
}
