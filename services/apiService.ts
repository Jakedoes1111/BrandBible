// Enhanced API service with retry logic, rate limiting, and error handling

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

interface RequestConfig {
  retry?: Partial<RetryConfig>;
  timeout?: number;
  cache?: boolean;
  cacheTime?: number;
}

interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerHour: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
};

const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  requestsPerMinute: 60,
  requestsPerHour: 1000,
};

class APIService {
  private requestQueue: Array<() => Promise<any>> = [];
  private requestTimestamps: number[] = [];
  private isProcessingQueue = false;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();

  // Rate limiting
  private canMakeRequest(): boolean {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const oneHourAgo = now - 3600000;

    // Clean old timestamps
    this.requestTimestamps = this.requestTimestamps.filter(ts => ts > oneHourAgo);

    const recentMinute = this.requestTimestamps.filter(ts => ts > oneMinuteAgo).length;
    const recentHour = this.requestTimestamps.length;

    return (
      recentMinute < DEFAULT_RATE_LIMIT.requestsPerMinute &&
      recentHour < DEFAULT_RATE_LIMIT.requestsPerHour
    );
  }

  private addRequestTimestamp(): void {
    this.requestTimestamps.push(Date.now());
  }

  // Retry logic with exponential backoff
  async retryWithBackoff<T>(
    fn: () => Promise<T>,
    config: RetryConfig = DEFAULT_RETRY_CONFIG,
    attempt: number = 0
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      const isLastAttempt = attempt >= config.maxRetries - 1;
      
      if (isLastAttempt) {
        throw error;
      }

      // Check if error is retryable
      if (!this.isRetryableError(error)) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        config.baseDelay * Math.pow(config.backoffMultiplier, attempt),
        config.maxDelay
      );

      // Add jitter to prevent thundering herd
      const jitter = Math.random() * 0.3 * delay;
      const finalDelay = delay + jitter;

      console.log(`Retry attempt ${attempt + 1}/${config.maxRetries} after ${Math.round(finalDelay)}ms`);

      await this.sleep(finalDelay);
      return this.retryWithBackoff(fn, config, attempt + 1);
    }
  }

  private isRetryableError(error: any): boolean {
    // Retry on network errors
    if (error.name === 'NetworkError' || error.name === 'TypeError') {
      return true;
    }

    // Retry on API errors with specific status codes
    if (error instanceof Error && 'status' in error) {
      const apiError = error as any;
      const status = apiError.status;
      // Retry on 429 (rate limit), 500, 502, 503, 504
      return status === 429 || (status >= 500 && status < 600);
    }

    return false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Request timeout wrapper
  async withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`Request timeout after ${timeoutMs}ms`)), timeoutMs)
      ),
    ]);
  }

  // Cache management
  getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > cached.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  setCachedData(key: string, data: any, ttl: number = 300000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  clearCache(prefix?: string): void {
    if (prefix) {
      Array.from(this.cache.keys())
        .filter(key => key.startsWith(prefix))
        .forEach(key => this.cache.delete(key));
    } else {
      this.cache.clear();
    }
  }

  // Main request handler
  async makeRequest<T>(
    requestFn: () => Promise<T>,
    config: RequestConfig = {}
  ): Promise<T> {
    const {
      retry = DEFAULT_RETRY_CONFIG,
      timeout = 30000,
      cache = false,
      cacheTime = 300000,
    } = config;

    // Generate cache key based on function string (simple approach)
    const cacheKey = cache ? JSON.stringify(requestFn.toString()) : null;

    // Check cache
    if (cacheKey) {
      const cached = this.getCachedData<T>(cacheKey);
      if (cached !== null) {
        console.log('Returning cached data');
        return cached;
      }
    }

    // Rate limiting
    if (!this.canMakeRequest()) {
      console.warn('Rate limit reached, queueing request');
      return this.queueRequest(() => this.makeRequest(requestFn, config));
    }

    this.addRequestTimestamp();

    // Execute request with retry and timeout
    const request = () => this.retryWithBackoff(requestFn, retry as RetryConfig);
    const result = await this.withTimeout(request(), timeout);

    // Cache result
    if (cacheKey) {
      this.setCachedData(cacheKey, result, cacheTime);
    }

    return result;
  }

  // Request queue for rate limiting
  private async queueRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const result = await requestFn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      if (!this.isProcessingQueue) {
        this.processQueue();
      }
    });
  }

  private async processQueue(): Promise<void> {
    this.isProcessingQueue = true;

    while (this.requestQueue.length > 0) {
      if (!this.canMakeRequest()) {
        // Wait before checking again
        await this.sleep(1000);
        continue;
      }

      const request = this.requestQueue.shift();
      if (request) {
        await request();
      }
    }

    this.isProcessingQueue = false;
  }

  // Error formatting
  formatError(error: unknown): string {
    if (error instanceof Error) {
      if ('status' in error) {
        const apiError = error as any;
        const statusCode = apiError.status ?? apiError.error?.code;
        const message = apiError.message ?? apiError.error?.message ?? 'Unknown error';
        
        if (statusCode === 429) {
          return 'Rate limit exceeded. Please wait a moment before trying again.';
        } else if (statusCode === 400 || statusCode === 402) {
          return 'API request requires sufficient credits or access.';
        } else if (statusCode && statusCode >= 500) {
          return 'Server error. Please try again later.';
        }
        
        return message;
      }
      return error.message;
    }
    return 'An unexpected error occurred';
  }

  // Get queue status
  getQueueStatus(): {
    queueLength: number;
    requestsLastMinute: number;
    requestsLastHour: number;
  } {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const oneHourAgo = now - 3600000;

    return {
      queueLength: this.requestQueue.length,
      requestsLastMinute: this.requestTimestamps.filter(ts => ts > oneMinuteAgo).length,
      requestsLastHour: this.requestTimestamps.filter(ts => ts > oneHourAgo).length,
    };
  }

  // Clear queue
  clearQueue(): void {
    this.requestQueue = [];
  }
}

// Singleton instance
export const apiService = new APIService();

// Utility function for batch requests with concurrency control
export async function batchRequests<T>(
  requests: Array<() => Promise<T>>,
  concurrency: number = 3
): Promise<T[]> {
  const results: T[] = [];
  const executing: Promise<void>[] = [];

  for (const request of requests) {
    const promise = apiService.makeRequest(request).then(result => {
      results.push(result);
    });

    executing.push(promise);

    if (executing.length >= concurrency) {
      await Promise.race(executing);
      executing.splice(executing.findIndex(p => p === promise), 1);
    }
  }

  await Promise.all(executing);
  return results;
}

// Utility for progress tracking
export async function batchRequestsWithProgress<T>(
  requests: Array<() => Promise<T>>,
  onProgress: (completed: number, total: number) => void,
  concurrency: number = 3
): Promise<T[]> {
  const results: T[] = [];
  const total = requests.length;
  let completed = 0;

  const wrappedRequests = requests.map(request => async () => {
    const result = await apiService.makeRequest(request);
    completed++;
    onProgress(completed, total);
    return result;
  });

  const executing: Promise<void>[] = [];

  for (const request of wrappedRequests) {
    const promise = request().then(result => {
      results.push(result);
    });

    executing.push(promise);

    if (executing.length >= concurrency) {
      await Promise.race(executing);
      executing.splice(executing.findIndex(p => p === promise), 1);
    }
  }

  await Promise.all(executing);
  return results;
}
