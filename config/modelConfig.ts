/**
 * Model Configuration System
 * Centralized configuration for AI models with fallback support
 */

export interface ModelCapabilities {
  supportsText: boolean;
  supportsImages: boolean;
  supportsVideo: boolean;
  supportsStructuredOutput: boolean;
  maxTokens: number;
  costTier: 'free' | 'low' | 'medium' | 'high';
}

export interface ModelConfig {
  name: string;
  provider: 'google' | 'openai' | 'anthropic' | 'custom';
  capabilities: ModelCapabilities;
  rateLimits: {
    requestsPerMinute: number;
    requestsPerDay: number;
    tokensPerMinute: number;
  };
  fallbackModels?: string[];
}

export interface ModelConfigMap {
  [key: string]: ModelConfig;
}

// Available model configurations
export const AVAILABLE_MODELS: ModelConfigMap = {
  // Latest OpenAI Models (2024-2025)
  'gpt-5': {
    name: 'gpt-5',
    provider: 'openai',
    capabilities: {
      supportsText: true,
      supportsImages: true,
      supportsVideo: false,
      supportsStructuredOutput: true,
      maxTokens: 128000,
      costTier: 'high',
    },
    rateLimits: {
      requestsPerMinute: 500,
      requestsPerDay: 10000,
      tokensPerMinute: 30000,
    },
    fallbackModels: ['chatgpt-4o-latest', 'gpt-4o-2024-11-20'],
  },
  'chatgpt-4o-latest': {
    name: 'chatgpt-4o-latest',
    provider: 'openai',
    capabilities: {
      supportsText: true,
      supportsImages: true,
      supportsVideo: false,
      supportsStructuredOutput: true,
      maxTokens: 16384,
      costTier: 'medium',
    },
    rateLimits: {
      requestsPerMinute: 500,
      requestsPerDay: 10000,
      tokensPerMinute: 30000,
    },
    fallbackModels: ['gpt-4o-2024-11-20', 'gpt-4o-mini-2024-07-18'],
  },
  'gpt-4o-2024-11-20': {
    name: 'gpt-4o-2024-11-20',
    provider: 'openai',
    capabilities: {
      supportsText: true,
      supportsImages: true,
      supportsVideo: false,
      supportsStructuredOutput: true,
      maxTokens: 16384,
      costTier: 'medium',
    },
    rateLimits: {
      requestsPerMinute: 500,
      requestsPerDay: 10000,
      tokensPerMinute: 30000,
    },
    fallbackModels: ['gpt-4o-mini-2024-07-18', 'gpt-4o'],
  },
  'gpt-4o': {
    name: 'gpt-4o',
    provider: 'openai',
    capabilities: {
      supportsText: true,
      supportsImages: true,
      supportsVideo: false,
      supportsStructuredOutput: true,
      maxTokens: 16384,
      costTier: 'medium',
    },
    rateLimits: {
      requestsPerMinute: 500,
      requestsPerDay: 10000,
      tokensPerMinute: 30000,
    },
    fallbackModels: ['gpt-4o-mini', 'gpt-4-turbo'],
  },
  'gpt-4o-mini-2024-07-18': {
    name: 'gpt-4o-mini-2024-07-18',
    provider: 'openai',
    capabilities: {
      supportsText: true,
      supportsImages: true,
      supportsVideo: false,
      supportsStructuredOutput: true,
      maxTokens: 16384,
      costTier: 'low',
    },
    rateLimits: {
      requestsPerMinute: 500,
      requestsPerDay: 10000,
      tokensPerMinute: 200000,
    },
    fallbackModels: ['gpt-4o-mini', 'gpt-4o'],
  },
  'gpt-4o-mini': {
    name: 'gpt-4o-mini',
    provider: 'openai',
    capabilities: {
      supportsText: true,
      supportsImages: true,
      supportsVideo: false,
      supportsStructuredOutput: true,
      maxTokens: 16384,
      costTier: 'low',
    },
    rateLimits: {
      requestsPerMinute: 500,
      requestsPerDay: 10000,
      tokensPerMinute: 200000,
    },
    fallbackModels: ['gpt-3.5-turbo'],
  },
  'gpt-4-turbo': {
    name: 'gpt-4-turbo',
    provider: 'openai',
    capabilities: {
      supportsText: true,
      supportsImages: true,
      supportsVideo: false,
      supportsStructuredOutput: true,
      maxTokens: 128000,
      costTier: 'medium',
    },
    rateLimits: {
      requestsPerMinute: 500,
      requestsPerDay: 10000,
      tokensPerMinute: 150000,
    },
    fallbackModels: ['gpt-4o-mini'],
  },
  'gpt-3.5-turbo': {
    name: 'gpt-3.5-turbo',
    provider: 'openai',
    capabilities: {
      supportsText: true,
      supportsImages: false,
      supportsVideo: false,
      supportsStructuredOutput: true,
      maxTokens: 16385,
      costTier: 'low',
    },
    rateLimits: {
      requestsPerMinute: 3500,
      requestsPerDay: 10000,
      tokensPerMinute: 60000,
    },
  },
  // Image Generation Models
  'dall-e-3': {
    name: 'dall-e-3',
    provider: 'openai',
    capabilities: {
      supportsText: false,
      supportsImages: true,
      supportsVideo: false,
      supportsStructuredOutput: false,
      maxTokens: 0,
      costTier: 'high',
    },
    rateLimits: {
      requestsPerMinute: 7,
      requestsPerDay: 200,
      tokensPerMinute: 0,
    },
  },
};

// Task-specific model assignments
export interface TaskModelConfig {
  primary: string;
  fallbacks: string[];
}

export const TASK_MODELS = {
  brandGeneration: {
    primary: import.meta.env.VITE_BRAND_GENERATION_MODEL || 'chatgpt-4o-latest',
    fallbacks: ['gpt-4o-2024-11-20', 'gpt-4o'],
  },
  bulkContent: {
    primary: import.meta.env.VITE_BULK_CONTENT_MODEL || 'gpt-4o-mini-2024-07-18',
    fallbacks: ['gpt-4o-mini', 'gpt-3.5-turbo'],
  },
  chatAssistant: {
    primary: import.meta.env.VITE_CHAT_MODEL || 'gpt-4o-mini-2024-07-18',
    fallbacks: ['gpt-4o-mini', 'gpt-3.5-turbo'],
  },
  imageGeneration: {
    primary: import.meta.env.VITE_IMAGE_MODEL || 'dall-e-3',
    fallbacks: [],
  },
  videoGeneration: {
    primary: import.meta.env.VITE_VIDEO_MODEL || 'dall-e-3',
    fallbacks: [],
  },
  contentRecommendations: {
    primary: import.meta.env.VITE_CONTENT_REC_MODEL || 'gpt-4o-mini-2024-07-18',
    fallbacks: ['gpt-4o-mini'],
  },
  advancedAI: {
    primary: import.meta.env.VITE_ADVANCED_AI_MODEL || 'chatgpt-4o-latest',
    fallbacks: ['gpt-4o-2024-11-20', 'gpt-4o'],
  },
} as const;

/**
 * Get model configuration by name
 */
export function getModelConfig(modelName: string): ModelConfig | null {
  return AVAILABLE_MODELS[modelName] || null;
}

/**
 * Get the best available model for a specific task
 */
export function getTaskModel(task: keyof typeof TASK_MODELS): string {
  const taskConfig = TASK_MODELS[task];
  return taskConfig.primary;
}

/**
 * Get fallback models for a specific model
 */
export function getFallbackModels(modelName: string): string[] {
  const config = getModelConfig(modelName);
  return config?.fallbackModels || [];
}

/**
 * Check if a model supports a specific capability
 */
export function modelSupports(
  modelName: string,
  capability: keyof ModelCapabilities
): boolean {
  const config = getModelConfig(modelName);
  if (!config) return false;
  return config.capabilities[capability] as boolean;
}

/**
 * Get all models that support a specific capability
 */
export function getModelsByCapability(
  capability: keyof ModelCapabilities
): string[] {
  return Object.entries(AVAILABLE_MODELS)
    .filter(([_, config]) => config.capabilities[capability])
    .map(([name]) => name);
}

/**
 * Select the best model based on requirements
 */
export function selectBestModel(requirements: {
  supportsText?: boolean;
  supportsImages?: boolean;
  supportsVideo?: boolean;
  supportsStructuredOutput?: boolean;
  preferLowCost?: boolean;
  minRequestsPerMinute?: number;
}): string | null {
  const candidates = Object.entries(AVAILABLE_MODELS).filter(([_, config]) => {
    if (requirements.supportsText && !config.capabilities.supportsText) return false;
    if (requirements.supportsImages && !config.capabilities.supportsImages) return false;
    if (requirements.supportsVideo && !config.capabilities.supportsVideo) return false;
    if (requirements.supportsStructuredOutput && !config.capabilities.supportsStructuredOutput) return false;
    if (requirements.minRequestsPerMinute && config.rateLimits.requestsPerMinute < requirements.minRequestsPerMinute) return false;
    return true;
  });

  if (candidates.length === 0) return null;

  // Sort by cost tier if preferring low cost
  if (requirements.preferLowCost) {
    const costOrder = { free: 0, low: 1, medium: 2, high: 3 };
    candidates.sort((a, b) => {
      const costA = costOrder[a[1].capabilities.costTier];
      const costB = costOrder[b[1].capabilities.costTier];
      return costA - costB;
    });
  }

  return candidates[0][0];
}

/**
 * Validate if model is available and configured
 */
export function isModelAvailable(modelName: string): boolean {
  return modelName in AVAILABLE_MODELS;
}

/**
 * Get model display name for UI
 */
export function getModelDisplayName(modelName: string): string {
  const config = getModelConfig(modelName);
  if (!config) return modelName;
  
  return modelName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default {
  AVAILABLE_MODELS,
  TASK_MODELS,
  getModelConfig,
  getTaskModel,
  getFallbackModels,
  modelSupports,
  getModelsByCapability,
  selectBestModel,
  isModelAvailable,
  getModelDisplayName,
};
