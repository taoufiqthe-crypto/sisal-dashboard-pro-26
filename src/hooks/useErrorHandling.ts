import { useState, useCallback, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/lib/monitoring';

interface ErrorState {
  error: Error | null;
  isError: boolean;
  errorId: string | null;
  retryCount: number;
  lastErrorTime: number | null;
}

interface ErrorHandlingOptions {
  maxRetries?: number;
  retryDelay?: number;
  showToast?: boolean;
  logError?: boolean;
  fallbackComponent?: React.ComponentType<{ error: Error; retry: () => void }>;
  onError?: (error: Error) => void;
  context?: string;
}

export const useErrorHandling = (options: ErrorHandlingOptions = {}) => {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    showToast = true,
    logError = true,
    onError,
    context = 'Unknown',
  } = options;

  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isError: false,
    errorId: null,
    retryCount: 0,
    lastErrorTime: null,
  });

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isError: false,
      errorId: null,
      retryCount: 0,
      lastErrorTime: null,
    });
  }, []);

  const reportError = useCallback((error: Error, additionalContext?: string) => {
    const errorId = `${context}-${Date.now()}`;
    const fullContext = additionalContext ? `${context} - ${additionalContext}` : context;
    
    setErrorState(prev => ({
      error,
      isError: true,
      errorId,
      retryCount: prev.retryCount + 1,
      lastErrorTime: Date.now(),
    }));

    if (logError) {
      logger.error(`Error in ${fullContext}`, error, { errorId, context: fullContext });
    }

    if (showToast) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    }

    if (onError) {
      onError(error);
    }
  }, [context, logError, showToast, onError]);

  const handleAsyncOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    errorContext?: string
  ): Promise<T | null> => {
    try {
      clearError();
      const result = await operation();
      return result;
    } catch (error) {
      reportError(error as Error, errorContext);
      return null;
    }
  }, [clearError, reportError]);

  const retry = useCallback(async <T>(
    operation: () => Promise<T>,
    errorContext?: string
  ): Promise<T | null> => {
    if (errorState.retryCount >= maxRetries) {
      toast({
        title: "Limite de tentativas excedido",
        description: "Não foi possível completar a operação após várias tentativas",
        variant: "destructive",
      });
      return null;
    }

    await new Promise(resolve => setTimeout(resolve, retryDelay));
    return handleAsyncOperation(operation, errorContext);
  }, [errorState.retryCount, maxRetries, retryDelay, handleAsyncOperation]);

  const withErrorBoundary = useCallback(<T extends any[]>(
    fn: (...args: T) => void | Promise<void>
  ) => {
    return async (...args: T) => {
      try {
        await fn(...args);
      } catch (error) {
        reportError(error as Error);
      }
    };
  }, [reportError]);

  // Auto-clear errors after a timeout
  useEffect(() => {
    if (errorState.isError && errorState.lastErrorTime) {
      const timeout = setTimeout(() => {
        clearError();
      }, 10000); // Clear error after 10 seconds

      return () => clearTimeout(timeout);
    }
  }, [errorState.isError, errorState.lastErrorTime, clearError]);

  return {
    error: errorState.error,
    isError: errorState.isError,
    errorId: errorState.errorId,
    retryCount: errorState.retryCount,
    clearError,
    reportError,
    handleAsyncOperation,
    retry,
    withErrorBoundary,
    canRetry: errorState.retryCount < maxRetries,
  };
};

export const useGlobalErrorHandler = () => {
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logger.error('Unhandled Promise Rejection', event.reason);
      
      toast({
        title: "Erro do Sistema",
        description: "Ocorreu um erro inesperado no sistema",
        variant: "destructive",
      });
    };

    const handleError = (event: ErrorEvent) => {
      logger.error('Global Error', event.error || new Error(event.message));
      
      toast({
        title: "Erro do Sistema",
        description: "Ocorreu um erro inesperado no sistema",
        variant: "destructive",
      });
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);
};

// Error Boundary Hook
export const useErrorBoundary = () => {
  const [error, setError] = useState<Error | null>(null);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const captureError = useCallback((error: Error) => {
    setError(error);
    logger.error('Error Boundary Caught Error', error);
  }, []);

  useEffect(() => {
    if (error) {
      toast({
        title: "Erro na Aplicação",
        description: "Um erro foi detectado. A página será recarregada automaticamente.",
        variant: "destructive",
      });
    }
  }, [error]);

  return {
    error,
    resetError,
    captureError,
    hasError: error !== null,
  };
};