import React, { useMemo } from 'react';
import Link from '@docusaurus/Link';
import { useAllDocsData } from '@docusaurus/plugin-content-docs/client';
import { useDoc } from '@docusaurus/theme-common/internal';
import { translate } from '@docusaurus/Translate';
import clsx from 'clsx';

import './styles.css';

interface RelatedArticle {
  id: string;
  title: string;
  permalink: string;
  description?: string;
  tags: string[];
  category: string;
  relevanceScore: number;
}

interface RelatedArticlesProps {
  maxItems?: number;
  showScores?: boolean;
  className?: string;
}

export default function RelatedArticles({
  maxItems = 6,
  showScores = false,
  className,
}: RelatedArticlesProps): JSX.Element | null {
  const currentDoc = useDoc();
  const allDocsData = useAllDocsData();

  const relatedArticles = useMemo(() => {
    if (!currentDoc) return [];

    const currentTags = currentDoc.metadata.tags?.map(tag => 
      typeof tag === 'string' ? tag : tag.label
    ) || [];
    const currentCategory = getCategoryFromPath(currentDoc.metadata.permalink);
    const currentTitle = currentDoc.metadata.title.toLowerCase();
    const currentDescription = currentDoc.metadata.description?.toLowerCase() || '';

    const allArticles: RelatedArticle[] = [];

    // Collect all articles
    Object.values(allDocsData).forEach((docsData) => {
      Object.values(docsData.versions).forEach((version) => {
        Object.values(version.docs).forEach((doc) => {
          // Skip current document
          if (doc.id === currentDoc.metadata.id) return;

          const docTags = doc.tags?.map(tag => 
            typeof tag === 'string' ? tag : tag.label
          ) || [];
          const docCategory = getCategoryFromPath(doc.permalink);

          // Calculate relevance score
          let relevanceScore = 0;

          // Tag similarity (highest weight)
          const commonTags = docTags.filter(tag => currentTags.includes(tag));
          relevanceScore += commonTags.length * 10;

          // Category similarity
          if (docCategory === currentCategory) {
            relevanceScore += 5;
          }

          // Title similarity (basic keyword matching)
          const titleWords = currentTitle.split(' ').filter(word => word.length > 3);
          const docTitleLower = doc.title.toLowerCase();
          titleWords.forEach(word => {
            if (docTitleLower.includes(word)) {
              relevanceScore += 3;
            }
          });

          // Description similarity
          if (currentDescription && doc.description) {
            const descWords = currentDescription.split(' ').filter(word => word.length > 4);
            const docDescLower = doc.description.toLowerCase();
            descWords.forEach(word => {
              if (docDescLower.includes(word)) {
                relevanceScore += 2;
              }
            });
          }

          // Only include articles with some relevance
          if (relevanceScore > 0) {
            allArticles.push({
              id: doc.id,
              title: doc.title,
              permalink: doc.permalink,
              description: doc.description,
              tags: docTags,
              category: docCategory,
              relevanceScore,
            });
          }
        });
      });
    });

    // Sort by relevance score and return top items
    return allArticles
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, maxItems);
  }, [currentDoc, allDocsData, maxItems]);

  if (relatedArticles.length === 0) {
    return null;
  }

  return (
    <div className={clsx('related-articles', className)}>
      <h3 className="related-articles-title">
        {translate({
          id: 'theme.relatedArticles.title',
          message: 'Related Articles',
          description: 'Title for the related articles section',
        })}
      </h3>
      
      <div className="related-articles-grid">
        {relatedArticles.map((article) => (
          <div key={article.id} className="related-article-card">
            <Link to={article.permalink} className="related-article-link">
              <div className="related-article-header">
                <h4 className="related-article-title">{article.title}</h4>
                <span className="related-article-category">
                  {formatCategoryName(article.category)}
                </span>
              </div>
              
              {article.description && (
                <p className="related-article-description">
                  {article.description}
                </p>
              )}
              
              {article.tags.length > 0 && (
                <div className="related-article-tags">
                  {article.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="related-article-tag">
                      {tag}
                    </span>
                  ))}
                  {article.tags.length > 3 && (
                    <span className="related-article-tag-more">
                      +{article.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
              
              {showScores && (
                <div className="related-article-score">
                  Relevance: {article.relevanceScore}
                </div>
              )}
            </Link>
          </div>
        ))}
      </div>
      
      <div className="related-articles-footer">
        <p className="related-articles-note">
          {translate({
            id: 'theme.relatedArticles.note',
            message: 'Articles are suggested based on tags, categories, and content similarity.',
            description: 'Note explaining how related articles are determined',
          })}
        </p>
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