import { QueryClient, QueryFunction, QueryCache, MutationCache } from "@tanstack/react-query";

// Configuration for automotive-specific optimizations
const AUTOMOTIVE_CACHE_CONFIG = {
  // Cache durations for different data types
  VEHICLE_SPECS: 24 * 60 * 60 * 1000, // 24 hours
  PARTS_DATA: 12 * 60 * 60 * 1000,    // 12 hours
  QA_RESPONSES: 60 * 60 * 1000,       // 1 hour
  DIAGRAMS: 7 * 24 * 60 * 60 * 1000,  // 7 days
  
  // Request queue configuration
  MAX_CONCURRENT_REQUESTS: 3,
  MAX_BATCH_SIZE: 10,
  BATCH_DELAY_MS: 100,
  
  // Memory management
  MAX_CACHE_SIZE_MB: 100,
  IMAGE_CACHE_SIZE_MB: 50,
  CLEANUP_THRESHOLD: 0.9, // Cleanup when 90% full
};

// Request queue for batch operations
class RequestQueue {
  private queue: Array<{
    resolve: (value: any) => void;
    reject: (error: any) => void;
    request: () => Promise<any>;
  }> = [];
  private processing = 0;
  private batchTimer: NodeJS.Timeout | null = null;
  private batchQueue: Array<any> = [];

  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ resolve, reject, request });
      this.process();
    });
  }

  async addBatch<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.batchQueue.push({ resolve, reject, request });
      
      if (!this.batchTimer) {
        this.batchTimer = setTimeout(() => {
          this.processBatch();
        }, AUTOMOTIVE_CACHE_CONFIG.BATCH_DELAY_MS);
      }
    });
  }

  private async process() {
    while (this.processing < AUTOMOTIVE_CACHE_CONFIG.MAX_CONCURRENT_REQUESTS && this.queue.length > 0) {
      const item = this.queue.shift();
      if (!item) continue;

      this.processing++;
      
      try {
        const result = await item.request();
        item.resolve(result);
      } catch (error) {
        item.reject(error);
      } finally {
        this.processing--;
        this.process();
      }
    }
  }

  private async processBatch() {
    const batch = this.batchQueue.splice(0, AUTOMOTIVE_CACHE_CONFIG.MAX_BATCH_SIZE);
    this.batchTimer = null;

    if (batch.length === 0) return;

    try {
      const results = await Promise.all(batch.map(item => item.request()));
      batch.forEach((item, index) => item.resolve(results[index]));
    } catch (error) {
      batch.forEach(item => item.reject(error));
    }

    if (this.batchQueue.length > 0) {
      this.batchTimer = setTimeout(() => {
        this.processBatch();
      }, AUTOMOTIVE_CACHE_CONFIG.BATCH_DELAY_MS);
    }
  }
}

const requestQueue = new RequestQueue();

// Memory usage tracking
class MemoryManager {
  private cacheSize = 0;
  private imageCache = new Map<string, { size: number; lastAccess: number }>();

  addToCache(key: string, size: number, isImage = false) {
    this.cacheSize += size;
    
    if (isImage) {
      this.imageCache.set(key, { size, lastAccess: Date.now() });
    }

    // Check if cleanup is needed
    if (this.cacheSize > AUTOMOTIVE_CACHE_CONFIG.MAX_CACHE_SIZE_MB * 1024 * 1024 * AUTOMOTIVE_CACHE_CONFIG.CLEANUP_THRESHOLD) {
      this.cleanup();
    }
  }

  removeFromCache(key: string, size: number) {
    this.cacheSize -= size;
    this.imageCache.delete(key);
  }

  private cleanup() {
    console.log('MemoryManager: Starting cache cleanup');
    
    // Remove least recently used images first
    const sortedImages = Array.from(this.imageCache.entries())
      .sort((a, b) => a[1].lastAccess - b[1].lastAccess);

    let freedSpace = 0;
    const targetFree = this.cacheSize * 0.3; // Free 30% of cache

    for (const [key, data] of sortedImages) {
      if (freedSpace >= targetFree) break;
      
      this.imageCache.delete(key);
      freedSpace += data.size;
      queryClient.removeQueries({ queryKey: [key] });
    }

    this.cacheSize -= freedSpace;
    console.log(`MemoryManager: Freed ${(freedSpace / 1024 / 1024).toFixed(2)}MB`);
  }

  getUsage() {
    return {
      totalSize: this.cacheSize,
      imageSize: Array.from(this.imageCache.values()).reduce((sum, item) => sum + item.size, 0),
      utilization: this.cacheSize / (AUTOMOTIVE_CACHE_CONFIG.MAX_CACHE_SIZE_MB * 1024 * 1024)
    };
  }
}

const memoryManager = new MemoryManager();

// Enhanced error handling
async function throwIfResNotOk(res: Response, context?: string) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    const error = new Error(`${res.status}: ${text}`);
    
    // Add automotive-specific error context
    if (context) {
      (error as any).context = context;
    }
    
    // Log automotive-specific errors
    if (res.status === 413) {
      console.error('Document too large for processing. Consider using progressive loading.');
    } else if (res.status === 422) {
      console.error('Invalid automotive data format detected.');
    } else if (res.status === 504) {
      console.error('Timeout processing large automotive document.');
    }
    
    throw error;
  }
}

// Progressive loading support
export async function progressiveApiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  options?: {
    onProgress?: (progress: number) => void;
    isLargeDocument?: boolean;
    documentType?: 'manual' | 'diagram' | 'catalog' | 'specification';
  }
): Promise<Response> {
  const headers: HeadersInit = data ? { "Content-Type": "application/json" } : {};
  
  // Add automotive-specific headers
  if (options?.documentType) {
    headers['X-Document-Type'] = options.documentType;
  }
  if (options?.isLargeDocument) {
    headers['X-Progressive-Loading'] = 'true';
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  // Handle progressive loading for large documents
  if (options?.onProgress && res.body) {
    const reader = res.body.getReader();
    const contentLength = Number(res.headers.get('Content-Length')) || 0;
    let receivedLength = 0;
    const chunks: Uint8Array[] = [];

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      chunks.push(value);
      receivedLength += value.length;
      
      if (contentLength > 0) {
        options.onProgress(receivedLength / contentLength);
      }
    }

    // Reconstruct the response
    const chunksAll = new Uint8Array(receivedLength);
    let position = 0;
    for (const chunk of chunks) {
      chunksAll.set(chunk, position);
      position += chunk.length;
    }

    const blob = new Blob([chunksAll]);
    const newResponse = new Response(blob, {
      status: res.status,
      statusText: res.statusText,
      headers: res.headers
    });

    await throwIfResNotOk(newResponse, options?.documentType);
    return newResponse;
  }

  await throwIfResNotOk(res, options?.documentType);
  return res;
}

// Queue-enabled API request
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  options?: {
    queue?: boolean;
    batch?: boolean;
    priority?: 'high' | 'normal' | 'low';
  }
): Promise<Response> {
  const makeRequest = async () => {
    const res = await fetch(url, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    await throwIfResNotOk(res);
    return res;
  };

  if (options?.batch) {
    return requestQueue.addBatch(makeRequest);
  } else if (options?.queue) {
    return requestQueue.add(makeRequest);
  }

  return makeRequest();
}

type UnauthorizedBehavior = "returnNull" | "throw";

// Enhanced query function with automotive optimizations
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
  cacheType?: 'vehicle_specs' | 'parts' | 'qa' | 'diagrams' | 'default';
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior, cacheType = 'default' }) =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    
    // Determine if this is an automotive query
    const isAutomotiveQuery = url.includes('/vehicle/') || 
                             url.includes('/parts/') || 
                             url.includes('/qa/') ||
                             url.includes('/diagrams/');

    const res = await fetch(url, {
      credentials: "include",
      // Add cache headers for automotive queries
      headers: isAutomotiveQuery ? {
        'X-Cache-Type': cacheType,
        'X-Request-Priority': 'normal'
      } : {}
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    const data = await res.json();

    // Track memory usage for automotive data
    if (isAutomotiveQuery && data) {
      const size = JSON.stringify(data).length;
      const isImage = cacheType === 'diagrams' || url.includes('/image/');
      memoryManager.addToCache(url, size, isImage);
    }

    return data;
  };

// Custom query cache with automotive optimizations
const queryCache = new QueryCache({
  onError: (error, query) => {
    console.error('Query error:', error);
    
    // Log automotive-specific query errors
    const queryKey = query.queryKey[0] as string;
    if (queryKey.includes('/qa/')) {
      console.error('Q&A query failed:', queryKey);
    } else if (queryKey.includes('/vehicle/')) {
      console.error('Vehicle data query failed:', queryKey);
    }
  },
  onSuccess: (_data, query) => {
    // Log successful automotive queries for performance monitoring
    const queryKey = query.queryKey[0] as string;
    if (queryKey.includes('/qa/')) {
      console.log('Q&A query successful:', queryKey);
    }
  }
});

// Custom mutation cache for automotive operations
const mutationCache = new MutationCache({
  onError: (error, _variables, _context, mutation) => {
    console.error('Mutation error:', error);
    
    // Handle automotive-specific mutation errors
    if (mutation.options.mutationKey?.includes('vehicle-update')) {
      console.error('Failed to update vehicle data');
    } else if (mutation.options.mutationKey?.includes('qa-submit')) {
      console.error('Failed to submit Q&A response');
    }
  }
});

// Optimized query client for automotive applications
export const queryClient = new QueryClient({
  queryCache,
  mutationCache,
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      // Dynamic stale time based on query type
      staleTime: (query) => {
        const key = query.queryKey[0] as string;
        if (key.includes('/vehicle/specs/')) {
          return AUTOMOTIVE_CACHE_CONFIG.VEHICLE_SPECS;
        } else if (key.includes('/parts/')) {
          return AUTOMOTIVE_CACHE_CONFIG.PARTS_DATA;
        } else if (key.includes('/qa/')) {
          return AUTOMOTIVE_CACHE_CONFIG.QA_RESPONSES;
        } else if (key.includes('/diagrams/')) {
          return AUTOMOTIVE_CACHE_CONFIG.DIAGRAMS;
        }
        return 5 * 60 * 1000; // 5 minutes default
      },
      // Retry configuration for automotive queries
      retry: (failureCount, error: any) => {
        // Don't retry on client errors
        if (error.status >= 400 && error.status < 500) {
          return false;
        }
        // Retry up to 3 times for server errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

// Export utilities for monitoring
export const getMemoryUsage = () => memoryManager.getUsage();
export const clearAutomotiveCache = (type?: 'vehicle_specs' | 'parts' | 'qa' | 'diagrams') => {
  if (type) {
    queryClient.removeQueries({ 
      predicate: (query) => {
        const key = query.queryKey[0] as string;
        return key.includes(`/${type}/`);
      }
    });
  } else {
    queryClient.clear();
  }
};
