import * as Sentry from '@sentry/react';

// Initialize Sentry for error monitoring
export const initMonitoring = () => {
  if (import.meta.env.VITE_SENTRY_DSN && import.meta.env.PROD) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.MODE,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
      ],
      tracesSampleRate: 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    });
  }
};

// Logging utility
export const logger = {
  info: (message: string, extra?: any) => {
    console.info(`[INFO] ${message}`, extra);
    if (import.meta.env.PROD) {
      Sentry.addBreadcrumb({
        message,
        level: 'info',
        data: extra,
      });
    }
  },
  
  warn: (message: string, extra?: any) => {
    console.warn(`[WARN] ${message}`, extra);
    if (import.meta.env.PROD) {
      Sentry.addBreadcrumb({
        message,
        level: 'warning',
        data: extra,
      });
    }
  },
  
  error: (message: string, error?: Error, extra?: any) => {
    console.error(`[ERROR] ${message}`, error, extra);
    if (import.meta.env.PROD) {
      Sentry.captureException(error || new Error(message), {
        tags: { component: 'PDV' },
        extra,
      });
    }
  },
  
  // Business events logging
  business: {
    saleCompleted: (saleData: any) => {
      logger.info('Sale completed', saleData);
    },
    
    stockUpdated: (productId: string, quantity: number) => {
      logger.info('Stock updated', { productId, quantity });
    },
    
    userLogin: (userId: string) => {
      logger.info('User logged in', { userId });
    },
    
    paymentProcessed: (amount: number, method: string) => {
      logger.info('Payment processed', { amount, method });
    }
  }
};

// Performance monitoring
export const performanceMonitor = {
  startTimer: (name: string) => {
    if (import.meta.env.DEV) {
      console.time(name);
    }
    return {
      end: () => {
        if (import.meta.env.DEV) {
          console.timeEnd(name);
        }
      }
    };
  },
  
  measureComponent: (componentName: string) => {
    const timer = performanceMonitor.startTimer(`Component: ${componentName}`);
    return timer;
  }
};