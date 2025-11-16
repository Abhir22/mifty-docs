import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Mifty Framework',
  tagline: 'Enterprise-Grade Node.js TypeScript Framework with Visual Database Designer & Auto Code Generation',
  favicon: 'img/favicon-32x32.png',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://mifty.dev',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'abhir22', // Usually your GitHub org/user name.
  projectName: 'mifty', // Usually your repo name.

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Edit links and last update info removed
          showLastUpdateAuthor: false,
          showLastUpdateTime: false,
        },
        theme: {
          customCss: './src/css/custom.css',
        },
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
          ignorePatterns: ['/tags/**'],
          filename: 'sitemap.xml',
          createSitemapItems: async (params) => {
            const { defaultCreateSitemapItems, ...rest } = params;
            const items = await defaultCreateSitemapItems(rest);
            return items.map((item) => {
              // Set higher priority for important pages
              if (item.url.includes('/docs/getting-started/')) {
                return { ...item, priority: 0.9, changefreq: 'weekly' };
              }
              if (item.url.includes('/docs/framework/') || item.url.includes('/docs/api/')) {
                return { ...item, priority: 0.8, changefreq: 'weekly' };
              }
              if (item.url === '/' || item.url.includes('/docs/intro')) {
                return { ...item, priority: 1.0, changefreq: 'weekly' };
              }
              // Ensure homepage gets highest priority
              if (item.url.endsWith('/')) {
                return { ...item, priority: 1.0, changefreq: 'weekly' };
              }
              return { ...item, priority: 0.6, changefreq: 'monthly' };
            });
          },
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    // Local search plugin
    'docusaurus-lunr-search',
    // Analytics plugins - disabled until proper IDs are configured
    // [
    //   '@docusaurus/plugin-google-gtag',
    //   {
    //     trackingID: process.env.GOOGLE_ANALYTICS_ID,
    //     anonymizeIP: true,
    //   },
    // ],
    // [
    //   '@docusaurus/plugin-google-tag-manager',
    //   {
    //     containerId: process.env.GOOGLE_TAG_MANAGER_ID,
    //   },
    // ],
    // Performance and SEO plugins
    // PWA plugin temporarily disabled due to missing theme component
    // [
    //   '@docusaurus/plugin-pwa',
    //   {
    //     debug: false,
    //     offlineModeActivationStrategies: [
    //       'appInstalled',
    //       'standalone',
    //       'queryString',
    //     ],
    //     pwaHead: [
    //       {
    //         tagName: 'link',
    //         rel: 'icon',
    //         href: '/img/favicon-32x32.png',
    //       },
    //       {
    //         tagName: 'link',
    //         rel: 'manifest',
    //         href: '/manifest.json',
    //       },
    //       {
    //         tagName: 'meta',
    //         name: 'theme-color',
    //         content: '#6366f1',
    //       },
    //       {
    //         tagName: 'meta',
    //         name: 'apple-mobile-web-app-capable',
    //         content: 'yes',
    //       },
    //       {
    //         tagName: 'meta',
    //         name: 'apple-mobile-web-app-status-bar-style',
    //         content: '#6366f1',
    //       },
    //       {
    //         tagName: 'link',
    //         rel: 'apple-touch-icon',
    //         href: '/img/apple-touch-icon.png',
    //       },
    //       {
    //         tagName: 'meta',
    //         name: 'msapplication-TileImage',
    //         content: '/img/android-chrome-192x192.png',
    //       },
    //       {
    //         tagName: 'meta',
    //         name: 'msapplication-TileColor',
    //         content: '#6366f1',
    //       },
    //     ],
    //   },
    // ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'navigation-enhanced',
        path: 'src/components',
        routeBasePath: 'components',
        sidebarPath: false,
      },
    ],
  ],

  themes: ['@docusaurus/theme-mermaid'],

  markdown: {
    mermaid: true,
  },

  themeConfig: {
    // Replace with your project's social card
    image: 'img/logo.png',
    // Enhanced SEO configuration
    headTags: [
      // Canonical URL
      {
        tagName: 'link',
        attributes: {
          rel: 'canonical',
          href: 'https://mifty.dev',
        },
      },
      // DNS prefetch for performance
      {
        tagName: 'link',
        attributes: {
          rel: 'dns-prefetch',
          href: '//fonts.googleapis.com',
        },
      },
      // Preconnect for performance
      {
        tagName: 'link',
        attributes: {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: 'anonymous',
        },
      },
      // Structured data for software application
      {
        tagName: 'script',
        attributes: {
          type: 'application/ld+json',
        },
        innerHTML: JSON.stringify({
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
          ],
        }),
      },
    ],
    metadata: [
      // Primary keywords for core framework discovery
      { name: 'keywords', content: 'mifty, mifty framework, mifty cli, nodejs framework, modular architecture, typescript backend framework, nodejs modular framework, prisma nodejs framework, nodejs clean architecture, enterprise nodejs framework' },
      // Enhanced description with primary keywords
      { name: 'description', content: 'Mifty Framework - Enterprise-Grade Node.js TypeScript Framework with Visual Database Designer & Auto Code Generation. Build scalable modular backend applications with Prisma integration and CLI tools.' },
      { name: 'author', content: 'Mifty Framework Team' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
      { name: 'theme-color', content: '#6366f1' },
      { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },
      { name: 'googlebot', content: 'index, follow' },
      { name: 'bingbot', content: 'index, follow' },
      // Open Graph metadata
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'Mifty Framework Documentation' },
      { property: 'og:title', content: 'Mifty Framework - Enterprise Node.js TypeScript Framework' },
      { property: 'og:description', content: 'Build scalable modular backend applications with Mifty Framework. Features visual database designer, auto code generation, and Prisma integration for Node.js TypeScript projects.' },
      { property: 'og:image', content: 'https://mifty.dev/img/logo.png' },
      { property: 'og:image:alt', content: 'Mifty Framework Logo - Node.js TypeScript Framework' },
      { property: 'og:url', content: 'https://mifty.dev' },
      { property: 'og:locale', content: 'en_US' },
      // Twitter Card metadata
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:site', content: '@miftyframework' },
      { name: 'twitter:creator', content: '@miftyframework' },
      { name: 'twitter:title', content: 'Mifty Framework - Enterprise Node.js TypeScript Framework' },
      { name: 'twitter:description', content: 'Build scalable modular backend applications with Mifty Framework. Visual database designer, auto code generation, and Prisma integration.' },
      { name: 'twitter:image', content: 'https://mifty.dev/img/logo.png' },
      { name: 'twitter:image:alt', content: 'Mifty Framework Logo - Node.js TypeScript Framework' },
      // Additional SEO metadata
      { name: 'application-name', content: 'Mifty Framework Documentation' },
      { name: 'apple-mobile-web-app-title', content: 'Mifty Framework' },
      { name: 'msapplication-TileColor', content: '#6366f1' },
      { name: 'msapplication-config', content: '/browserconfig.xml' },
      // Structured data hints
      { name: 'generator', content: 'Docusaurus' },
      { name: 'format-detection', content: 'telephone=no' },
    ],
    colorMode: {
      respectPrefersColorScheme: true,
      defaultMode: 'light',
      disableSwitch: false,
    },
    navbar: {
      title: 'Mifty',
      logo: {
        alt: 'Mifty Framework Logo',
        src: 'img/logo.png',
        srcDark: 'img/logo.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Docs',
        },
        // {
        //   type: 'docSidebar',
        //   sidebarId: 'apiSidebar',
        //   position: 'left',
        //   label: 'API',
        // },
        {
          href: 'https://www.npmjs.com/package/@mifty/cli',
          label: 'NPM Package',
          position: 'right',
          'aria-label': 'Download Mifty CLI from NPM',
        },
        {
          href: 'https://github.com/abhir22/mifty-docs',
          label: 'GitHub',
          position: 'right',
          'aria-label': 'View Mifty Framework source code on GitHub',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Getting Started with Mifty',
              to: '/docs/getting-started/what-is-mifty',
            },
            {
              label: 'Framework Architecture Guide',
              to: '/docs/framework/architecture',
            },
            {
              label: 'API Reference Documentation',
              to: '/docs/api/core-modules',
            },
          ],
        },
        {
          title: 'Community & Support',
          items: [
            {
              label: 'Report Issues & Bugs',
              href: 'https://github.com/abhir22/mifty-docs/issues',
            },
            {
              label: 'Community Discussions',
              href: 'https://github.com/abhir22/mifty-docs/discussions',
            },
            {
              label: 'Stack Overflow Help',
              href: 'https://stackoverflow.com/questions/tagged/mifty',
            },
          ],
        },
        {
          title: 'Resources',
          items: [
            {
              label: 'Download Mifty CLI',
              href: 'https://www.npmjs.com/package/@mifty/cli',
            },
            {
              label: 'Source Code on GitHub',
              href: 'https://github.com/abhir22/mifty-docs',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Mifty Framework.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'typescript', 'javascript', 'sql', 'yaml'],
    },

    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: true,
      },
      versionPersistence: 'localStorage',
    },
    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 4,
    },
    announcementBar: {
      id: 'support_us',
      content:
        '⭐️ If you like Mifty, give it a star on <a target="_blank" rel="noopener noreferrer" href="https://github.com/abhir22/mifty-docs" aria-label="Star Mifty on GitHub (opens in new tab)">GitHub</a>! ⭐️',
      backgroundColor: '#fafbfc',
      textColor: '#091E42',
      isCloseable: false,
    },
    // Enhanced accessibility configuration
    accessibility: {
      skipToContent: true,
      announcements: {
        polite: true,
      },
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
