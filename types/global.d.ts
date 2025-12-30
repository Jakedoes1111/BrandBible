// Global type declarations for Brand Bible Generator

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey(): Promise<boolean>;
      openSelectKey(): Promise<void>;
    };
  }
}

// Vite environment variable types
interface ImportMetaEnv {
  readonly VITE_OPENAI_API_KEY: string;
  readonly VITE_BRAND_GENERATION_MODEL?: string;
  readonly VITE_BULK_CONTENT_MODEL?: string;
  readonly VITE_CHAT_MODEL?: string;
  readonly VITE_CONTENT_REC_MODEL?: string;
  readonly VITE_ADVANCED_AI_MODEL?: string;
  readonly VITE_IMAGE_MODEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

export {};
