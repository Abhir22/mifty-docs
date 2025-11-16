import React from 'react';
import { useDocSearchKeyboardEvents } from '@docusaurus/theme-search-algolia/client';
import { DocSearchButton, useDocSearchKeyboardEvents as useDocSearchKeyboardEventsOriginal } from '@docsearch/react';
import { translate } from '@docusaurus/Translate';
import { useColorMode } from '@docusaurus/theme-common';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

import '@docsearch/css';
import './styles.css';

interface SearchEnhancedProps {
  className?: string;
}

export default function SearchEnhanced({ className }: SearchEnhancedProps): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  const { colorMode } = useColorMode();
  
  // Get Algolia config from site config
  const algoliaConfig = siteConfig.themeConfig.algolia;
  
  // Track search analytics
  const trackSearchAnalytics = (query: string, results: number) => {
    // Send analytics data to your preferred analytics service
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'search', {
        search_term: query,
        results_count: results,
      });
    }
  };

  const searchButtonTranslations = {
    buttonText: translate({
      id: 'theme.SearchBar.label',
      message: 'Search',
      description: 'The ARIA label and placeholder for search button',
    }),
    buttonAriaLabel: translate({
      id: 'theme.SearchBar.label',
      message: 'Search',
      description: 'The ARIA label and placeholder for search button',
    }),
  };

  return (
    <div className={`search-enhanced ${className || ''}`}>
      <DocSearchButton
        onTouchStart={() => {
          import('@docsearch/react/modal').then(({ DocSearchModal }) => {
            const searchContainer = document.createElement('div');
            document.body.insertBefore(searchContainer, document.body.firstChild);
            
            const root = ReactDOM.createRoot(searchContainer);
            root.render(
              <DocSearchModal
                {...algoliaConfig}
                initialScrollY={window.scrollY}
                onClose={() => {
                  document.body.removeChild(searchContainer);
                }}
                transformItems={(items) => {
                  // Track search results
                  trackSearchAnalytics('', items.length);
                  
                  // Transform items for better display
                  return items.map((item) => ({
                    ...item,
                    // Add custom formatting or filtering here
                  }));
                }}
                hitComponent={({ hit, children }) => (
                  <div className="search-hit-enhanced">
                    {children}
                    <div className="search-hit-meta">
                      {hit.hierarchy?.lvl0 && (
                        <span className="search-hit-category">
                          {hit.hierarchy.lvl0}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              />
            );
          });
        }}
        translations={searchButtonTranslations}
      />
    </div>
  );
}