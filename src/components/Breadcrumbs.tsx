import React from 'react';
import Link from '@docusaurus/Link';
import { useLocation } from '@docusaurus/router';

interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

/**
 * SEO-optimized breadcrumb navigation component with structured data markup
 * Provides hierarchical navigation context for users and search engines
 */
export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps): JSX.Element {
  const location = useLocation();
  
  // Auto-generate breadcrumbs from URL path if items not provided
  const breadcrumbItems = items || generateBreadcrumbsFromPath(location.pathname);
  
  if (!breadcrumbItems || breadcrumbItems.length <= 1) {
    return null;
  }

  // Generate structured data for breadcrumbs
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbItems.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      ...(item.href && { "item": `https://mifty.dev${item.href}` })
    }))
  };

  return (
    <>
      {/* Structured data for search engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      {/* Visual breadcrumb navigation */}
      <nav 
        aria-label="Breadcrumb navigation"
        className={`breadcrumbs ${className}`}
        style={{
          padding: '0.5rem 0',
          marginBottom: '1rem',
          fontSize: '0.9rem'
        }}
      >
        <ol style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          listStyle: 'none',
          margin: 0,
          padding: 0,
          gap: '0.5rem'
        }}>
          {breadcrumbItems.map((item, index) => (
            <li key={index} style={{ display: 'flex', alignItems: 'center' }}>
              {index > 0 && (
                <span 
                  style={{ 
                    margin: '0 0.5rem',
                    color: 'var(--ifm-color-emphasis-400)',
                    fontSize: '0.8rem'
                  }}
                  aria-hidden="true"
                >
                  /
                </span>
              )}
              {item.href && !item.isActive ? (
                <Link
                  to={item.href}
                  style={{
                    color: 'var(--ifm-color-primary)',
                    textDecoration: 'none',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--ifm-color-emphasis-100)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  aria-label={`Navigate to ${item.label}`}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  style={{
                    color: item.isActive 
                      ? 'var(--ifm-color-emphasis-800)' 
                      : 'var(--ifm-color-emphasis-600)',
                    fontWeight: item.isActive ? '600' : 'normal',
                    padding: '0.25rem 0.5rem'
                  }}
                  aria-current={item.isActive ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

/**
 * Generate breadcrumb items from URL pathname
 */
function generateBreadcrumbsFromPath(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/' }
  ];

  // Define valid paths that exist in the documentation
  const validPaths = new Set([
    '/docs/intro',
    '/docs/getting-started/what-is-mifty',
    '/docs/getting-started/installation',
    '/docs/getting-started/quick-start',
    '/docs/getting-started/first-project',
    '/docs/framework/architecture',
    '/docs/framework/configuration',
    '/docs/framework/project-structure',
    '/docs/api/core-modules',
    '/docs/database/visual-designer',
    '/docs/adapters',
    '/docs/tutorials/blog-api'
  ]);

  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === segments.length - 1;
    
    // Convert segment to readable label
    const label = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // Only add href if the path exists or it's the last segment
    const href = isLast ? undefined : (validPaths.has(currentPath) ? currentPath : undefined);

    breadcrumbs.push({
      label,
      href,
      isActive: isLast
    });
  });

  return breadcrumbs;
}