/**
 * SEO Configuration Utilities
 * 
 * This module provides centralized SEO configuration and utilities
 * for consistent SEO implementation across the Mifty documentation site.
 */

/**
 * Primary keywords for the Mifty Framework
 */
export const PRIMARY_KEYWORDS = [
  'mifty',
  'mifty framework',
  'nodejs framework',
  'modular architecture',
  'typescript backend framework'
];

/**
 * Feature-specific keywords
 */
export const FEATURE_KEYWORDS = [
  'mifty cli',
  'prisma nodejs',
  'typescript backend',
  'auto code generation',
  'visual database designer',
  'nodejs modular framework',
  'enterprise nodejs framework'
];

/**
 * Comparison keywords for competitive SEO
 */
export const COMPARISON_KEYWORDS = [
  'nestjs alternative',
  'express alternative',
  'nodejs framework comparison',
  'typescript framework nodejs',
  'backend framework typescript'
];

/**
 * Long-tail keywords for specific use cases
 */
export const LONG_TAIL_KEYWORDS = [
  'nodejs modular architecture tutorial',
  'enterprise nodejs framework',
  'typescript backend development',
  'nodejs framework 2024',
  'modular nodejs development',
  'nodejs clean architecture',
  'typescript web framework',
  'nodejs backend boilerplate'
];

/**
 * All keywords combined for comprehensive coverage
 */
export const ALL_KEYWORDS = [
  ...PRIMARY_KEYWORDS,
  ...FEATURE_KEYWORDS,
  ...COMPARISON_KEYWORDS,
  ...LONG_TAIL_KEYWORDS
];

/**
 * SEO configuration for different page types
 */
export const SEO_CONFIGS = {
  homepage: {
    title: 'Mifty Framework - Enterprise Node.js TypeScript Framework with Visual Database Designer',
    description: 'Accelerate your backend development with Mifty Framework. Enterprise-grade Node.js TypeScript framework featuring visual database designer, auto code generation, and Prisma integration. Perfect NestJS and Express alternative for scalable applications.',
    keywords: [
      ...PRIMARY_KEYWORDS,
      'enterprise backend framework',
      'nodejs typescript framework',
      'visual database designer',
      'auto code generation'
    ],
    type: 'website' as const
  },
  
  gettingStarted: {
    title: 'Getting Started with Mifty Framework - Installation & Setup Guide',
    description: 'Learn how to install and set up Mifty Framework for Node.js TypeScript development. Complete guide covering CLI installation, project creation, and your first modular application with visual database designer.',
    keywords: [
      ...PRIMARY_KEYWORDS,
      'mifty installation',
      'nodejs setup',
      'typescript setup',
      'getting started guide'
    ],
    type: 'article' as const
  },
  
  framework: {
    title: 'Mifty Framework Architecture - Modular Node.js TypeScript Development',
    description: 'Explore Mifty Framework\'s modular architecture for Node.js TypeScript applications. Learn about dependency injection, service layers, and enterprise-grade patterns for scalable backend development.',
    keywords: [
      ...PRIMARY_KEYWORDS,
      'modular architecture',
      'dependency injection',
      'service layer pattern',
      'enterprise patterns'
    ],
    type: 'article' as const
  },
  
  api: {
    title: 'Mifty Framework API Reference - Complete Documentation',
    description: 'Complete API reference for Mifty Framework. Detailed documentation of core modules, decorators, services, and utilities for Node.js TypeScript development with code examples and best practices.',
    keywords: [
      ...PRIMARY_KEYWORDS,
      'api reference',
      'typescript decorators',
      'core modules',
      'code examples'
    ],
    type: 'article' as const
  },
  
  tutorials: {
    title: 'Mifty Framework Tutorials - Step-by-Step Guides',
    description: 'Master Mifty Framework with comprehensive tutorials. Step-by-step guides for building REST APIs, integrating databases, implementing authentication, and deploying Node.js TypeScript applications.',
    keywords: [
      ...PRIMARY_KEYWORDS,
      'nodejs tutorials',
      'typescript tutorials',
      'rest api tutorial',
      'database integration'
    ],
    type: 'article' as const
  },
  
  database: {
    title: 'Database Integration with Mifty Framework - Prisma & Visual Designer',
    description: 'Learn database integration in Mifty Framework using Prisma ORM and visual database designer. Complete guide to schema design, migrations, and database operations in Node.js TypeScript applications.',
    keywords: [
      ...PRIMARY_KEYWORDS,
      'prisma integration',
      'database design',
      'visual database designer',
      'schema migrations'
    ],
    type: 'article' as const
  },
  
  commands: {
    title: 'Mifty CLI Commands Reference - Complete Command Guide',
    description: 'Complete reference for Mifty CLI commands. Learn all available commands for project generation, database operations, code scaffolding, and development workflow automation in Node.js TypeScript projects.',
    keywords: [
      ...PRIMARY_KEYWORDS,
      'mifty cli commands',
      'code generation',
      'project scaffolding',
      'development tools'
    ],
    type: 'article' as const
  }
};

/**
 * Generates SEO-optimized title with brand consistency
 */
export const generateSEOTitle = (pageTitle: string, includeFramework: boolean = true): string => {
  const suffix = includeFramework ? ' | Mifty Framework for Node.js' : ' | Mifty Framework';
  return `${pageTitle}${suffix}`;
};

/**
 * Generates keyword-rich description with action-oriented language
 */
export const generateSEODescription = (
  baseDescription: string,
  keywords: string[] = PRIMARY_KEYWORDS,
  actionWords: string[] = ['discover', 'learn', 'build', 'create', 'develop']
): string => {
  // Ensure description starts with an action word
  const startsWithAction = actionWords.some(word => 
    baseDescription.toLowerCase().startsWith(word.toLowerCase())
  );
  
  if (!startsWithAction) {
    const randomAction = actionWords[Math.floor(Math.random() * actionWords.length)];
    return `${randomAction.charAt(0).toUpperCase() + randomAction.slice(1)} ${baseDescription.toLowerCase()}`;
  }
  
  return baseDescription;
};

/**
 * Gets SEO configuration for a specific page type
 */
export const getSEOConfig = (pageType: keyof typeof SEO_CONFIGS) => {
  return SEO_CONFIGS[pageType];
};

/**
 * Generates breadcrumb data for documentation pages
 */
export const generateBreadcrumbs = (path: string) => {
  const segments = path.split('/').filter(segment => segment.length > 0);
  const breadcrumbs = [{ name: 'Home', url: '/' }];
  
  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Convert segment to readable name
    const name = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    breadcrumbs.push({
      name,
      url: currentPath
    });
  });
  
  return breadcrumbs;
};

/**
 * Generates FAQ data for common documentation questions
 */
export const generateCommonFAQs = () => [
  {
    question: 'What is Mifty Framework?',
    answer: 'Mifty Framework is an enterprise-grade Node.js TypeScript framework that provides modular architecture, visual database designer, and auto code generation for building scalable backend applications.'
  },
  {
    question: 'How do I install Mifty Framework?',
    answer: 'Install Mifty CLI globally using npm: npm install -g @mifty/cli. Then create a new project with: mifty create my-project.'
  },
  {
    question: 'Is Mifty Framework compatible with TypeScript?',
    answer: 'Yes, Mifty Framework is built with TypeScript and provides full TypeScript support with type definitions, decorators, and modern TypeScript features.'
  },
  {
    question: 'How does Mifty compare to NestJS?',
    answer: 'Mifty Framework offers similar modular architecture to NestJS but includes additional features like visual database designer, auto code generation, and simplified configuration for faster development.'
  },
  {
    question: 'Can I use Mifty Framework with existing databases?',
    answer: 'Yes, Mifty Framework supports existing databases through Prisma ORM integration and provides migration tools to work with your current database schema.'
  }
];

/**
 * Generates article metadata for documentation pages
 */
export const generateArticleMetadata = (
  section: string,
  author: string = 'Mifty Framework Team',
  tags: string[] = []
) => ({
  publishedTime: new Date().toISOString(),
  modifiedTime: new Date().toISOString(),
  author,
  section,
  tags: [...tags, 'mifty', 'nodejs', 'typescript', 'documentation']
});

/**
 * Validates and optimizes SEO configuration
 */
export const validateSEOConfig = (config: {
  title: string;
  description: string;
  keywords: string[];
}) => {
  const warnings: string[] = [];
  const errors: string[] = [];
  
  // Title validation
  if (config.title.length > 60) {
    warnings.push(`Title is ${config.title.length} characters (recommended: under 60)`);
  }
  if (!config.title.toLowerCase().includes('mifty')) {
    warnings.push('Title should include "Mifty" for brand recognition');
  }
  
  // Description validation
  if (config.description.length > 160) {
    errors.push(`Description is ${config.description.length} characters (max: 160)`);
  }
  if (config.description.length < 120) {
    warnings.push(`Description is ${config.description.length} characters (recommended: 120-160)`);
  }
  
  // Keywords validation
  if (config.keywords.length < 3) {
    warnings.push('Consider adding more keywords for better coverage');
  }
  if (config.keywords.length > 10) {
    warnings.push('Too many keywords may dilute SEO effectiveness');
  }
  
  const hasActionWord = ['discover', 'learn', 'build', 'create', 'develop', 'explore', 'master'].some(
    word => config.description.toLowerCase().includes(word)
  );
  if (!hasActionWord) {
    warnings.push('Description should include action-oriented language');
  }
  
  return {
    isValid: errors.length === 0,
    warnings,
    errors,
    score: Math.max(0, 100 - (errors.length * 20) - (warnings.length * 5))
  };
};

/**
 * Default structured data for the site
 */
export const DEFAULT_STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Mifty Framework',
  description: 'Enterprise-Grade Node.js TypeScript Framework with Visual Database Designer & Auto Code Generation',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Cross-platform',
  programmingLanguage: ['TypeScript', 'JavaScript'],
  runtimePlatform: 'Node.js',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  author: {
    '@type': 'Organization',
    name: 'Mifty Framework Team',
    url: 'https://mifty.dev'
  },
  url: 'https://mifty.dev',
  downloadUrl: 'https://www.npmjs.com/package/@mifty/cli',
  softwareVersion: 'latest',
  releaseNotes: 'https://mifty.dev/docs/getting-started/what-is-mifty',
  screenshot: 'https://mifty.dev/img/logo.png',
  featureList: [
    'Visual Database Designer',
    'Auto Code Generation',
    'Modular Architecture',
    'TypeScript Support',
    'Prisma Integration',
    'CLI Tools',
    'Enterprise-Grade Framework',
    'RESTful API Generation'
  ],
};