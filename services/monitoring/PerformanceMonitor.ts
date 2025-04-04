// services/monitoring/PerformanceMonitor.ts
import { InteractionManager } from 'react-native';
import { Performance, Trace } from '@react-native-firebase/perf';
import { MemoryInfo } from 'react-native-device-info';
import { analyticsService } from '../analytics/AnalyticsService';

interface PerformanceMetrics {
  frameRate: number;
  memoryUsage: number;
  batteryLevel: number;
  networkLatency: number;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private traces: Map<string, Trace> = new Map();
  private metrics: PerformanceMetrics = {
    frameRate: 0,
    memoryUsage: 0,
    batteryLevel: 0,
    networkLatency: 0,
  };

  private constructor() {
    this.startMonitoring();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private startMonitoring() {
    // Monitor frame rate
    let lastFrameTime = Date.now();
    let frames = 0;

    InteractionManager.runAfterInteractions(() => {
      setInterval(() => {
        const currentTime = Date.now();
        const elapsed = currentTime - lastFrameTime;
        this.metrics.frameRate = frames / (elapsed / 1000);
        frames = 0;
        lastFrameTime = currentTime;

        this.reportMetrics();
      }, 1000);
    });

    // Monitor memory usage
    setInterval(async () => {
      const memoryInfo = await MemoryInfo.getMemoryInfo();
      this.metrics.memoryUsage = memoryInfo.usedMemory;
    }, 5000);
  }

  async startTrace(traceName: string): Promise<void> {
    try {
      const trace = await Performance().startTrace(traceName);
      this.traces.set(traceName, trace);
    } catch (error) {
      console.error(`Failed to start trace ${traceName}:`, error);
    }
  }

  async stopTrace(traceName: string, metrics?: Record<string, number>): Promise<void> {
    try {
      const trace = this.traces.get(traceName);
      if (trace) {
        if (metrics) {
          Object.entries(metrics).forEach(([key, value]) => {
            trace.putMetric(key, value);
          });
        }
        await trace.stop();
        this.traces.delete(traceName);
      }
    } catch (error) {
      console.error(`Failed to stop trace ${traceName}:`, error);
    }
  }

  async measureNetworkRequest(url: string): Promise<void> {
    const startTime = Date.now();
    try {
      const response = await fetch(url);
      const endTime = Date.now();
      this.metrics.networkLatency = endTime - startTime;

      analyticsService.track('Network_Request', {
        url,
        duration: endTime - startTime,
        status: response.status,
      });
    } catch (error) {
      console.error('Network request failed:', error);
    }
  }

  private reportMetrics() {
    analyticsService.track('Performance_Metrics', this.metrics);

    // Alert if metrics exceed thresholds
    if (this.metrics.frameRate < 30) {
      console.warn('Low frame rate detected');
    }

    if (this.metrics.memoryUsage > 500 * 1024 * 1024) { // 500MB
      console.warn('High memory usage detected');
    }
  }

  async measureFunction<T>(
    name: string,
    fn: () => Promise<T>
  ): Promise<T> {
    await this.startTrace(name);
    try {
      const result = await fn();
      return result;
    } finally {
      await this.stopTrace(name);
    }
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();