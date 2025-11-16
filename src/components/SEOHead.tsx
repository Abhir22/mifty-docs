import React from 'react';
import Head from '@docusaurus/Head';
import { validateTitle, validateDescription, validateStructuredData } from '../utils/seo-validation';

/**
 * Breadcrumb item interface for navigation structure
 */
export interface BreadcrumbItem {
  /** Display name of the breadcrumb item */
  name: string;
  /** URL of the breadcrumb item */
  url: string;
}

/**
 * FAQ item interface for question-answer content
 */
export interface FAQItem {
  /** The question text */
  question: string;
  /** The answer text */
  answer: string;
}

/**
 * Article metadata interface for blog-style content
 */
export interface ArticleData {
  /** Article publication date in ISO format */
  publishedTime: string;
  /** Article modification date in ISO format (optional) */
  modifiedTime?: string;
  /** Article author name */
  author: string;
  /** Article section/category */
  section: string;
  /** Article tags (optional) */
  tags?: string[];
}

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
  /** Breadcrumb navigation items */
  breadcrumbs?: BreadcrumbItem[];
  /** FAQ data for question-answer content */
  faqData?: FAQItem[];
  /** Article metadata for blog-style content */
  articleData?: ArticleData;
  /** Custom schema objects to include */
  customSchema?: Record<string, any>[];
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
 * Structured data interface for BreadcrumbList schema
 */
interface BreadcrumbListSchema {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  itemListElement: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    item: string;
  }>;
}

/**
 * Structured data interface for FAQPage schema
 */
interface FAQPageSchema {
  '@context': 'https://schema.org';
  '@type': 'FAQPage';
  mainEntity: Array<{
    '@type': 'Question';
    name: string;
    acceptedAnswer: {
      '@type': 'Answer';
      text: string;
    };
  }>;
}

/**
 * Structured data interface for Article schema
 */
interface ArticleSchema {
  '@context': 'https://schema.org';
  '@type': 'Article';
  headline: string;
  description: string;
  author: {
    '@type': 'Person';
    name: string;
  };
  publisher: {
    '@type': 'Organization';
    name: string;
    logo: {
      '@type': 'ImageObject';
      url: string;
    };
  };
  datePublished: string;
  dateModified?: string;
  articleSection: string;
  keywords?: string[];
  url: string;
}

/**
 * Generates breadcrumb structured data
 */
const generateBreadcrumbSchema = (breadcrumbs: BreadcrumbItem[]): BreadcrumbListSchema => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `https://mifty.dev${item.url}`
    }))
  };
};

/**
 * Generates FAQ structured data
 */
const generateFAQSchema = (faqData: FAQItem[]): FAQPageSchema => {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqData.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  };
};

/**
 * Generates article structured data
 */
const generateArticleSchema = (
  title: string,
  description: string,
  url: string,
  articleData: ArticleData
): ArticleSchema => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    author: {
      '@type': 'Person',
      name: articleData.author
    },
    publisher: {
      '@type': 'Organization',
      name: 'Mifty Framework',
      logo: {
        '@type': 'ImageObject',
        url: 'https://mifty.dev/img/logo.png'
      }
    },
    datePublished: articleData.publishedTime,
    dateModified: articleData.modifiedTime || articleData.publishedTime,
    articleSection: articleData.section,
    keywords: articleData.tags,
    url: url
  };
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
  structuredData,
  breadcrumbs,
  faqData,
  articleData,
  customSchema
}) => {
  // Validate and format title with enhanced validation
  const titleValidation = validateTitle(title);
  if (titleValidation.warnings.length > 0) {
    titleValidation.warnings.forEach(warning => console.warn(`SEO Title Warning: ${warning}`));
  }
  if (titleValidation.errors.length > 0) {
    titleValidation.errors.forEach(error => console.error(`SEO Title Error: ${error}`));
  }
  const fullTitle = `${title} | Mifty Framework for Node.js`;
  
  // Validate description with enhanced validation
  const descriptionValidation = validateDescription(description);
  if (descriptionValidation.warnings.length > 0) {
    descriptionValidation.warnings.forEach(warning => console.warn(`SEO Description Warning: ${warning}`));
  }
  if (descriptionValidation.errors.length > 0) {
    descriptionValidation.errors.forEach(error => console.error(`SEO Description Error: ${error}`));
  }
  const validatedDescription = description;
  
  // Generate canonical URL
  const canonicalUrl = url || (typeof window !== 'undefined' ? window.location.href : 'https://mifty.dev');
  
  // Generate structured data schemas
  const schemas: Record<string, any>[] = [];
  
  // Default software application schema
  const defaultStructuredData = generateSoftwareApplicationSchema(title, description, canonicalUrl);
  schemas.push(structuredData || defaultStructuredData);
  
  // Add breadcrumb schema if provided
  if (breadcrumbs && breadcrumbs.length > 0) {
    schemas.push(generateBreadcrumbSchema(breadcrumbs));
  }
  
  // Add FAQ schema if provided
  if (faqData && faqData.length > 0) {
    schemas.push(generateFAQSchema(faqData));
  }
  
  // Add article schema if provided
  if (articleData) {
    schemas.push(generateArticleSchema(title, description, canonicalUrl, articleData));
  }
  
  // Add custom schemas if provided
  if (customSchema && customSchema.length > 0) {
    schemas.push(...customSchema);
  }
  
  // Validate all structured data
  schemas.forEach((schema, index) => {
    const validation = validateStructuredData(schema);
    if (validation.warnings.length > 0) {
      validation.warnings.forEach(warning => 
        console.warn(`SEO Structured Data Warning (Schema ${index + 1}): ${warning}`)
      );
    }
    if (validation.errors.length > 0) {
      validation.errors.forEach(error => 
        console.error(`SEO Structured Data Error (Schema ${index + 1}): ${error}`)
      );
    }
  });
  
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
      {schemas.map((schema, index) => (
        <script
          key={`schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema)
          }}
        />
      ))}
      
      {/* Enhanced meta tags for better SEO */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="revisit-after" content="7 days" />
      <meta name="distribution" content="global" />
      <meta name="rating" content="general" />
      <meta httpEquiv="content-language" content="en" />
      
      {/* Additional Open Graph metadata */}
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:updated_time" content={new Date().toISOString()} />
      
      {/* Additional Twitter metadata */}
      <meta name="twitter:domain" content="mifty.dev" />
      <meta name="twitter:url" content={canonicalUrl} />
    </Head>
  );
};

export default SEOHead;