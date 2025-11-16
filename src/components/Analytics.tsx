import React, { useEffect } from 'react';
import { useLocation } from '@docusaurus/router';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

/**
 * Enhanced analytics component with user behavior tracking
 */
export default function Analytics(): null {
  const location = useLocation();

  useEffect(() => {
    // Track page views
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', process.env.GOOGLE_ANALYTICS_ID, {
        page_path: location.pathname + location.search,
        page_title: document.title,
      });
    }
  }, [location]);

  useEffect(() => {
    // Track user engagement events
    const trackEngagement = () => {
      // Track scroll depth
      let maxScroll = 0;
      const trackScroll = () => {
        const scrollPercent = Math.round(
          (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
        );
        
        if (scrollPercent > maxScroll && scrollPercent % 25 === 0) {
          maxScroll = scrollPercent;
          
          if (window.gtag) {
            window.gtag('event', 'scroll_depth', {
              event_category: 'engagement',
              event_label: `${scrollPercent}%`,
              value: scrollPercent,
            });
          }
        }
      };

      // Track time on page
      const startTime = Date.now();
      const trackTimeOnPage = () => {
        const timeSpent = Math.round((Date.now() - startTime) / 1000);
        
        if (window.gtag) {
          window.gtag('event', 'time_on_page', {
            event_category: 'engagement',
            event_label: location.pathname,
            value: timeSpent,
          });
        }
      };

      // Track copy button clicks
      const trackCopyClicks = (event: Event) => {
        const target = event.target as HTMLElement;
        if (target.classList.contains('copy-button') || target.closest('.copy-button')) {
          if (window.gtag) {
            window.gtag('event', 'copy_code', {
              event_category: 'interaction',
              event_label: location.pathname,
            });
          }
        }
      };

      // Track search usage
      const trackSearch = (event: Event) => {
        const target = event.target as HTMLInputElement;
        if (target.classList.contains('DocSearch-Input') || target.closest('.DocSearch')) {
          if (window.gtag) {
            window.gtag('event', 'search', {
              event_category: 'interaction',
              event_label: target.value,
            });
          }
        }
      };

      // Track external link clicks
      const trackExternalLinks = (event: Event) => {
        const target = event.target as HTMLAnchorElement;
        if (target.tagName === 'A' && target.href && !target.href.includes(window.location.hostname)) {
          if (window.gtag) {
            window.gtag('event', 'click', {
              event_category: 'external_link',
              event_label: target.href,
            });
          }
        }
      };

      // Track download clicks
      const trackDownloads = (event: Event) => {
        const target = event.target as HTMLAnchorElement;
        if (target.tagName === 'A' && target.href) {
          const downloadExtensions = ['.pdf', '.zip', '.tar.gz', '.dmg', '.exe', '.deb', '.rpm'];
          const isDownload = downloadExtensions.some(ext => target.href.includes(ext));
          
          if (isDownload && window.gtag) {
            window.gtag('event', 'file_download', {
              event_category: 'download',
              event_label: target.href,
            });
          }
        }
      };

      // Add event listeners
      window.addEventListener('scroll', trackScroll, { passive: true });
      window.addEventListener('beforeunload', trackTimeOnPage);
      document.addEventListener('click', trackCopyClicks);
      document.addEventListener('input', trackSearch);
      document.addEventListener('click', trackExternalLinks);
      document.addEventListener('click', trackDownloads);

      // Cleanup function
      return () => {
        window.removeEventListener('scroll', trackScroll);
        window.removeEventListener('beforeunload', trackTimeOnPage);
        document.removeEventListener('click', trackCopyClicks);
        document.removeEventListener('input', trackSearch);
        document.removeEventListener('click', trackExternalLinks);
        document.removeEventListener('click', trackDownloads);
      };
    };

    // Only track in production
    if (process.env.NODE_ENV === 'production') {
      const cleanup = trackEngagement();
      return cleanup;
    }
  }, [location]);

  // Track performance metrics
  useEffect(() => {
    if (process.env.NODE_ENV === 'production' && 'PerformanceObserver' in window) {
      // Track Core Web Vitals
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (window.gtag) {
            // Track different performance metrics
            switch (entry.entryType) {
              case 'largest-contentful-paint':
                window.gtag('event', 'web_vitals', {
                  event_category: 'performance',
                  event_label: 'LCP',
                  value: Math.round(entry.startTime),
                });
                break;
              
              case 'first-input':
                window.gtag('event', 'web_vitals', {
                  event_category: 'performance',
                  event_label: 'FID',
                  value: Math.round((entry as any).processingStart - entry.startTime),
                });
                break;
              
              case 'layout-shift':
                if (!(entry as any).hadRecentInput) {
                  window.gtag('event', 'web_vitals', {
                    event_category: 'performance',
                    event_label: 'CLS',
                    value: Math.round((entry as any).value * 1000),
                  });
                }
                break;
            }
          }
        });
      });

      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });

      return () => observer.disconnect();
    }
  }, []);

  return null;
}