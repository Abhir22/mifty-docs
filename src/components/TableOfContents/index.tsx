import React, { useState, useEffect, useRef } from 'react';
import { useDoc } from '@docusaurus/theme-common/internal';
import { translate } from '@docusaurus/Translate';
import clsx from 'clsx';

import './styles.css';

interface TOCItem {
  id: string;
  value: string;
  level: number;
  children?: TOCItem[];
}

interface TableOfContentsProps {
  toc?: TOCItem[];
  minHeadingLevel?: number;
  maxHeadingLevel?: number;
  className?: string;
}

export default function TableOfContents({
  toc,
  minHeadingLevel = 2,
  maxHeadingLevel = 4,
  className,
}: TableOfContentsProps): JSX.Element | null {
  const doc = useDoc();
  const [activeId, setActiveId] = useState<string>('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Use provided toc or get from doc metadata
  const tocItems = toc || doc?.metadata?.toc || [];

  // Filter TOC items by heading level
  const filteredToc = tocItems.filter(
    item => item.level >= minHeadingLevel && item.level <= maxHeadingLevel
  );

  useEffect(() => {
    if (filteredToc.length === 0) return;

    // Create intersection observer to track active headings
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter(entry => entry.isIntersecting);
        
        if (visibleEntries.length > 0) {
          // Get the first visible heading
          const firstVisible = visibleEntries[0];
          setActiveId(firstVisible.target.id);
        }
      },
      {
        rootMargin: '-20% 0% -35% 0%',
        threshold: 0,
      }
    );

    // Observe all headings
    filteredToc.forEach(item => {
      const element = document.getElementById(item.id);
      if (element && observerRef.current) {
        observerRef.current.observe(element);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [filteredToc]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
      
      // Update URL hash
      if (window.history.replaceState) {
        window.history.replaceState(null, '', `#${id}`);
      }
    }
  };

  const getEstimatedReadingTime = () => {
    if (!doc?.contentTitle) return null;
    
    // Rough estimation: 200 words per minute
    const content = document.querySelector('article')?.textContent || '';
    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);
    
    return readingTime;
  };

  const renderTOCItem = (item: TOCItem, index: number) => (
    <li key={item.id} className={`toc-item toc-level-${item.level}`}>
      <button
        className={clsx('toc-link', {
          'toc-link--active': activeId === item.id,
        })}
        onClick={() => scrollToHeading(item.id)}
        type="button"
      >
        <span className="toc-link-text">{item.value}</span>
      </button>
      {item.children && item.children.length > 0 && (
        <ul className="toc-list toc-list--nested">
          {item.children.map((child, childIndex) => renderTOCItem(child, childIndex))}
        </ul>
      )}
    </li>
  );

  if (filteredToc.length === 0) {
    return null;
  }

  const readingTime = getEstimatedReadingTime();

  return (
    <div className={clsx('table-of-contents', className)}>
      <div className="toc-header">
        <h3 className="toc-title">
          {translate({
            id: 'theme.TOC.title',
            message: 'On this page',
            description: 'Title for the table of contents',
          })}
        </h3>
        
        <div className="toc-controls">
          {readingTime && (
            <span className="toc-reading-time">
              {translate(
                {
                  id: 'theme.TOC.readingTime',
                  message: '{readingTime} min read',
                  description: 'Estimated reading time',
                },
                { readingTime }
              )}
            </span>
          )}
          
          <button
            className="toc-collapse-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={
              isCollapsed
                ? translate({
                    id: 'theme.TOC.expand',
                    message: 'Expand table of contents',
                    description: 'Button to expand TOC',
                  })
                : translate({
                    id: 'theme.TOC.collapse',
                    message: 'Collapse table of contents',
                    description: 'Button to collapse TOC',
                  })
            }
            type="button"
          >
            <span className={clsx('toc-collapse-icon', {
              'toc-collapse-icon--collapsed': isCollapsed,
            })}>
              ▼
            </span>
          </button>
        </div>
      </div>
      
      <div className={clsx('toc-content', {
        'toc-content--collapsed': isCollapsed,
      })}>
        <nav className="toc-nav" aria-label="Table of contents">
          <ul className="toc-list">
            {filteredToc.map((item, index) => renderTOCItem(item, index))}
          </ul>
        </nav>
        
        <div className="toc-progress">
          <div className="toc-progress-bar">
            <div 
              className="toc-progress-fill"
              style={{
                height: `${(filteredToc.findIndex(item => item.id === activeId) + 1) / filteredToc.length * 100}%`
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}