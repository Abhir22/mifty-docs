import React from 'react';
import Head from '@docusaurus/Head';

/**
 * Props interface for the SEOHead component
 */
export interface SEOHeadProps {
  /** Page title (will be suffixed with site title) */
  title: string;
  /** Meta description for the page */
  description: string;
  /** Array of keywords for the page */
  keywords: string[];
  /** Type of content (website or article) */
  type?: 'website' | 'article';
  /** Open Graph image URL */
  image?: string;
  /** Canonical URL for the page */
  url?: string;
  /** Additional structured data */
  structuredData?: Record<string, any>;
}

/**
 * Structured data interface for SoftwareApplication schema
 */
interface SoftwareApplicationSchema {
  '@context': 'https://schema.org';
  '@type': 'SoftwareApplication';
  name: string;
  description: string;
  applicationCategory: string;
  operatingSystem: string;
  offers: {
    '@type': 'Offer';
    price: string;
  };
  author: {
    '@type': 'Organization';
    name: string;
    url: string;
  };
  url: string;
  downloadUrl?: string;
  softwareVersion?: string;
}

/**
 * Validates title length for optimal SEO
 */
const validateTitle = (title: string): string => {
  const maxLength = 60;
  if (title.length > maxLength) {
    console.warn(`SEO Warning: Title "${title}" is ${title.length} characters. Optimal length is under ${maxLength} characters.`);
  }
  return title;
};

/**
 * Validates description length for optimal SEO
 */
const validateDescription = (description: string): string => {
  const minLength = 120;
  const maxLength = 160;
  
  if (description.length < minLength) {
    console.warn(`SEO Warning: Description is ${description.length} characters. Optimal length is ${minLength}-${maxLength} characters.`);
  }
  
  if (description.length > maxLength) {
    console.warn(`SEO Warning: Description is ${description.length} characters. Optimal length is ${minLength}-${maxLength} characters.`);
  }
  
  return description;
};

/**
 * Generates structured data for SoftwareApplication schema
 */
const generateSoftwareApplicationSchema = (
  title: string,
  description: string,
  url?: string
): SoftwareApplicationSchema => {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Mifty Framework',
    description: description,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Cross-platform',
    offers: {
      '@type': 'Offer',
      price: '0'
    },
    author: {
      '@type': 'Organization',
      name: 'Mifty Framework Team',
      url: 'https://mifty.dev'
    },
    url: url || 'https://mifty.dev',
    downloadUrl: 'https://www.npmjs.com/package/@mifty/cli',
    softwareVersion: 'latest'
  };
};

/**
 * SEOHead component for consistent SEO metadata across pages
 * 
 * This component provides:
 * - Optimized title and meta description
 * - Structured JSON-LD data for better search engine understanding
 * - Open Graph and Twitter Card metadata
 * - Keyword optimization
 * - Validation for optimal SEO practices
 */
export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords,
  type = 'website',
  image = '/img/logo.png',
  url,
  structuredData
}) => {
  // Validate and format title
  const validatedTitle = validateTitle(title);
  const fullTitle = `${validatedTitle} | Mifty Framework for Node.js`;
  
  // Validate description
  const validatedDescription = validateDescription(description);
  
  // Generate canonical URL
  const canonicalUrl = url || (typeof window !== 'undefined' ? window.location.href : 'https://mifty.dev');
  
  // Generate structured data
  const defaultStructuredData = generateSoftwareApplicationSchema(title, validatedDescription, canonicalUrl);
  const finalStructuredData = structuredData || defaultStructuredData;
  
  // Format keywords
  const keywordString = keywords.join(', ');
  
  // Generate Open Graph image URL
  const ogImageUrl = image.startsWith('http') ? image : `https://mifty.dev${image}`;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={validatedDescription} />
      <meta name="keywords" content={keywordString} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={validatedDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:image:alt" content={`${title} - Mifty Framework`} />
      <meta property="og:site_name" content="Mifty Framework Documentation" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@miftyframework" />
      <meta name="twitter:creator" content="@miftyframework" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={validatedDescription} />
      <meta name="twitter:image" content={ogImageUrl} />
      <meta name="twitter:image:alt" content={`${title} - Mifty Framework`} />
      
      {/* Additional SEO Meta Tags */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="author" content="Mifty Framework Team" />
      <meta name="theme-color" content="#6366f1" />
      
      {/* Structured Data (JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(finalStructuredData)
        }}
      />
    </Head>
  );
};

export default SEOHead;