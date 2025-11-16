/**
 * SEO Validation Utilities
 * 
 * This module provides comprehensive SEO validation and audit utilities
 * for the Mifty Framework documentation site.
 */

/**
 * Interface for SEO validation results
 */
export interface SEOValidationResult {
  isValid: boolean;
  warnings: string[];
  errors: string[];
  score: number; // 0-100
}

/**
 * Interface for keyword density analysis
 */
export interface KeywordDensityResult {
  keyword: string;
  count: number;
  density: number; // percentage
  isOptimal: boolean;
}

/**
 * Interface for internal link analysis
 */
export interface InternalLinkAnalysis {
  totalLinks: number;
  internalLinks: number;
  externalLinks: number;
  brokenLinks: string[];
  anchorTextOptimization: {
    optimized: number;
    generic: number;
    suggestions: string[];
  };
}

/**
 * Validates title length and content for optimal SEO
 */
export const validateTitle = (title: string): SEOValidationResult => {
  const warnings: string[] = [];
  const errors: string[] = [];
  let score = 100;

  // Length validation
  const minLength = 30;
  const maxLength = 60;
  const optimalLength = 55;

  if (title.length < minLength) {
    errors.push(`Title is too short (${title.length} chars). Minimum recommended: ${minLength} characters.`);
    score -= 30;
  } else if (title.length > maxLength) {
    warnings.push(`Title is too long (${title.length} chars). Maximum recommended: ${maxLength} characters.`);
    score -= 15;
  } else if (title.length > optimalLength) {
    warnings.push(`Title is approaching maximum length (${title.length} chars). Optimal: under ${optimalLength} characters.`);
    score -= 5;
  }

  // Content validation
  if (!title.includes('Mifty')) {
    warnings.push('Title should include the brand name "Mifty" for better brand recognition.');
    score -= 10;
  }

  // Check for title case
  const titleCaseRegex = /^[A-Z][a-z]*(\s[A-Z][a-z]*)*$/;
  if (!titleCaseRegex.test(title.replace(/[^\w\s]/g, '').trim())) {
    warnings.push('Consider using title case for better readability.');
    score -= 5;
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors,
    score: Math.max(0, score)
  };
};

/**
 * Validates meta description length and content for optimal SEO
 */
export const validateDescription = (description: string): SEOValidationResult => {
  const warnings: string[] = [];
  const errors: string[] = [];
  let score = 100;

  // Length validation
  const minLength = 120;
  const maxLength = 160;
  const optimalMin = 140;

  if (description.length < minLength) {
    warnings.push(`Description is too short (${description.length} chars). Minimum recommended: ${minLength} characters.`);
    score -= 20;
  } else if (description.length > maxLength) {
    errors.push(`Description is too long (${description.length} chars). Maximum recommended: ${maxLength} characters.`);
    score -= 25;
  } else if (description.length < optimalMin) {
    warnings.push(`Description could be longer (${description.length} chars). Optimal range: ${optimalMin}-${maxLength} characters.`);
    score -= 5;
  }

  // Content validation
  const primaryKeywords = ['mifty', 'nodejs', 'typescript', 'framework'];
  const foundKeywords = primaryKeywords.filter(keyword => 
    description.toLowerCase().includes(keyword.toLowerCase())
  );

  if (foundKeywords.length === 0) {
    warnings.push('Description should include at least one primary keyword (mifty, nodejs, typescript, framework).');
    score -= 15;
  } else if (foundKeywords.length < 2) {
    warnings.push('Consider including more primary keywords in the description.');
    score -= 5;
  }

  // Check for action-oriented language
  const actionWords = ['build', 'create', 'develop', 'discover', 'learn', 'start', 'accelerate', 'enhance'];
  const hasActionWord = actionWords.some(word => 
    description.toLowerCase().includes(word.toLowerCase())
  );

  if (!hasActionWord) {
    warnings.push('Consider adding action-oriented language to make the description more compelling.');
    score -= 10;
  }

  // Check for duplicate words (potential keyword stuffing)
  const words = description.toLowerCase().split(/\s+/);
  const wordCount = words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const repeatedWords = Object.entries(wordCount)
    .filter(([word, count]) => count > 2 && word.length > 3)
    .map(([word]) => word);

  if (repeatedWords.length > 0) {
    warnings.push(`Potential keyword stuffing detected. Repeated words: ${repeatedWords.join(', ')}`);
    score -= 10;
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors,
    score: Math.max(0, score)
  };
};

/**
 * Analyzes keyword density in content
 */
export const analyzeKeywordDensity = (content: string, keywords: string[]): KeywordDensityResult[] => {
  const words = content.toLowerCase().split(/\s+/).filter(word => word.length > 0);
  const totalWords = words.length;

  return keywords.map(keyword => {
    const keywordLower = keyword.toLowerCase();
    const count = words.filter(word => word.includes(keywordLower)).length;
    const density = (count / totalWords) * 100;

    // Optimal keyword density is 1-3%
    const isOptimal = density >= 1 && density <= 3;

    return {
      keyword,
      count,
      density: Math.round(density * 100) / 100,
      isOptimal
    };
  });
};

/**
 * Validates structured data schema
 */
export const validateStructuredData = (schema: Record<string, any>): SEOValidationResult => {
  const warnings: string[] = [];
  const errors: string[] = [];
  let score = 100;

  // Check required @context and @type
  if (!schema['@context']) {
    errors.push('Missing required @context property in structured data.');
    score -= 30;
  } else if (schema['@context'] !== 'https://schema.org') {
    warnings.push('@context should be "https://schema.org" for best compatibility.');
    score -= 5;
  }

  if (!schema['@type']) {
    errors.push('Missing required @type property in structured data.');
    score -= 30;
  }

  // Validate common schema types
  if (schema['@type'] === 'SoftwareApplication') {
    const requiredFields = ['name', 'description', 'applicationCategory'];
    const recommendedFields = ['author', 'offers', 'operatingSystem', 'url'];

    requiredFields.forEach(field => {
      if (!schema[field]) {
        errors.push(`Missing required field "${field}" for SoftwareApplication schema.`);
        score -= 15;
      }
    });

    recommendedFields.forEach(field => {
      if (!schema[field]) {
        warnings.push(`Missing recommended field "${field}" for SoftwareApplication schema.`);
        score -= 5;
      }
    });
  }

  // Check for empty values
  Object.entries(schema).forEach(([key, value]) => {
    if (value === '' || value === null || value === undefined) {
      warnings.push(`Empty value for property "${key}".`);
      score -= 5;
    }
  });

  return {
    isValid: errors.length === 0,
    warnings,
    errors,
    score: Math.max(0, score)
  };
};

/**
 * Analyzes internal linking structure
 */
export const analyzeInternalLinks = (content: string, baseUrl: string = 'https://mifty.dev'): InternalLinkAnalysis => {
  // Extract all links from content
  const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/gi;
  const links: Array<{ url: string; anchorText: string }> = [];
  let match;

  while ((match = linkRegex.exec(content)) !== null) {
    links.push({
      url: match[1],
      anchorText: match[2]
    });
  }

  const totalLinks = links.length;
  const internalLinks = links.filter(link => 
    link.url.startsWith('/') || link.url.startsWith(baseUrl)
  ).length;
  const externalLinks = totalLinks - internalLinks;

  // Analyze anchor text optimization
  const genericAnchorTexts = ['click here', 'read more', 'learn more', 'here', 'this', 'link'];
  const genericLinks = links.filter(link => 
    genericAnchorTexts.some(generic => 
      link.anchorText.toLowerCase().includes(generic)
    )
  ).length;

  const optimizedLinks = totalLinks - genericLinks;

  const suggestions: string[] = [];
  if (genericLinks > 0) {
    suggestions.push(`Replace ${genericLinks} generic anchor texts with descriptive, keyword-rich alternatives.`);
  }
  if (internalLinks < totalLinks * 0.3) {
    suggestions.push('Consider adding more internal links to improve site structure and SEO.');
  }
  if (totalLinks > 100) {
    suggestions.push('Consider reducing the number of links per page for better user experience.');
  }

  return {
    totalLinks,
    internalLinks,
    externalLinks,
    brokenLinks: [], // Would need actual link checking implementation
    anchorTextOptimization: {
      optimized: optimizedLinks,
      generic: genericLinks,
      suggestions
    }
  };
};

/**
 * Comprehensive SEO audit for a page
 */
export const auditPageSEO = (pageData: {
  title: string;
  description: string;
  content: string;
  keywords: string[];
  structuredData?: Record<string, any>;
}): {
  overallScore: number;
  titleValidation: SEOValidationResult;
  descriptionValidation: SEOValidationResult;
  keywordDensity: KeywordDensityResult[];
  structuredDataValidation?: SEOValidationResult;
  internalLinkAnalysis: InternalLinkAnalysis;
  recommendations: string[];
} => {
  const titleValidation = validateTitle(pageData.title);
  const descriptionValidation = validateDescription(pageData.description);
  const keywordDensity = analyzeKeywordDensity(pageData.content, pageData.keywords);
  const structuredDataValidation = pageData.structuredData 
    ? validateStructuredData(pageData.structuredData)
    : undefined;
  const internalLinkAnalysis = analyzeInternalLinks(pageData.content);

  // Calculate overall score
  const scores = [
    titleValidation.score,
    descriptionValidation.score,
    structuredDataValidation?.score || 80, // Default score if no structured data
  ];
  const overallScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);

  // Generate recommendations
  const recommendations: string[] = [];
  
  if (titleValidation.warnings.length > 0 || titleValidation.errors.length > 0) {
    recommendations.push('Optimize page title for better SEO performance.');
  }
  
  if (descriptionValidation.warnings.length > 0 || descriptionValidation.errors.length > 0) {
    recommendations.push('Improve meta description for better click-through rates.');
  }

  const poorKeywords = keywordDensity.filter(kw => !kw.isOptimal);
  if (poorKeywords.length > 0) {
    recommendations.push(`Optimize keyword density for: ${poorKeywords.map(kw => kw.keyword).join(', ')}`);
  }

  if (internalLinkAnalysis.anchorTextOptimization.generic > 0) {
    recommendations.push('Replace generic anchor texts with descriptive alternatives.');
  }

  if (!pageData.structuredData) {
    recommendations.push('Add structured data to improve search engine understanding.');
  }

  return {
    overallScore,
    titleValidation,
    descriptionValidation,
    keywordDensity,
    structuredDataValidation,
    internalLinkAnalysis,
    recommendations
  };
};

/**
 * Validates meta tags presence and correctness
 */
export const validateMetaTags = (document: Document): SEOValidationResult => {
  const warnings: string[] = [];
  const errors: string[] = [];
  let score = 100;

  // Required meta tags
  const requiredTags = [
    { selector: 'title', name: 'Title tag' },
    { selector: 'meta[name="description"]', name: 'Meta description' },
    { selector: 'meta[name="keywords"]', name: 'Meta keywords' },
    { selector: 'link[rel="canonical"]', name: 'Canonical URL' },
  ];

  requiredTags.forEach(tag => {
    const element = document.querySelector(tag.selector);
    if (!element) {
      errors.push(`Missing ${tag.name}.`);
      score -= 20;
    } else {
      const content = element.getAttribute('content') || element.textContent;
      if (!content || content.trim().length === 0) {
        errors.push(`Empty ${tag.name}.`);
        score -= 15;
      }
    }
  });

  // Open Graph tags
  const ogTags = [
    'og:title',
    'og:description',
    'og:type',
    'og:url',
    'og:image'
  ];

  ogTags.forEach(tag => {
    const element = document.querySelector(`meta[property="${tag}"]`);
    if (!element) {
      warnings.push(`Missing Open Graph tag: ${tag}.`);
      score -= 5;
    }
  });

  // Twitter Card tags
  const twitterTags = [
    'twitter:card',
    'twitter:title',
    'twitter:description',
    'twitter:image'
  ];

  twitterTags.forEach(tag => {
    const element = document.querySelector(`meta[name="${tag}"]`);
    if (!element) {
      warnings.push(`Missing Twitter Card tag: ${tag}.`);
      score -= 3;
    }
  });

  // Check for structured data
  const structuredDataScript = document.querySelector('script[type="application/ld+json"]');
  if (!structuredDataScript) {
    warnings.push('Missing structured data (JSON-LD).');
    score -= 10;
  } else {
    try {
      JSON.parse(structuredDataScript.textContent || '');
    } catch (e) {
      errors.push('Invalid JSON-LD structured data.');
      score -= 15;
    }
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors,
    score: Math.max(0, score)
  };
};