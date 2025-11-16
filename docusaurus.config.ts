import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Mifty Framework',
  tagline: 'Enterprise-Grade Node.js TypeScript Framework with Visual Database Designer & Auto Code Generation',
  favicon: 'img/favicon.ico',

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
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/abhir22/mifty/tree/main/docs/',
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/abhir22/mifty/tree/main/docs/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
          ignorePatterns: ['/tags/**'],
          filename: 'sitemap.xml',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    // Analytics plugins
    [
      '@docusaurus/plugin-google-gtag',
      {
        trackingID: process.env.GOOGLE_ANALYTICS_ID || 'G-XXXXXXXXXX',
        anonymizeIP: true,
      },
    ],
    [
      '@docusaurus/plugin-google-tag-manager',
      {
        containerId: process.env.GOOGLE_TAG_MANAGER_ID || 'GTM-XXXXXXX',
      },
    ],
    // Performance and SEO plugins
    [
      '@docusaurus/plugin-pwa',
      {
        debug: false,
        offlineModeActivationStrategies: [
          'appInstalled',
          'standalone',
          'queryString',
        ],
        pwaHead: [
          {
            tagName: 'link',
            rel: 'icon',
            href: '/img/logo.png',
          },
          {
            tagName: 'link',
            rel: 'manifest',
            href: '/manifest.json',
          },
          {
            tagName: 'meta',
            name: 'theme-color',
            content: '#6366f1',
          },
          {
            tagName: 'meta',
            name: 'apple-mobile-web-app-capable',
            content: 'yes',
          },
          {
            tagName: 'meta',
            name: 'apple-mobile-web-app-status-bar-style',
            content: '#6366f1',
          },
          {
            tagName: 'link',
            rel: 'apple-touch-icon',
            href: '/img/logo.png',
          },
          {
            tagName: 'link',
            rel: 'mask-icon',
            href: '/img/logo.svg',
            color: '#6366f1',
          },
          {
            tagName: 'meta',
            name: 'msapplication-TileImage',
            content: '/img/logo.png',
          },
          {
            tagName: 'meta',
            name: 'msapplication-TileColor',
            content: '#6366f1',
          },
        ],
      },
    ],
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

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    metadata: [
      {name: 'keywords', content: 'mifty, framework, nodejs, typescript, database, api, documentation'},
      {name: 'description', content: 'Enterprise-Grade Node.js TypeScript Framework with Visual Database Designer & Auto Code Generation'},
      {name: 'author', content: 'Mifty Framework Team'},
      {name: 'viewport', content: 'width=device-width, initial-scale=1.0'},
      {name: 'theme-color', content: '#6366f1'},
      {property: 'og:type', content: 'website'},
      {property: 'og:site_name', content: 'Mifty Framework Documentation'},
      {name: 'twitter:card', content: 'summary_large_image'},
      {name: 'twitter:site', content: '@miftyframework'},
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
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          type: 'docSidebar',
          sidebarId: 'apiSidebar',
          position: 'left',
          label: 'API',
        },
        {to: '/blog', label: 'Blog', position: 'left'},
        {
          href: 'https://www.npmjs.com/package/@mifty/cli',
          label: 'NPM',
          position: 'right',
        },
        {
          href: 'https://github.com/abhir22/mifty',
          label: 'GitHub',
          position: 'right',
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
              label: 'Getting Started',
              to: '/docs/getting-started/what-is-mifty',
            },
            {
              label: 'Framework Guide',
              to: '/docs/framework/architecture',
            },
            {
              label: 'API Reference',
              to: '/docs/api/core-modules',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub Issues',
              href: 'https://github.com/abhir22/mifty/issues',
            },
            {
              label: 'GitHub Discussions',
              href: 'https://github.com/abhir22/mifty/discussions',
            },
            {
              label: 'Stack Overflow',
              href: 'https://stackoverflow.com/questions/tagged/mifty',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'NPM Package',
              href: 'https://www.npmjs.com/package/@mifty/cli',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/abhir22/mifty',
            },
            {
              label: 'Blog',
              to: '/blog',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Mifty Framework. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'typescript', 'javascript', 'sql', 'yaml'],
    },
    algolia: {
      // The application ID provided by Algolia
      appId: process.env.ALGOLIA_APP_ID || 'BH4D9OD16A',
      // Public API key: it is safe to commit it
      apiKey: process.env.ALGOLIA_SEARCH_API_KEY || '3c6db5c24d0e6ad9c2f49d7a4c5b8e9f',
      indexName: 'mifty-docs',
      // Optional: see doc section below
      contextualSearch: true,
      // Optional: Specify domains where the navigation should occur through window.location instead on history.push
      externalUrlRegex: 'external\\.com|domain\\.com',
      // Optional: Replace parts of the item URLs from Algolia. Useful when using the same search index for multiple deployments using a different baseUrl
      replaceSearchResultPathname: {
        from: '/docs/', // or as RegExp: /\/docs\//
        to: '/',
      },
      // Optional: Algolia search parameters
      searchParameters: {
        facetFilters: ['type:content'],
        hitsPerPage: 10,
        attributesToRetrieve: [
          'hierarchy.lvl0',
          'hierarchy.lvl1',
          'hierarchy.lvl2',
          'hierarchy.lvl3',
          'hierarchy.lvl4',
          'hierarchy.lvl5',
          'hierarchy.lvl6',
          'content',
          'type',
          'url',
        ],
        attributesToHighlight: [
          'hierarchy.lvl0',
          'hierarchy.lvl1',
          'hierarchy.lvl2',
          'hierarchy.lvl3',
          'hierarchy.lvl4',
          'hierarchy.lvl5',
          'hierarchy.lvl6',
          'content',
        ],
        attributesToSnippet: ['content:10'],
        highlightPreTag: '<mark>',
        highlightPostTag: '</mark>',
      },
      // Optional: path for search page that enabled by default (`false` to disable it)
      searchPagePath: 'search',
      // Optional: insights
      insights: true,
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
        '⭐️ If you like Mifty, give it a star on <a target="_blank" rel="noopener noreferrer" href="https://github.com/abhir22/mifty" aria-label="Star Mifty on GitHub (opens in new tab)">GitHub</a>! ⭐️',
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
