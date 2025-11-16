import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  // Main documentation sidebar
  docsSidebar: [
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started/what-is-mifty',
        'getting-started/installation',
        'getting-started/quick-start',
        'getting-started/first-project',
      ],
    },
    {
      type: 'category',
      label: 'Framework Guide',
      items: [
        'framework/architecture',
        'framework/project-structure',
        'framework/configuration',
        'framework/development-workflow',
      ],
    },
    {
      type: 'category',
      label: 'Database Design',
      items: [
        'database/visual-designer',
        'database/manual-schema',
        'database/configuration',
        'database/migrations',
      ],
    },
    {
      type: 'category',
      label: 'Commands Reference',
      items: [
        'commands/cli-commands',
        'commands/npm-scripts',
        'commands/development-commands',
        'commands/production-commands',
      ],
    },
    {
      type: 'category',
      label: 'Adapters & Integrations',
      items: [
        'adapters/authentication',
        'adapters/email-services',
        'adapters/storage-solutions',
        'adapters/payment-processing',
        'adapters/ai-services',
        'adapters/custom-development',
      ],
    },
    {
      type: 'category',
      label: 'Tutorials',
      items: [
        'tutorials/blog-api',
        'tutorials/ecommerce-backend',
        'tutorials/authentication-system',
        'tutorials/file-upload-service',
        'tutorials/realtime-features',
      ],
    },
    {
      type: 'category',
      label: 'Troubleshooting',
      items: [
        'troubleshooting/common-issues',
        'troubleshooting/error-messages',
        'troubleshooting/performance-optimization',
        'troubleshooting/debugging-guide',
      ],
    },
    {
      type: 'category',
      label: 'Contributing',
      items: [
        'contributing/development-setup',
        'contributing/code-guidelines',
        'contributing/testing',
        'contributing/release-process',
      ],
    },
  ],

  // API Reference sidebar
  apiSidebar: [
    {
      type: 'category',
      label: 'API Reference',
      items: [
        'api/core-modules',
        'api/service-layer',
        'api/repository-pattern',
        'api/utility-functions',
      ],
    },
  ],
};

export default sidebars;
