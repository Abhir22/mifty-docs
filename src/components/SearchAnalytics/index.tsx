import React, { useEffect } from 'react';
import { useLocation } from '@docusaurus/router';

interface SearchAnalyticsProps {
  children: React.ReactNode;
}

interface SearchEvent {
  query: string;
  results: number;
  timestamp: number;
  page: string;
  clicked?: boolean;
  clickedResult?: string;
}

class SearchAnalytics {
  private static instance: SearchAnalytics;
  private events: SearchEvent[] = [];
  private isEnabled: boolean = true;

  static getInstance(): SearchAnalytics {
    if (!SearchAnalytics.instance) {
      SearchAnalytics.instance = new SearchAnalytics();
    }
    return SearchAnalytics.instance;
  }

  trackSearch(query: string, results: number, page: string): void {
    if (!this.isEnabled) return;

    const event: SearchEvent = {
      query,
      results,
      timestamp: Date.now(),
      page,
    };

    this.events.push(event);
    this.sendToAnalytics(event);
  }

  trackSearchClick(query: string, clickedResult: string, page: string): void {
    if (!this.isEnabled) return;

    const event: SearchEvent = {
      query,
      results: 1,
      timestamp: Date.now(),
      page,
      clicked: true,
      clickedResult,
    };

    this.events.push(event);
    this.sendToAnalytics(event);
  }

  private sendToAnalytics(event: SearchEvent): void {
    // Send to Google Analytics if available
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'search', {
        search_term: event.query,
        results_count: event.results,
        page_location: event.page,
        custom_map: {
          clicked: event.clicked ? 'true' : 'false',
          clicked_result: event.clickedResult || '',
        },
      });
    }

    // Send to custom analytics endpoint if configured
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/analytics/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }).catch(() => {
        // Silently fail if analytics endpoint is not available
      });
    }
  }

  getSearchStats(): {
    totalSearches: number;
    uniqueQueries: number;
    averageResults: number;
    topQueries: Array<{ query: string; count: number }>;
  } {
    const totalSearches = this.events.length;
    const queries = this.events.map(e => e.query.toLowerCase());
    const uniqueQueries = new Set(queries).size;
    const averageResults = this.events.reduce((sum, e) => sum + e.results, 0) / totalSearches || 0;
    
    const queryCount = queries.reduce((acc, query) => {
      acc[query] = (acc[query] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topQueries = Object.entries(queryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([query, count]) => ({ query, count }));

    return {
      totalSearches,
      uniqueQueries,
      averageResults,
      topQueries,
    };
  }

  disable(): void {
    this.isEnabled = false;
  }

  enable(): void {
    this.isEnabled = true;
  }
}

export default function SearchAnalyticsProvider({ children }: SearchAnalyticsProps): JSX.Element {
  const location = useLocation();

  useEffect(() => {
    // Initialize search analytics
    const analytics = SearchAnalytics.getInstance();
    
    // Make analytics available globally for search components
    if (typeof window !== 'undefined') {
      (window as any).searchAnalytics = analytics;
    }

    // Track page views for search context
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        page_title: document.title,
        page_location: window.location.href,
      });
    }
  }, [location]);

  return <>{children}</>;
}

// Export the analytics class for use in other components
export { SearchAnalytics };