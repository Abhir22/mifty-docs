import React, { useEffect, useState } from 'react';

interface PerformanceMetrics {
  fcp: number | null; // First Contentful Paint
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift
  ttfb: number | null; // Time to First Byte
}

/**
 * Performance monitoring component for Core Web Vitals
 * Only active in development mode
 */
export default function PerformanceMonitor(): JSX.Element | null {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    // Measure Time to First Byte
    const measureTTFB = () => {
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigationEntry) {
        const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
        setMetrics(prev => ({ ...prev, ttfb }));
      }
    };

    // Measure First Contentful Paint
    const measureFCP = () => {
      const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
      if (fcpEntry) {
        setMetrics(prev => ({ ...prev, fcp: fcpEntry.startTime }));
      }
    };

    // Measure Largest Contentful Paint
    const measureLCP = () => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }));
        });
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      }
    };

    // Measure First Input Delay
    const measureFID = () => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            setMetrics(prev => ({ ...prev, fid: entry.processingStart - entry.startTime }));
          });
        });
        observer.observe({ entryTypes: ['first-input'] });
      }
    };

    // Measure Cumulative Layout Shift
    const measureCLS = () => {
      if ('PerformanceObserver' in window) {
        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
              setMetrics(prev => ({ ...prev, cls: clsValue }));
            }
          });
        });
        observer.observe({ entryTypes: ['layout-shift'] });
      }
    };

    // Initialize measurements
    measureTTFB();
    measureFCP();
    measureLCP();
    measureFID();
    measureCLS();

    // Measure additional metrics after page load
    window.addEventListener('load', () => {
      setTimeout(() => {
        measureFCP();
        measureTTFB();
      }, 100);
    });

  }, []);

  // Don't render in production
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const getScoreColor = (metric: string, value: number | null): string => {
    if (value === null) return '#6b7280';
    
    switch (metric) {
      case 'fcp':
        return value <= 1800 ? '#10b981' : value <= 3000 ? '#f59e0b' : '#ef4444';
      case 'lcp':
        return value <= 2500 ? '#10b981' : value <= 4000 ? '#f59e0b' : '#ef4444';
      case 'fid':
        return value <= 100 ? '#10b981' : value <= 300 ? '#f59e0b' : '#ef4444';
      case 'cls':
        return value <= 0.1 ? '#10b981' : value <= 0.25 ? '#f59e0b' : '#ef4444';
      case 'ttfb':
        return value <= 800 ? '#10b981' : value <= 1800 ? '#f59e0b' : '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const formatValue = (metric: string, value: number | null): string => {
    if (value === null) return 'Measuring...';
    
    if (metric === 'cls') {
      return value.toFixed(3);
    }
    return `${Math.round(value)}ms`;
  };

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        zIndex: 9999,
        backgroundColor: '#fff',
        border: '2px solid #10b981',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        maxWidth: '300px',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <button
        onClick={() => setIsVisible(!isVisible)}
        style={{
          width: '100%',
          padding: '12px 16px',
          backgroundColor: '#10b981',
          color: 'white',
          border: 'none',
          borderRadius: '6px 6px 0 0',
          cursor: 'pointer',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
        aria-expanded={isVisible}
        aria-controls="performance-metrics"
      >
        <span>Performance</span>
        <span>{isVisible ? '▼' : '▶'}</span>
      </button>
      
      {isVisible && (
        <div 
          id="performance-metrics"
          style={{
            padding: '12px',
          }}
        >
          <div style={{ display: 'grid', gap: '8px' }}>
            {Object.entries(metrics).map(([key, value]) => (
              <div
                key={key}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '4px 0',
                }}
              >
                <span style={{ fontSize: '12px', fontWeight: '500', textTransform: 'uppercase' }}>
                  {key}
                </span>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: getScoreColor(key, value),
                  }}
                >
                  {formatValue(key, value)}
                </span>
              </div>
            ))}
          </div>
          
          <div style={{ marginTop: '12px', padding: '8px', backgroundColor: '#f9fafb', borderRadius: '4px' }}>
            <p style={{ margin: 0, fontSize: '11px', color: '#6b7280' }}>
              <strong>Thresholds:</strong><br />
              🟢 Good | 🟡 Needs Improvement | 🔴 Poor
            </p>
          </div>
        </div>
      )}
    </div>
  );
}