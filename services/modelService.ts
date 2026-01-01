/**
 * Model Service
 * Handles model selection, fallback logic, and error recovery
 */

import OpenAI from 'openai';
import {
  getTaskModel,
  getFallbackModels,
  getModelConfig,
  isModelAvailable,
  modelSupports,
  selectBestModel,
} from '../config/modelConfig';

// Initialize OpenAI client
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
if (!apiKey) {
  throw new Error('VITE_OPENAI_API_KEY environment variable not set. Please add it to .env.local');
}
const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

export interface ModelRequest {
  task: 'brandGeneration' | 'bulkContent' | 'chatAssistant' | 'imageGeneration' | 'videoGeneration' | 'contentRecommendations' | 'advancedAI';
  prompt: string | any;
  config?: any;
  preferredModel?: string;
  requireStructuredOutput?: boolean;
}

export interface ModelResponse {
  response: OpenAI.Chat.Completions.ChatCompletion;
  modelUsed: string;
  fallbacksAttempted: string[];
  tokensUsed?: number;
}

/**
 * Check if error is related to model availability
 */
function isModelUnavailableError(error: any): boolean {
  const errorStr = JSON.stringify(error);
  return (
    error?.status === 503 ||
    error?.status === 429 ||
    error?.status === 404 ||
    error?.error?.code === 503 ||
    error?.error?.code === 429 ||
    error?.error?.code === 404 ||
    errorStr.includes('overloaded') ||
    errorStr.includes('not found') ||
    errorStr.includes('quota')
  );
}

/**
 * Attempt to generate content with a specific model
 */
async function attemptWithModel(
  modelName: string,
  request: ModelRequest
): Promise<OpenAI.Chat.Completions.ChatCompletion> {
  console.log(`[ModelService] Attempting with model: ${modelName}`);

  // Convert prompt to OpenAI format
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = typeof request.prompt === 'string'
    ? [{ role: 'user', content: request.prompt }]
    : request.prompt;

  const response = await openai.chat.completions.create({
    model: modelName,
    messages,
    response_format: request.config?.responseMimeType === 'application/json' ? { type: 'json_object' } : undefined,
    ...request.config,
  });

  return response;
}

/**
 * Generate content with automatic fallback support
 */
export async function generateWithFallback(
  request: ModelRequest
): Promise<ModelResponse> {
  const fallbacksAttempted: string[] = [];

  // Determine primary model
  let primaryModel: string;

  if (request.preferredModel && isModelAvailable(request.preferredModel)) {
    primaryModel = request.preferredModel;
  } else {
    primaryModel = getTaskModel(request.task);
  }

  // Check if model supports required features
  if (request.requireStructuredOutput && !modelSupports(primaryModel, 'supportsStructuredOutput')) {
    // Find alternative model
    const alternative = selectBestModel({
      supportsText: true,
      supportsStructuredOutput: true,
      preferLowCost: true,
    });
    if (alternative) {
      console.log(`[ModelService] Primary model doesn't support structured output, using: ${alternative}`);
      primaryModel = alternative;
    }
  }

  // Try primary model
  try {
    const response = await attemptWithModel(primaryModel, request);
    console.log(`[ModelService] ✅ Success with primary model: ${primaryModel}`);

    return {
      response,
      modelUsed: primaryModel,
      fallbacksAttempted: [],
    };
  } catch (error) {
    console.warn(`[ModelService] ❌ Primary model failed: ${primaryModel}`, error);
    fallbacksAttempted.push(primaryModel);

    // Try fallback models if primary fails
    if (isModelUnavailableError(error)) {
      const fallbacks = getFallbackModels(primaryModel);

      for (const fallbackModel of fallbacks) {
        if (!isModelAvailable(fallbackModel)) continue;

        try {
          const response = await attemptWithModel(fallbackModel, request);
          console.log(`[ModelService] ✅ Success with fallback model: ${fallbackModel}`);

          return {
            response,
            modelUsed: fallbackModel,
            fallbacksAttempted,
          };
        } catch (fallbackError) {
          console.warn(`[ModelService] ❌ Fallback failed: ${fallbackModel}`, fallbackError);
          fallbacksAttempted.push(fallbackModel);
        }
      }
    }

    // All attempts failed
    throw new Error(
      `All models failed. Attempted: ${[primaryModel, ...fallbacksAttempted].join(', ')}. Last error: ${error}`
    );
  }
}

/**
 * Check if a model is configured and available for use.
 */
export async function checkModelHealth(modelName: string): Promise<boolean> {
  return isModelAvailable(modelName);
}

/**
 * Get model configuration stats for monitoring.
 */
export function getModelStats(modelName: string) {
  return getModelConfig(modelName);
}

/**
 * Get recommended model for a task based on current conditions
 */
export function getRecommendedModel(
  task: ModelRequest['task'],
  options: {
    preferSpeed?: boolean;
    preferQuality?: boolean;
    preferCost?: boolean;
  } = {}
): string {
  const baseModel = getTaskModel(task);

  // If preferring speed, try to find faster alternative
  if (options.preferSpeed) {
    const fastModel = selectBestModel({
      supportsText: true,
      supportsStructuredOutput: true,
      minRequestsPerMinute: 10,
      preferLowCost: true,
    });
    if (fastModel) return fastModel;
  }

  // If preferring quality, try to use latest/best models
  if (options.preferQuality) {
    const proModels = ['gpt-5', 'chatgpt-4o-latest', 'gpt-4o-2024-11-20'];
    for (const model of proModels) {
      if (isModelAvailable(model)) return model;
    }
  }

  return baseModel;
}

export default {
  generateWithFallback,
  getRecommendedModel,
  checkModelHealth,
  getModelStats,
};
