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
    metadata: [
      { name: 'keywords', content: 'mifty, framework, nodejs, typescript, database, api, documentation' },
      { name: 'description', content: 'Enterprise-Grade Node.js TypeScript Framework with Visual Database Designer & Auto Code Generation' },
      { name: 'author', content: 'Mifty Framework Team' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
      { name: 'theme-color', content: '#6366f1' },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'Mifty Framework Documentation' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:site', content: '@miftyframework' },
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
          label: 'NPM',
          position: 'right',
        },
        {
          href: 'https://github.com/abhir22/mifty-docs',
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
              href: 'https://github.com/abhir22/mifty-docs/issues',
            },
            {
              label: 'GitHub Discussions',
              href: 'https://github.com/abhir22/mifty-docs/discussions',
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
