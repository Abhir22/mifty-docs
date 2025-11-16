import React from 'react';
import Link from '@docusaurus/Link';

interface InternalLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  'aria-label'?: string;
  title?: string;
}

/**
 * SEO-optimized internal linking component for cross-referencing documentation
 * Provides consistent styling and accessibility features for internal navigation
 */
export default function InternalLink({ 
  to, 
  children, 
  className = '', 
  'aria-label': ariaLabel,
  title 
}: InternalLinkProps): JSX.Element {
  return (
    <Link
      to={to}
      className={`internal-link ${className}`}
      aria-label={ariaLabel}
      title={title}
      style={{
        color: 'var(--ifm-color-primary)',
        textDecoration: 'none',
        fontWeight: '500',
        borderBottom: '1px solid transparent',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderBottomColor = 'var(--ifm-color-primary)';
        e.currentTarget.style.textDecoration = 'none';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderBottomColor = 'transparent';
      }}
    >
      {children}
    </Link>
  );
}