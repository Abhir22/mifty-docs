module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/docs/getting-started/what-is-mifty',
        'http://localhost:3000/docs/framework/architecture',
        'http://localhost:3000/docs/database/visual-designer',
        'http://localhost:3000/docs/commands/cli-commands',
        'http://localhost:3000/docs/api/core-modules',
      ],
      startServerCommand: 'npm run serve',
      startServerReadyPattern: 'serving at',
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'categories:pwa': ['warn', { minScore: 0.8 }],
        
        // Core Web Vitals
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'first-meaningful-paint': ['warn', { maxNumericValue: 2000 }],
        'speed-index': ['warn', { maxNumericValue: 3000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        
        // Accessibility
        'color-contrast': 'error',
        'image-alt': 'error',
        'label': 'error',
        'link-name': 'error',
        'document-title': 'error',
        'html-has-lang': 'error',
        'html-lang-valid': 'error',
        'meta-description': 'error',
        
        // Best Practices
        'uses-https': 'error',
        'uses-http2': 'warn',
        'no-vulnerable-libraries': 'error',
        'charset': 'error',
        
        // SEO
        'meta-description': 'error',
        'document-title': 'error',
        'crawlable-anchors': 'error',
        'robots-txt': 'warn',
        'hreflang': 'warn',
        'canonical': 'warn',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};