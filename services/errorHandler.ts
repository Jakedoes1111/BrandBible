/**
 * Centralized Error Handler
 * Provides consistent error handling across the application
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class APIError extends AppError {
  constructor(message: string, statusCode: number = 500) {
    super(message, 'API_ERROR', statusCode);
    this.name = 'APIError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded. Please try again later.') {
    super(message, 'RATE_LIMIT_ERROR', 429);
    this.name = 'RateLimitError';
  }
}

/**
 * Format error for user display
 */
export function formatErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    // OpenAI API errors
    if ('status' in error) {
      const apiError = error as any;
      const status = apiError.status;
      
      if (status === 401) {
        return 'Invalid API key. Please check your OpenAI API key configuration.';
      }
      if (status === 429) {
        return 'Rate limit exceeded. Please wait a moment before trying again.';
      }
      if (status === 402) {
        return 'Insufficient credits. Please check your OpenAI account billing.';
      }
      if (status === 500 || status >= 500) {
        return 'OpenAI service error. Please try again later.';
      }
      if (status === 400) {
        return apiError.message || 'Invalid request. Please check your input.';
      }
    }

    return error.message || 'An unexpected error occurred';
  }

  return 'An unexpected error occurred';
}

/**
 * Log error for debugging
 */
export function logError(error: unknown, context?: string): void {
  const timestamp = new Date().toISOString();
  const errorInfo = {
    timestamp,
    context,
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : error,
  };

  console.error('[Error]', JSON.stringify(errorInfo, null, 2));

  // In production, send to error tracking service
  // e.g., Sentry, LogRocket, etc.
}

/**
 * Safe async wrapper with error handling
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  context?: string
): Promise<[T | null, Error | null]> {
  try {
    const result = await fn();
    return [result, null];
  } catch (error) {
    logError(error, context);
    return [null, error instanceof Error ? error : new Error(String(error))];
  }
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry on client errors (4xx)
      if ('status' in lastError && (lastError as any).status >= 400 && (lastError as any).status < 500) {
        throw lastError;
      }

      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Retry failed');
}
