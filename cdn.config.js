/**
 * CDN Configuration for Mifty Documentation
 * Optimizes asset delivery and caching strategies
 */

module.exports = {
  // Cloudflare configuration
  cloudflare: {
    zoneId: process.env.CLOUDFLARE_ZONE_ID,
    apiToken: process.env.CLOUDFLARE_API_TOKEN,
    cacheRules: [
      {
        pattern: '*.css',
        cacheTtl: 31536000, // 1 year
        browserTtl: 31536000,
      },
      {
        pattern: '*.js',
        cacheTtl: 31536000, // 1 year
        browserTtl: 31536000,
      },
      {
        pattern: '*.{png,jpg,jpeg,gif,svg,ico}',
        cacheTtl: 31536000, // 1 year
        browserTtl: 31536000,
      },
      {
        pattern: '*.{woff,woff2,ttf,eot}',
        cacheTtl: 31536000, // 1 year
        browserTtl: 31536000,
      },
      {
        pattern: '*.html',
        cacheTtl: 3600, // 1 hour
        browserTtl: 3600,
      },
      {
        pattern: 'sitemap.xml',
        cacheTtl: 86400, // 1 day
        browserTtl: 86400,
      },
      {
        pattern: 'robots.txt',
        cacheTtl: 86400, // 1 day
        browserTtl: 86400,
      },
    ],
    compressionRules: [
      {
        pattern: '*.{html,css,js,json,xml,txt}',
        compression: 'gzip',
        level: 6,
      },
    ],
    securityHeaders: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    },
  },

  // AWS CloudFront configuration
  cloudfront: {
    distributionId: process.env.CLOUDFRONT_DISTRIBUTION_ID,
    originDomain: 'mifty.dev',
    cacheBehaviors: [
      {
        pathPattern: '/static/*',
        cachePolicyId: '4135ea2d-6df8-44a3-9df3-4b5a84be39ad', // CachingOptimized
        originRequestPolicyId: '88a5eaf4-2fd4-4709-b370-b4c650ea3fcf', // CORS-S3Origin
        compress: true,
      },
      {
        pathPattern: '*.{css,js}',
        cachePolicyId: '4135ea2d-6df8-44a3-9df3-4b5a84be39ad', // CachingOptimized
        compress: true,
      },
      {
        pathPattern: '*.{png,jpg,jpeg,gif,svg,ico,woff,woff2}',
        cachePolicyId: '4135ea2d-6df8-44a3-9df3-4b5a84be39ad', // CachingOptimized
        compress: true,
      },
    ],
    customErrorPages: [
      {
        errorCode: 404,
        responseCode: 404,
        responsePagePath: '/404.html',
        errorCachingMinTtl: 300,
      },
      {
        errorCode: 403,
        responseCode: 404,
        responsePagePath: '/404.html',
        errorCachingMinTtl: 300,
      },
    ],
  },

  // Netlify configuration
  netlify: {
    headers: [
      {
        for: '/*',
        values: {
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
        },
      },
      {
        for: '/static/*',
        values: {
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      },
      {
        for: '*.{css,js}',
        values: {
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      },
      {
        for: '*.{png,jpg,jpeg,gif,svg,ico,woff,woff2}',
        values: {
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      },
    ],
    redirects: [
      {
        from: '/docs',
        to: '/docs/getting-started/what-is-mifty',
        status: 301,
      },
      {
        from: '/api',
        to: '/docs/api/core-modules',
        status: 301,
      },
    ],
  },

  // Vercel configuration
  vercel: {
    headers: [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ],
    rewrites: [
      {
        source: '/docs',
        destination: '/docs/getting-started/what-is-mifty',
      },
      {
        source: '/api',
        destination: '/docs/api/core-modules',
      },
    ],
  },
};