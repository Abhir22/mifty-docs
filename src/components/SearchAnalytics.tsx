import React, { useEffect } from 'react';

export default function SearchAnalytics(): null {
  useEffect(() => {
    // Track search analytics for improving search experience
    const trackSearchAnalytics = () => {
      const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
      if (!searchInput) return;

      let searchStartTime: number;
      let searchQuery = '';

      const handleSearchStart = () => {
        searchStartTime = Date.now();
      };

      const handleSearchInput = (e: Event) => {
        const target = e.target as HTMLInputElement;
        searchQuery = target.value.trim();
        
        if (searchQuery.length >= 2) {
          handleSearchStart();
        }
      };

      const handleSearchResults = () => {
        if (searchQuery && searchStartTime) {
          const searchDuration = Date.now() - searchStartTime;
          const resultsCount = document.querySelectorAll('.aa-Item').length;
          
          // Log search analytics (can be sent to analytics service)
          console.log('Search Analytics:', {
            query: searchQuery,
            duration: searchDuration,
            resultsCount: resultsCount,
            timestamp: new Date().toISOString()
          });

          // Track popular search terms
          const popularSearches = JSON.parse(localStorage.getItem('mifty-popular-searches') || '{}');
          popularSearches[searchQuery] = (popularSearches[searchQuery] || 0) + 1;
          localStorage.setItem('mifty-popular-searches', JSON.stringify(popularSearches));
        }
      };

      const handleSearchResultClick = (e: Event) => {
        const target = e.target as HTMLElement;
        const resultItem = target.closest('.aa-Item');
        if (resultItem && searchQuery) {
          const resultTitle = resultItem.querySelector('.aa-ItemContentTitle')?.textContent || 'Unknown';
          
          console.log('Search Result Click:', {
            query: searchQuery,
            resultTitle: resultTitle,
            timestamp: new Date().toISOString()
          });
        }
      };

      // Attach event listeners
      searchInput.addEventListener('input', handleSearchInput);
      
      // Listen for search results appearing
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            const searchPanel = document.querySelector('.aa-Panel');
            if (searchPanel) {
              handleSearchResults();
              
              // Add click tracking to results
              const resultItems = searchPanel.querySelectorAll('.aa-Item');
              resultItems.forEach(item => {
                item.addEventListener('click', handleSearchResultClick);
              });
            }
          }
        });
      });

      // Observe document for search results
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      return () => {
        searchInput.removeEventListener('input', handleSearchInput);
        observer.disconnect();
      };
    };

    const cleanup = trackSearchAnalytics();

    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  return null;
}