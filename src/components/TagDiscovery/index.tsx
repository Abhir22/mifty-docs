import React, { useState, useMemo } from 'react';
import Link from '@docusaurus/Link';
import { useAllDocsData } from '@docusaurus/plugin-content-docs/client';
import { translate } from '@docusaurus/Translate';
import clsx from 'clsx';

import './styles.css';

interface TaggedContent {
  id: string;
  title: string;
  permalink: string;
  description?: string;
  tags: string[];
  category?: string;
}

interface TagDiscoveryProps {
  currentTags?: string[];
  excludeCurrentPage?: boolean;
  maxItems?: number;
  showCategories?: boolean;
}

export default function TagDiscovery({
  currentTags = [],
  excludeCurrentPage = true,
  maxItems = 12,
  showCategories = true,
}: TagDiscoveryProps): JSX.Element {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const allDocsData = useAllDocsData();
  
  // Extract all content with tags
  const taggedContent = useMemo(() => {
    const content: TaggedContent[] = [];
    
    Object.values(allDocsData).forEach((docsData) => {
      Object.values(docsData.versions).forEach((version) => {
        Object.values(version.docs).forEach((doc) => {
          if (doc.tags && doc.tags.length > 0) {
            content.push({
              id: doc.id,
              title: doc.title,
              permalink: doc.permalink,
              description: doc.description,
              tags: doc.tags.map(tag => typeof tag === 'string' ? tag : tag.label),
              category: getCategoryFromPath(doc.permalink),
            });
          }
        });
      });
    });
    
    return content;
  }, [allDocsData]);

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    taggedContent.forEach(content => {
      content.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [taggedContent]);

  // Get all unique categories
  const allCategories = useMemo(() => {
    const categories = new Set<string>();
    taggedContent.forEach(content => {
      if (content.category) {
        categories.add(content.category);
      }
    });
    return Array.from(categories).sort();
  }, [taggedContent]);

  // Filter content based on selected tags and category
  const filteredContent = useMemo(() => {
    let filtered = taggedContent;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(content => content.category === selectedCategory);
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(content =>
        selectedTags.some(tag => content.tags.includes(tag))
      );
    }

    // Sort by relevance (number of matching tags)
    if (currentTags.length > 0) {
      filtered.sort((a, b) => {
        const aMatches = a.tags.filter(tag => currentTags.includes(tag)).length;
        const bMatches = b.tags.filter(tag => currentTags.includes(tag)).length;
        return bMatches - aMatches;
      });
    }

    return filtered.slice(0, maxItems);
  }, [taggedContent, selectedTags, selectedCategory, currentTags, maxItems]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSelectedTags([]);
    setSelectedCategory('all');
  };

  return (
    <div className="tag-discovery">
      <div className="tag-discovery-header">
        <h3>
          {translate({
            id: 'theme.tagDiscovery.title',
            message: 'Discover Content',
            description: 'Title for the tag discovery component',
          })}
        </h3>
        
        {(selectedTags.length > 0 || selectedCategory !== 'all') && (
          <button
            className="clear-filters-btn"
            onClick={clearFilters}
            type="button"
          >
            {translate({
              id: 'theme.tagDiscovery.clearFilters',
              message: 'Clear Filters',
              description: 'Button to clear all filters',
            })}
          </button>
        )}
      </div>

      {showCategories && allCategories.length > 0 && (
        <div className="category-filters">
          <label className="filter-label">
            {translate({
              id: 'theme.tagDiscovery.categories',
              message: 'Categories:',
              description: 'Label for category filters',
            })}
          </label>
          <div className="category-buttons">
            <button
              className={clsx('category-btn', {
                'category-btn--active': selectedCategory === 'all',
              })}
              onClick={() => setSelectedCategory('all')}
              type="button"
            >
              All
            </button>
            {allCategories.map(category => (
              <button
                key={category}
                className={clsx('category-btn', {
                  'category-btn--active': selectedCategory === category,
                })}
                onClick={() => setSelectedCategory(category)}
                type="button"
              >
                {formatCategoryName(category)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="tag-filters">
        <label className="filter-label">
          {translate({
            id: 'theme.tagDiscovery.tags',
            message: 'Tags:',
            description: 'Label for tag filters',
          })}
        </label>
        <div className="tag-buttons">
          {allTags.map(tag => (
            <button
              key={tag}
              className={clsx('tag-btn', {
                'tag-btn--active': selectedTags.includes(tag),
                'tag-btn--current': currentTags.includes(tag),
              })}
              onClick={() => toggleTag(tag)}
              type="button"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="content-grid">
        {filteredContent.length > 0 ? (
          filteredContent.map(content => (
            <div key={content.id} className="content-card">
              <Link to={content.permalink} className="content-card-link">
                <h4 className="content-title">{content.title}</h4>
                {content.description && (
                  <p className="content-description">{content.description}</p>
                )}
                <div className="content-tags">
                  {content.tags.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className={clsx('content-tag', {
                        'content-tag--current': currentTags.includes(tag),
                      })}
                    >
                      {tag}
                    </span>
                  ))}
                  {content.tags.length > 3 && (
                    <span className="content-tag-more">
                      +{content.tags.length - 3}
                    </span>
                  )}
                </div>
              </Link>
            </div>
          ))
        ) : (
          <div className="no-content">
            <p>
              {translate({
                id: 'theme.tagDiscovery.noContent',
                message: 'No content found with the selected filters.',
                description: 'Message when no content matches filters',
              })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function getCategoryFromPath(permalink: string): string {
  const pathParts = permalink.split('/').filter(Boolean);
  if (pathParts.length >= 2 && pathParts[0] === 'docs') {
    return pathParts[1];
  }
  return 'general';
}

function formatCategoryName(category: string): string {
  return category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}