import { EventEmitter } from 'events';

// Performance metrics interfaces
export interface QAMetrics {
  questionId: string;
  question: string;
  responseTime: number;
  confidence: number;
  documentType: string;
  vehicleInfo?: {
    year?: string;
    make?: string;
    model?: string;
  };
  timestamp: Date;
  success: boolean;
  errorType?: string;
}

export interface ExtractionMetrics {
  documentId: string;
  documentType: 'manual' | 'diagram' | 'catalog' | 'specification';
  extractionType: 'vin' | 'parts' | 'specs' | 'procedures' | 'mixed';
  startTime: Date;
  endTime: Date;
  duration: number;
  itemsExtracted: number;
  accuracy?: number;
  errors: Array<{
    type: string;
    message: string;
    timestamp: Date;
  }>;
}

export interface UserInteractionMetrics {
  sessionId: string;
  userId?: string;
  action: string;
  category: 'qa' | 'extraction' | 'navigation' | 'configuration';
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface PerformanceAnalytics {
  qa: {
    totalQuestions: number;
    averageResponseTime: number;
    successRate: number;
    confidenceDistribution: Record<string, number>;
    responseTimePercentiles: {
      p50: number;
      p75: number;
      p90: number;
      p95: number;
      p99: number;
    };
    errorRate: number;
    errorTypes: Record<string, number>;
  };
  extraction: {
    totalExtractions: number;
    averageDuration: number;
    successRate: number;
    accuracyRate: number;
    throughput: number; // items per second
    documentTypeBreakdown: Record<string, number>;
    extractionTypeBreakdown: Record<string, number>;
  };
  userBehavior: {
    totalSessions: number;
    averageSessionDuration: number;
    actionsPerSession: number;
    mostCommonActions: Array<{ action: string; count: number }>;
    peakUsageHours: Array<{ hour: number; count: number }>;
  };
  system: {
    memoryUsage: {
      current: number;
      peak: number;
      average: number;
    };
    cacheHitRate: number;
    queueBacklog: number;
    errorRate: number;
  };
}

// Configuration for performance monitoring
const PERF_CONFIG = {
  METRICS_RETENTION_DAYS: 7,
  BATCH_SIZE: 100,
  FLUSH_INTERVAL_MS: 5000,
  ALERT_THRESHOLDS: {
    QA_RESPONSE_TIME_MS: 2000,
    EXTRACTION_DURATION_MS: 10000,
    ERROR_RATE_PERCENT: 5,
    MEMORY_USAGE_MB: 500,
    QUEUE_BACKLOG: 50
  },
  PERCENTILE_BUCKETS: [50, 75, 90, 95, 99]
};

// Performance alerts
export interface PerformanceAlert {
  id: string;
  type: 'qa_slow' | 'extraction_slow' | 'high_error_rate' | 'memory_high' | 'queue_backed_up';
  severity: 'warning' | 'error' | 'critical';
  message: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// Main performance monitor class
export class PerformanceMonitor extends EventEmitter {
  private static instance: PerformanceMonitor;
  
  private qaMetrics: QAMetrics[] = [];
  private extractionMetrics: ExtractionMetrics[] = [];
  private userInteractions: UserInteractionMetrics[] = [];
  private alerts: PerformanceAlert[] = [];
  
  private sessionStartTime: Date;
  private currentSessionId: string;
  
  private metricsBuffer: any[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  
  // Performance counters
  private counters = {
    qaQuestions: 0,
    qaErrors: 0,
    extractionSuccess: 0,
    extractionErrors: 0,
    cacheHits: 0,
    cacheMisses: 0
  };

  private constructor() {
    super();
    this.sessionStartTime = new Date();
    this.currentSessionId = this.generateSessionId();
    this.startPeriodicFlush();
    this.startMetricsCleanup();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Q&A Performance Tracking
  trackQAQuery(
    questionId: string,
    question: string,
    startTime: number,
    options?: {
      vehicleInfo?: { year?: string; make?: string; model?: string };
      documentType?: string;
    }
  ): { complete: (success: boolean, confidence?: number, error?: Error) => void } {
    const metric: Partial<QAMetrics> = {
      questionId,
      question,
      timestamp: new Date(),
      vehicleInfo: options?.vehicleInfo,
      documentType: options?.documentType || 'unknown'
    };

    return {
      complete: (success: boolean, confidence?: number, error?: Error) => {
        const responseTime = Date.now() - startTime;
        
        const completedMetric: QAMetrics = {
          ...metric as QAMetrics,
          responseTime,
          confidence: confidence || 0,
          success,
          errorType: error?.message
        };

        this.qaMetrics.push(completedMetric);
        this.counters.qaQuestions++;
        
        if (!success) {
          this.counters.qaErrors++;
        }

        // Check for performance alerts
        if (responseTime > PERF_CONFIG.ALERT_THRESHOLDS.QA_RESPONSE_TIME_MS) {
          this.createAlert('qa_slow', 'warning', 
            `Q&A response time ${responseTime}ms exceeds threshold`, 
            { questionId, responseTime });
        }

        // Buffer the metric for batch processing
        this.bufferMetric('qa', completedMetric);
        
        // Emit event for real-time monitoring
        this.emit('qa:complete', completedMetric);
      }
    };
  }

  // Extraction Performance Tracking
  trackExtraction(
    documentId: string,
    documentType: ExtractionMetrics['documentType'],
    extractionType: ExtractionMetrics['extractionType']
  ): { complete: (itemsExtracted: number, accuracy?: number, errors?: Array<any>) => void } {
    const startTime = new Date();

    return {
      complete: (itemsExtracted: number, accuracy?: number, errors: Array<any> = []) => {
        const endTime = new Date();
        const duration = endTime.getTime() - startTime.getTime();

        const metric: ExtractionMetrics = {
          documentId,
          documentType,
          extractionType,
          startTime,
          endTime,
          duration,
          itemsExtracted,
          accuracy,
          errors: errors.map(e => ({
            type: e.type || 'unknown',
            message: e.message || String(e),
            timestamp: new Date()
          }))
        };

        this.extractionMetrics.push(metric);
        
        if (errors.length === 0) {
          this.counters.extractionSuccess++;
        } else {
          this.counters.extractionErrors++;
        }

        // Check for performance alerts
        if (duration > PERF_CONFIG.ALERT_THRESHOLDS.EXTRACTION_DURATION_MS) {
          this.createAlert('extraction_slow', 'warning',
            `Extraction took ${duration}ms for document ${documentId}`,
            { documentId, duration, documentType });
        }

        // Buffer the metric
        this.bufferMetric('extraction', metric);
        
        // Emit event
        this.emit('extraction:complete', metric);
      }
    };
  }

  // User Interaction Tracking
  trackUserInteraction(
    action: string,
    category: UserInteractionMetrics['category'],
    metadata?: Record<string, any>
  ) {
    const interaction: UserInteractionMetrics = {
      sessionId: this.currentSessionId,
      action,
      category,
      timestamp: new Date(),
      metadata
    };

    this.userInteractions.push(interaction);
    this.bufferMetric('interaction', interaction);
    this.emit('user:interaction', interaction);
  }

  // Cache performance tracking
  trackCacheHit(hit: boolean) {
    if (hit) {
      this.counters.cacheHits++;
    } else {
      this.counters.cacheMisses++;
    }
  }

  // Generate comprehensive analytics
  getAnalytics(): PerformanceAnalytics {
    const now = new Date();
    const recentQA = this.qaMetrics.filter(m => 
      now.getTime() - m.timestamp.getTime() < 24 * 60 * 60 * 1000
    );
    const recentExtractions = this.extractionMetrics.filter(m =>
      now.getTime() - m.startTime.getTime() < 24 * 60 * 60 * 1000
    );

    // Q&A Analytics
    const qaResponseTimes = recentQA.map(m => m.responseTime).sort((a, b) => a - b);
    const qaAnalytics = {
      totalQuestions: recentQA.length,
      averageResponseTime: this.calculateAverage(qaResponseTimes),
      successRate: recentQA.filter(m => m.success).length / (recentQA.length || 1),
      confidenceDistribution: this.calculateDistribution(recentQA.map(m => m.confidence)),
      responseTimePercentiles: this.calculatePercentiles(qaResponseTimes),
      errorRate: recentQA.filter(m => !m.success).length / (recentQA.length || 1),
      errorTypes: this.groupBy(recentQA.filter(m => m.errorType), 'errorType')
    };

    // Extraction Analytics
    const extractionDurations = recentExtractions.map(m => m.duration);
    const extractionAnalytics = {
      totalExtractions: recentExtractions.length,
      averageDuration: this.calculateAverage(extractionDurations),
      successRate: recentExtractions.filter(m => m.errors.length === 0).length / (recentExtractions.length || 1),
      accuracyRate: this.calculateAverage(recentExtractions.map(m => m.accuracy || 0)),
      throughput: this.calculateThroughput(recentExtractions),
      documentTypeBreakdown: this.groupBy(recentExtractions, 'documentType'),
      extractionTypeBreakdown: this.groupBy(recentExtractions, 'extractionType')
    };

    // User Behavior Analytics
    const sessions = this.groupBySessions(this.userInteractions);
    const userAnalytics = {
      totalSessions: Object.keys(sessions).length,
      averageSessionDuration: this.calculateAverageSessionDuration(sessions),
      actionsPerSession: this.calculateActionsPerSession(sessions),
      mostCommonActions: this.getMostCommonActions(this.userInteractions),
      peakUsageHours: this.calculatePeakUsageHours(this.userInteractions)
    };

    // System Analytics
    const systemAnalytics = {
      memoryUsage: this.getMemoryUsage(),
      cacheHitRate: this.counters.cacheHits / (this.counters.cacheHits + this.counters.cacheMisses || 1),
      queueBacklog: 0, // To be implemented with queue integration
      errorRate: (this.counters.qaErrors + this.counters.extractionErrors) / 
                 (this.counters.qaQuestions + this.counters.extractionSuccess + this.counters.extractionErrors || 1)
    };

    return {
      qa: qaAnalytics,
      extraction: extractionAnalytics,
      userBehavior: userAnalytics,
      system: systemAnalytics
    };
  }

  // Get recent alerts
  getAlerts(severity?: PerformanceAlert['severity']): PerformanceAlert[] {
    if (severity) {
      return this.alerts.filter(a => a.severity === severity);
    }
    return [...this.alerts];
  }

  // Clear old metrics
  private startMetricsCleanup() {
    setInterval(() => {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - PERF_CONFIG.METRICS_RETENTION_DAYS);

      this.qaMetrics = this.qaMetrics.filter(m => m.timestamp > cutoffDate);
      this.extractionMetrics = this.extractionMetrics.filter(m => m.startTime > cutoffDate);
      this.userInteractions = this.userInteractions.filter(m => m.timestamp > cutoffDate);
      this.alerts = this.alerts.filter(a => a.timestamp > cutoffDate);
    }, 24 * 60 * 60 * 1000); // Daily cleanup
  }

  // Periodic flush of buffered metrics
  private startPeriodicFlush() {
    this.flushTimer = setInterval(() => {
      this.flushMetrics();
    }, PERF_CONFIG.FLUSH_INTERVAL_MS);
  }

  private bufferMetric(type: string, metric: any) {
    this.metricsBuffer.push({ type, metric, timestamp: new Date() });
    
    if (this.metricsBuffer.length >= PERF_CONFIG.BATCH_SIZE) {
      this.flushMetrics();
    }
  }

  private flushMetrics() {
    if (this.metricsBuffer.length === 0) return;

    const batch = [...this.metricsBuffer];
    this.metricsBuffer = [];

    // Here you would send metrics to your analytics backend
    console.log(`PerformanceMonitor: Flushing ${batch.length} metrics`);
    
    // Emit for any listeners
    this.emit('metrics:flush', batch);
  }

  // Alert creation
  private createAlert(
    type: PerformanceAlert['type'],
    severity: PerformanceAlert['severity'],
    message: string,
    metadata?: Record<string, any>
  ) {
    const alert: PerformanceAlert = {
      id: this.generateId(),
      type,
      severity,
      message,
      timestamp: new Date(),
      metadata
    };

    this.alerts.push(alert);
    this.emit('alert', alert);

    // Log critical alerts
    if (severity === 'critical') {
      console.error(`CRITICAL PERFORMANCE ALERT: ${message}`, metadata);
    }
  }

  // Utility methods
  private calculateAverage(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
  }

  private calculatePercentiles(sortedNumbers: number[]): { p50: number; p75: number; p90: number; p95: number; p99: number; } {
    const result: { p50: number; p75: number; p90: number; p95: number; p99: number; } = {
      p50: 0,
      p75: 0,
      p90: 0,
      p95: 0,
      p99: 0
    };
    
    for (const percentile of PERF_CONFIG.PERCENTILE_BUCKETS) {
      const index = Math.ceil((percentile / 100) * sortedNumbers.length) - 1;
      const key = `p${percentile}` as keyof typeof result;
      result[key] = sortedNumbers[Math.max(0, index)] || 0;
    }
    
    return result;
  }

  private calculateDistribution(values: number[]): Record<string, number> {
    const buckets: Record<string, number> = {
      '0-20': 0,
      '20-40': 0,
      '40-60': 0,
      '60-80': 0,
      '80-100': 0
    };

    values.forEach(value => {
      const percent = value * 100;
      if (percent <= 20) buckets['0-20']++;
      else if (percent <= 40) buckets['20-40']++;
      else if (percent <= 60) buckets['40-60']++;
      else if (percent <= 80) buckets['60-80']++;
      else buckets['80-100']++;
    });

    return buckets;
  }

  private calculateThroughput(extractions: ExtractionMetrics[]): number {
    const totalItems = extractions.reduce((sum, e) => sum + e.itemsExtracted, 0);
    const totalTime = extractions.reduce((sum, e) => sum + e.duration, 0) / 1000; // Convert to seconds
    return totalTime > 0 ? totalItems / totalTime : 0;
  }

  private groupBy<T>(items: T[], key: keyof T): Record<string, number> {
    return items.reduce((acc, item) => {
      const value = String(item[key]);
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private groupBySessions(interactions: UserInteractionMetrics[]): Record<string, UserInteractionMetrics[]> {
    return interactions.reduce((acc, interaction) => {
      if (!acc[interaction.sessionId]) {
        acc[interaction.sessionId] = [];
      }
      acc[interaction.sessionId].push(interaction);
      return acc;
    }, {} as Record<string, UserInteractionMetrics[]>);
  }

  private calculateAverageSessionDuration(sessions: Record<string, UserInteractionMetrics[]>): number {
    const durations = Object.values(sessions).map(sessionInteractions => {
      if (sessionInteractions.length < 2) return 0;
      const sorted = sessionInteractions.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      return sorted[sorted.length - 1].timestamp.getTime() - sorted[0].timestamp.getTime();
    });
    
    return this.calculateAverage(durations);
  }

  private calculateActionsPerSession(sessions: Record<string, UserInteractionMetrics[]>): number {
    const counts = Object.values(sessions).map(s => s.length);
    return this.calculateAverage(counts);
  }

  private getMostCommonActions(interactions: UserInteractionMetrics[]): Array<{ action: string; count: number }> {
    const actionCounts = this.groupBy(interactions, 'action');
    return Object.entries(actionCounts)
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private calculatePeakUsageHours(interactions: UserInteractionMetrics[]): Array<{ hour: number; count: number }> {
    const hourCounts: Record<number, number> = {};
    
    interactions.forEach(interaction => {
      const hour = interaction.timestamp.getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    return Object.entries(hourCounts)
      .map(([hour, count]) => ({ hour: Number(hour), count }))
      .sort((a, b) => a.hour - b.hour);
  }

  private getMemoryUsage(): PerformanceAnalytics['system']['memoryUsage'] {
    // This would integrate with the actual memory monitoring
    // For now, return placeholder values
    return {
      current: process.memoryUsage?.().heapUsed / 1024 / 1024 || 0,
      peak: 0,
      average: 0
    };
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `session-${this.generateId()}`;
  }

  // Export data for analysis
  exportMetrics(format: 'json' | 'csv' = 'json'): string {
    const data = {
      analytics: this.getAnalytics(),
      alerts: this.getAlerts(),
      timestamp: new Date().toISOString()
    };

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    } else {
      // CSV export would be implemented here
      return 'CSV export not yet implemented';
    }
  }

  // Cleanup
  destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flushMetrics();
    this.removeAllListeners();
  }
}

// Singleton export
export const performanceMonitor = PerformanceMonitor.getInstance();

// Decorator for automatic performance tracking
export function trackPerformance(category: 'qa' | 'extraction') {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now();
      const monitor = PerformanceMonitor.getInstance();
      
      try {
        const result = await originalMethod.apply(this, args);
        
        if (category === 'qa') {
          const tracker = monitor.trackQAQuery(
            `${propertyKey}-${Date.now()}`,
            args[0] || 'Unknown question',
            startTime
          );
          tracker.complete(true, result?.confidence);
        }
        
        return result;
      } catch (error) {
        if (category === 'qa') {
          const tracker = monitor.trackQAQuery(
            `${propertyKey}-${Date.now()}`,
            args[0] || 'Unknown question',
            startTime
          );
          tracker.complete(false, 0, error as Error);
        }
        throw error;
      }
    };

    return descriptor;
  };
}

// Debug logging utilities
export const perfLog = {
  qa: (message: string, data?: any) => {
    console.log(`[PERF:QA] ${message}`, data || '');
  },
  extraction: (message: string, data?: any) => {
    console.log(`[PERF:EXTRACTION] ${message}`, data || '');
  },
  system: (message: string, data?: any) => {
    console.log(`[PERF:SYSTEM] ${message}`, data || '');
  },
  error: (message: string, error?: any) => {
    console.error(`[PERF:ERROR] ${message}`, error || '');
  }
};