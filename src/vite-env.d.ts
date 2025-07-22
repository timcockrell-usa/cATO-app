/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AZURE_CLIENT_ID: string;
  readonly VITE_AZURE_AUTHORITY: string;
  readonly VITE_REDIRECT_URI: string;
  readonly VITE_POST_LOGOUT_REDIRECT_URI: string;
  readonly VITE_COSMOS_DB_ENDPOINT: string;
  readonly VITE_COSMOS_DB_KEY: string;
  readonly VITE_COSMOS_DB_NAME: string;
  readonly VITE_IL2_API_ENDPOINT: string;
  readonly VITE_IL2_API_SCOPE: string;
  readonly VITE_IL5_API_ENDPOINT: string;
  readonly VITE_IL5_API_SCOPE: string;
  readonly VITE_USE_LOCAL_AUTH: string;
  readonly VITE_ENVIRONMENT: string;
  readonly DEV: boolean;
  readonly MODE: string;
  readonly PROD: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
