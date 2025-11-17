import React, { useState, useEffect, useRef } from 'react';
import { useHistory } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { translate } from '@docusaurus/Translate';
import SearchBar from '@theme-original/SearchBar';
import type SearchBarType from '@theme/SearchBar';
import type { WrapperProps } from '@docusaurus/types';

type Props = WrapperProps<typeof SearchBarType>;

export default function SearchBarWrapper(props: Props): JSX.Element {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { siteConfig } = useDocusaurusContext();
  const history = useHistory();

  // Enhanced keyboard shortcuts for search
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + K to focus search
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          setIsSearchFocused(true);
        }
      }
      
      // Escape to blur search
      if (event.key === 'Escape' && isSearchFocused) {
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.blur();
          setSearchQuery('');
          setIsSearchFocused(false);
          setShowSuggestions(false);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSearchFocused]);

  // Enhanced search suggestions
  const getSearchSuggestions = (query: string): string[] => {
    if (!query || query.length < 2) return [];
    
    const suggestions = [
      'getting started',
      'installation guide',
      'quick start tutorial',
      'framework architecture',
      'database configuration',
      'CLI commands',
      'API reference',
      'modular architecture',
      'TypeScript support',
      'Prisma integration',
      'code generation',
      'visual database designer',
      'troubleshooting guide',
      'best practices',
      'deployment guide',
      'testing framework',
      'authentication setup',
      'middleware configuration',
      'routing system',
      'data validation',
      'error handling',
      'performance optimization',
      'security features',
      'environment setup'
    ];

    return suggestions.filter(suggestion =>
      suggestion.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 6);
  };

  // Handle search input changes
  useEffect(() => {
    const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
    if (searchInput) {
      const handleInput = (e: Event) => {
        const target = e.target as HTMLInputElement;
        setSearchQuery(target.value);
        setShowSuggestions(target.value.length >= 2);
      };

      const handleFocus = () => {
        setIsSearchFocused(true);
        if (searchQuery.length >= 2) {
          setShowSuggestions(true);
        }
      };

      const handleBlur = () => {
        setTimeout(() => {
          setIsSearchFocused(false);
          setShowSuggestions(false);
        }, 200);
      };

      searchInput.addEventListener('input', handleInput);
      searchInput.addEventListener('focus', handleFocus);
      searchInput.addEventListener('blur', handleBlur);

      return () => {
        searchInput.removeEventListener('input', handleInput);
        searchInput.removeEventListener('focus', handleFocus);
        searchInput.removeEventListener('blur', handleBlur);
      };
    }
  }, [searchQuery]);

  const suggestions = getSearchSuggestions(searchQuery);

  return (
    <div className="enhanced-search-wrapper">
      <SearchBar {...props} />
      
      {/* Search Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="search-suggestions">
          <div className="search-suggestions-header">
            <span>💡 Quick suggestions</span>
          </div>
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="search-suggestion-item"
              onClick={() => {
                const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
                if (searchInput) {
                  searchInput.value = suggestion;
                  searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                  searchInput.focus();
                }
                setShowSuggestions(false);
              }}
            >
              <span className="suggestion-icon">🔍</span>
              <span className="suggestion-text">{suggestion}</span>
            </div>
          ))}
        </div>
      )}
      
      <style jsx>{`
        .enhanced-search-wrapper {
          position: relative;
        }
        
        .search-suggestions {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: var(--ifm-background-color);
          border: 1px solid var(--ifm-color-emphasis-300);
          border-radius: 8px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
          z-index: 1000;
          margin-top: 4px;
          overflow: hidden;
          max-height: 300px;
          overflow-y: auto;
        }
        
        .search-suggestions-header {
          padding: 8px 12px;
          background: var(--ifm-color-emphasis-100);
          border-bottom: 1px solid var(--ifm-color-emphasis-200);
          font-size: 12px;
          font-weight: 600;
          color: var(--ifm-color-emphasis-700);
        }
        
        .search-suggestion-item {
          display: flex;
          align-items: center;
          padding: 10px 12px;
          cursor: pointer;
          transition: background-color 0.2s ease;
          border-bottom: 1px solid var(--ifm-color-emphasis-100);
        }
        
        .search-suggestion-item:hover {
          background-color: var(--ifm-color-primary-lightest);
        }
        
        .search-suggestion-item:last-child {
          border-bottom: none;
        }
        
        .suggestion-icon {
          margin-right: 8px;
          opacity: 0.6;
          font-size: 12px;
        }
        
        .suggestion-text {
          font-size: 14px;
          color: var(--ifm-font-color-base);
        }
        
        /* Dark mode adjustments */
        [data-theme='dark'] .search-suggestions {
          background: var(--ifm-background-surface-color);
          border-color: var(--ifm-color-emphasis-300);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        
        [data-theme='dark'] .search-suggestions-header {
          background: var(--ifm-color-emphasis-200);
          color: var(--ifm-color-emphasis-800);
        }
        
        [data-theme='dark'] .search-suggestion-item:hover {
          background-color: var(--ifm-color-primary-darkest);
        }
        
        /* Mobile responsive */
        @media (max-width: 768px) {
          .search-suggestions {
            left: -20px;
            right: -20px;
          }
        }
      `}</style>
    </div>
  );
}