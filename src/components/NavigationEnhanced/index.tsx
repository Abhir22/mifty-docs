import React from 'react';
import BreadcrumbNavigation from '../BreadcrumbNavigation';
import TagDiscovery from '../TagDiscovery';
import RelatedArticles from '../RelatedArticles';
import TableOfContents from '../TableOfContents';

// Export individual components
export { 
  BreadcrumbNavigation, 
  TagDiscovery, 
  RelatedArticles, 
  TableOfContents 
};

// Enhanced navigation wrapper component
interface NavigationEnhancedProps {
  showBreadcrumbs?: boolean;
  showTOC?: boolean;
  showRelatedArticles?: boolean;
  showTagDiscovery?: boolean;
  tocProps?: any;
  relatedArticlesProps?: any;
  tagDiscoveryProps?: any;
  children?: React.ReactNode;
}

export default function NavigationEnhanced({
  showBreadcrumbs = true,
  showTOC = true,
  showRelatedArticles = true,
  showTagDiscovery = false,
  tocProps = {},
  relatedArticlesProps = {},
  tagDiscoveryProps = {},
  children,
}: NavigationEnhancedProps): JSX.Element {
  return (
    <div className="navigation-enhanced">
      {showBreadcrumbs && <BreadcrumbNavigation />}
      
      <div className="navigation-enhanced-content">
        <div className="navigation-enhanced-main">
          {children}
          
          {showTagDiscovery && (
            <TagDiscovery {...tagDiscoveryProps} />
          )}
          
          {showRelatedArticles && (
            <RelatedArticles {...relatedArticlesProps} />
          )}
        </div>
        
        {showTOC && (
          <aside className="navigation-enhanced-sidebar">
            <TableOfContents {...tocProps} />
          </aside>
        )}
      </div>
      
      <style jsx>{`
        .navigation-enhanced {
          width: 100%;
        }
        
        .navigation-enhanced-content {
          display: flex;
          gap: 2rem;
          align-items: flex-start;
        }
        
        .navigation-enhanced-main {
          flex: 1;
          min-width: 0;
        }
        
        .navigation-enhanced-sidebar {
          flex-shrink: 0;
        }
        
        @media (max-width: 1200px) {
          .navigation-enhanced-content {
            flex-direction: column;
          }
          
          .navigation-enhanced-sidebar {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}