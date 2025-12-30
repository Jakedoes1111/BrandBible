// Performance monitoring and analytics service
import { indexedDBService } from './indexedDBService';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface WebVitals {
  FCP?: number;  // First Contentful Paint
  LCP?: number;  // Largest Contentful Paint
  FID?: number;  // First Input Delay
  CLS?: number;  // Cumulative Layout Shift
  TTFB?: number; // Time to First Byte
}

class PerformanceService {
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];
  private webVitals: WebVitals = {};

  constructor() {
    this.initPerformanceObservers();
  }

  private initPerformanceObservers(): void {
    if (typeof window === 'undefined' || !window.PerformanceObserver) {
      return;
    }

    try {
      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        this.webVitals.LCP = lastEntry.renderTime || lastEntry.loadTime;
        this.trackMetric('LCP', this.webVitals.LCP);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.webVitals.FID = entry.processingStart - entry.startTime;
          this.trackMetric('FID', this.webVitals.FID);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);

      // Cumulative Layout Shift
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.webVitals.CLS = clsValue;
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);

      // Navigation timing
      window.addEventListener('load', () => {
        const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navTiming) {
          this.webVitals.TTFB = navTiming.responseStart - navTiming.requestStart;
          this.webVitals.FCP = navTiming.responseEnd - navTiming.fetchStart;
          
          this.trackMetric('TTFB', this.webVitals.TTFB);
          this.trackMetric('FCP', this.webVitals.FCP);
        }
      });
    } catch (error) {
      console.error('Failed to initialize performance observers:', error);
    }
  }

  // Track custom metric
  trackMetric(name: string, value: number, metadata?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata,
    };

    this.metrics.push(metric);

    // Store in IndexedDB
    indexedDBService.trackEvent('performance_metric', metric).catch(console.error);

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${name}: ${value.toFixed(2)}ms`, metadata);
    }
  }

  // Measure function execution time
  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.trackMetric(name, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.trackMetric(name, duration, { error: true });
      throw error;
    }
  }

  measureSync<T>(name: string, fn: () => T): T {
    const start = performance.now();
    try {
      const result = fn();
      const duration = performance.now() - start;
      this.trackMetric(name, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.trackMetric(name, duration, { error: true });
      throw error;
    }
  }

  // Get web vitals
  getWebVitals(): WebVitals {
    return { ...this.webVitals };
  }

  // Get all metrics
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  // Get metrics by name
  getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter(m => m.name === name);
  }

  // Get average metric value
  getAverageMetric(name: string): number {
    const metrics = this.getMetricsByName(name);
    if (metrics.length === 0) return 0;
    const sum = metrics.reduce((acc, m) => acc + m.value, 0);
    return sum / metrics.length;
  }

  // Resource timing analysis
  getResourceTiming(): {
    total: number;
    byType: Record<string, number>;
    slowest: { name: string; duration: number }[];
  } {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    const byType: Record<string, number> = {};
    const all: { name: string; duration: number }[] = [];

    resources.forEach(resource => {
      const type = resource.initiatorType || 'other';
      const duration = resource.responseEnd - resource.startTime;
      
      byType[type] = (byType[type] || 0) + duration;
      all.push({ name: resource.name, duration });
    });

    const slowest = all
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);

    return {
      total: resources.length,
      byType,
      slowest,
    };
  }

  // Memory usage (if available)
  getMemoryUsage(): {
    usedJSHeapSize?: number;
    totalJSHeapSize?: number;
    jsHeapSizeLimit?: number;
  } | null {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      };
    }
    return null;
  }

  // Generate performance report
  generateReport(): {
    webVitals: WebVitals;
    customMetrics: Record<string, { avg: number; count: number; min: number; max: number }>;
    resources: ReturnType<typeof this.getResourceTiming>;
    memory: ReturnType<typeof this.getMemoryUsage>;
  } {
    const metricNames = [...new Set(this.metrics.map(m => m.name))];
    const customMetrics: Record<string, { avg: number; count: number; min: number; max: number }> = {};

    metricNames.forEach(name => {
      const metrics = this.getMetricsByName(name);
      const values = metrics.map(m => m.value);
      customMetrics[name] = {
        avg: this.getAverageMetric(name),
        count: metrics.length,
        min: Math.min(...values),
        max: Math.max(...values),
      };
    });

    return {
      webVitals: this.getWebVitals(),
      customMetrics,
      resources: this.getResourceTiming(),
      memory: this.getMemoryUsage(),
    };
  }

  // Clear metrics
  clearMetrics(): void {
    this.metrics = [];
  }

  // Cleanup observers
  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }

  // Track page view
  trackPageView(path: string): void {
    indexedDBService.trackEvent('page_view', {
      path,
      timestamp: Date.now(),
      referrer: document.referrer,
      userAgent: navigator.userAgent,
    }).catch(console.error);
  }

  // Track user interaction
  trackInteraction(action: string, category: string, label?: string, value?: number): void {
    indexedDBService.trackEvent('user_interaction', {
      action,
      category,
      label,
      value,
      timestamp: Date.now(),
    }).catch(console.error);
  }

  // Track errors
  trackError(error: Error, context?: Record<string, any>): void {
    indexedDBService.trackEvent('error', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    }).catch(console.error);
  }
}

export const performanceService = new PerformanceService();

// Utility function to mark performance checkpoints
export function mark(name: string): void {
  if (typeof performance !== 'undefined' && performance.mark) {
    performance.mark(name);
  }
}

// Utility function to measure between marks
export function measure(name: string, startMark: string, endMark: string): void {
  if (typeof performance !== 'undefined' && performance.measure) {
    try {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name, 'measure')[0];
      if (measure) {
        performanceService.trackMetric(name, measure.duration);
      }
    } catch (error) {
      console.error('Performance measure failed:', error);
    }
  }
}
