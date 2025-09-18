import { useCallback, useEffect, useRef, useState } from 'react';
import { logger, performanceMonitor } from '@/lib/monitoring';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  componentCount: number;
  apiCallsCount: number;
  cacheHitRate: number;
}

interface OptimizationOptions {
  debounceMs?: number;
  throttleMs?: number;
  lazy?: boolean;
  memoize?: boolean;
  virtualizeThreshold?: number;
}

export const usePerformance = (componentName: string) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    componentCount: 0,
    apiCallsCount: 0,
    cacheHitRate: 0,
  });
  
  const timerRef = useRef<ReturnType<typeof performanceMonitor.startTimer> | null>(null);
  const renderCountRef = useRef(0);
  const apiCallsRef = useRef(0);
  const cacheHitsRef = useRef(0);
  const cacheMissesRef = useRef(0);

  useEffect(() => {
    timerRef.current = performanceMonitor.startTimer(`Component: ${componentName}`);
    renderCountRef.current++;
    
    // Measure memory usage
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      setMetrics(prev => ({
        ...prev,
        memoryUsage: memInfo.usedJSHeapSize,
        componentCount: renderCountRef.current,
      }));
    }

    return () => {
      if (timerRef.current) {
        timerRef.current.end();
      }
    };
  }, [componentName]);

  const trackApiCall = useCallback(() => {
    apiCallsRef.current++;
    setMetrics(prev => ({
      ...prev,
      apiCallsCount: apiCallsRef.current,
    }));
  }, []);

  const trackCacheHit = useCallback(() => {
    cacheHitsRef.current++;
    const totalCalls = cacheHitsRef.current + cacheMissesRef.current;
    const hitRate = totalCalls > 0 ? (cacheHitsRef.current / totalCalls) * 100 : 0;
    
    setMetrics(prev => ({
      ...prev,
      cacheHitRate: hitRate,
    }));
  }, []);

  const trackCacheMiss = useCallback(() => {
    cacheMissesRef.current++;
    const totalCalls = cacheHitsRef.current + cacheMissesRef.current;
    const hitRate = totalCalls > 0 ? (cacheHitsRef.current / totalCalls) * 100 : 0;
    
    setMetrics(prev => ({
      ...prev,
      cacheHitRate: hitRate,
    }));
  }, []);

  const logPerformanceWarning = useCallback((threshold: number, actual: number, metric: string) => {
    if (actual > threshold) {
      logger.warn(`Performance warning in ${componentName}`, {
        metric,
        threshold,
        actual,
        component: componentName,
      });
    }
  }, [componentName]);

  return {
    metrics,
    trackApiCall,
    trackCacheHit,
    trackCacheMiss,
    logPerformanceWarning,
  };
};

export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastCall = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      
      if (now - lastCall.current >= delay) {
        lastCall.current = now;
        return callback(...args);
      } else {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          lastCall.current = Date.now();
          callback(...args);
        }, delay - (now - lastCall.current));
      }
    }) as T,
    [callback, delay]
  );
};

export const useMemoizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T => {
  return useCallback(callback, deps);
};

export const useVirtualization = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  threshold: number = 100
) => {
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(0);

  useEffect(() => {
    if (items.length <= threshold) {
      setStartIndex(0);
      setEndIndex(items.length);
      return;
    }

    const visibleCount = Math.ceil(containerHeight / itemHeight);
    setEndIndex(Math.min(startIndex + visibleCount + 5, items.length));
  }, [items.length, itemHeight, containerHeight, startIndex, threshold]);

  const handleScroll = useCallback((scrollTop: number) => {
    if (items.length <= threshold) return;
    
    const newStartIndex = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    
    setStartIndex(Math.max(0, newStartIndex - 2));
    setEndIndex(Math.min(newStartIndex + visibleCount + 5, items.length));
  }, [items.length, itemHeight, containerHeight, threshold]);

  const visibleItems = items.length <= threshold 
    ? items 
    : items.slice(startIndex, endIndex);

  return {
    visibleItems,
    startIndex,
    endIndex,
    handleScroll,
    totalHeight: items.length * itemHeight,
    shouldVirtualize: items.length > threshold,
  };
};

export const useOptimization = (options: OptimizationOptions = {}) => {
  const {
    debounceMs = 300,
    throttleMs = 100,
    lazy = false,
    memoize = true,
    virtualizeThreshold = 100,
  } = options;

  const createOptimizedCallback = useCallback(<T extends (...args: any[]) => any>(
    callback: T,
    type: 'debounce' | 'throttle' = 'debounce'
  ) => {
    if (type === 'debounce') {
      return useDebounce(callback, debounceMs);
    } else {
      return useThrottle(callback, throttleMs);
    }
  }, [debounceMs, throttleMs]);

  return {
    createOptimizedCallback,
    shouldLazyLoad: lazy,
    shouldMemoize: memoize,
    virtualizeThreshold,
  };
};