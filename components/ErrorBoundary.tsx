import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Log error to analytics/monitoring service
    this.logErrorToService(error, errorInfo);
    
    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    this.setState({ errorInfo });
  }

  private logErrorToService(error: Error, errorInfo: ErrorInfo): void {
    // In production, send to error tracking service (e.g., Sentry, LogRocket)
    try {
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      };

      // Store in localStorage for debugging
      const errors = JSON.parse(localStorage.getItem('error_logs') || '[]');
      errors.push(errorReport);
      // Keep only last 10 errors
      if (errors.length > 10) {
        errors.shift();
      }
      localStorage.setItem('error_logs', JSON.stringify(errors));

      console.log('Error logged:', errorReport);
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }
  }

  private handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900/50 flex items-center justify-center p-4">
          <div className="bg-black/30 backdrop-blur-sm border border-red-500/50 rounded-lg p-8 max-w-2xl w-full">
            <div className="flex items-center mb-6">
              <svg
                className="w-12 h-12 text-red-400 mr-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
                <p className="text-gray-400 mt-1">
                  An unexpected error occurred in the application
                </p>
              </div>
            </div>

            {this.state.error && (
              <div className="mb-6 bg-red-900/20 border border-red-500/40 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-red-200 mb-2">Error Details:</h2>
                <p className="text-red-300 font-mono text-sm break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            {process.env.NODE_ENV === 'development' && this.state.error?.stack && (
              <details className="mb-6 bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                <summary className="cursor-pointer text-gray-300 font-semibold mb-2">
                  Stack Trace (Development Only)
                </summary>
                <pre className="text-xs text-gray-400 overflow-auto max-h-64">
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <div className="flex gap-4">
              <button
                onClick={this.handleReset}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3 px-6 rounded-lg hover:from-green-600 hover:to-green-700 transition-all"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-gray-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-600 transition-all"
              >
                Reload Page
              </button>
            </div>

            <p className="text-gray-500 text-sm mt-6 text-center">
              If this problem persists, please contact support or check your browser console for more details.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

// Functional component wrapper for specific sections
export const SectionErrorBoundary: React.FC<{
  children: ReactNode;
  sectionName: string;
}> = ({ children, sectionName }) => {
  return (
    <ErrorBoundary
      fallback={
        <div className="bg-red-900/20 border border-red-500/40 rounded-lg p-6 my-4">
          <h3 className="text-lg font-semibold text-red-200 mb-2">
            Error in {sectionName}
          </h3>
          <p className="text-red-300 text-sm mb-4">
            This section encountered an error and couldn't be displayed.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-all"
          >
            Reload Page
          </button>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
};
