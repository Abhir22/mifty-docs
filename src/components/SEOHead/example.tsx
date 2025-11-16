import React from 'react';
import { SEOHead } from '../SEOHead';

/**
 * Example usage of the SEOHead component
 * This demonstrates how to use the component with various props
 */
export const SEOHeadExample: React.FC = () => {
  return (
    <>
      {/* Basic usage */}
      <SEOHead
        title="Getting Started with Mifty"
        description="Learn how to get started with Mifty, the modern Node.js TypeScript framework for building scalable backend applications with modular architecture."
        keywords={[
          'mifty',
          'nodejs framework',
          'typescript framework',
          'getting started',
          'modular architecture',
          'backend development'
        ]}
      />
      
      {/* Advanced usage with custom structured data */}
      <SEOHead
        title="Mifty CLI Commands"
        description="Complete reference for Mifty CLI commands including module generation, project scaffolding, and development tools for Node.js applications."
        keywords={[
          'mifty cli',
          'nodejs cli',
          'code generation',
          'project scaffolding',
          'development tools'
        ]}
        type="article"
        image="/img/cli-preview.png"
        url="https://mifty.dev/docs/commands/cli-reference"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'TechArticle',
          headline: 'Mifty CLI Commands Reference',
          description: 'Complete reference for Mifty CLI commands including module generation, project scaffolding, and development tools for Node.js applications.',
          author: {
            '@type': 'Organization',
            name: 'Mifty Framework Team'
          },
          publisher: {
            '@type': 'Organization',
            name: 'Mifty Framework',
            logo: {
              '@type': 'ImageObject',
              url: 'https://mifty.dev/img/logo.png'
            }
          },
          datePublished: '2024-01-01',
          dateModified: new Date().toISOString().split('T')[0]
        }}
      />
    </>
  );
};

export default SEOHeadExample;