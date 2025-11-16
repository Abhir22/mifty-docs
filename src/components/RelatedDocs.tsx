import React from 'react';
import InternalLink from './InternalLink';

interface RelatedDoc {
  title: string;
  to: string;
  description?: string;
}

interface RelatedDocsProps {
  title?: string;
  docs: RelatedDoc[];
  className?: string;
}

/**
 * Component for displaying related documentation links
 * Improves internal linking and SEO by connecting related content
 */
export default function RelatedDocs({ 
  title = 'Related Documentation', 
  docs, 
  className = '' 
}: RelatedDocsProps): JSX.Element {
  if (!docs || docs.length === 0) {
    return null;
  }

  return (
    <div className={`related-docs ${className}`} style={{ 
      marginTop: '2rem',
      padding: '1.5rem',
      backgroundColor: 'var(--ifm-color-secondary-lightest)',
      borderRadius: '8px',
      border: '1px solid var(--ifm-color-emphasis-200)'
    }}>
      <h3 style={{ 
        marginBottom: '1rem',
        color: 'var(--ifm-color-emphasis-800)',
        fontSize: '1.1rem',
        fontWeight: '600'
      }}>
        {title}
      </h3>
      <ul style={{ 
        listStyle: 'none',
        padding: 0,
        margin: 0
      }}>
        {docs.map((doc, index) => (
          <li key={index} style={{ 
            marginBottom: '0.75rem',
            paddingLeft: '1rem',
            position: 'relative'
          }}>
            <span style={{
              position: 'absolute',
              left: '0',
              top: '0.2rem',
              color: 'var(--ifm-color-primary)',
              fontSize: '0.8rem'
            }}>
              →
            </span>
            <div>
              <InternalLink 
                to={doc.to}
                aria-label={`Navigate to ${doc.title}`}
                title={doc.description || doc.title}
              >
                {doc.title}
              </InternalLink>
              {doc.description && (
                <p style={{ 
                  margin: '0.25rem 0 0 0',
                  fontSize: '0.9rem',
                  color: 'var(--ifm-color-emphasis-600)',
                  lineHeight: '1.4'
                }}>
                  {doc.description}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}