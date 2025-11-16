# SEO and Navigation Components Usage Examples

This document demonstrates how to use the new SEO-optimized internal linking and navigation components.

## InternalLink Component

Use `InternalLink` for keyword-rich internal links:

```tsx
import InternalLink from '@site/src/components/InternalLink';

<InternalLink 
  to="/docs/getting-started/installation"
  aria-label="Navigate to Mifty installation guide"
  title="Learn how to install Mifty CLI and set up your first project"
>
  Install Mifty Framework
</InternalLink>
```

## RelatedDocs Component

Use `RelatedDocs` to show cross-references at the end of documentation pages:

```tsx
import RelatedDocs from '@site/src/components/RelatedDocs';

<RelatedDocs
  title="Related Documentation"
  docs={[
    {
      title: "Installation Guide",
      to: "/docs/getting-started/installation",
      description: "Set up Mifty CLI and create your first project"
    },
    {
      title: "Framework Architecture", 
      to: "/docs/framework/architecture",
      description: "Understand Mifty's clean architecture patterns"
    }
  ]}
/>
```

## Breadcrumbs Component

Add breadcrumb navigation with structured data:

```tsx
import Breadcrumbs from '@site/src/components/Breadcrumbs';

// Auto-generates breadcrumbs from URL path
<Breadcrumbs />

// Or provide custom breadcrumb items
<Breadcrumbs 
  items={[
    { label: 'Home', href: '/' },
    { label: 'Documentation', href: '/docs/intro' },
    { label: 'Getting Started' },
    { label: 'What is Mifty?', isActive: true }
  ]}
/>
```

## SEO Benefits

These components provide:

- **Structured Data**: Breadcrumbs include JSON-LD markup for search engines
- **Internal Linking**: Improves page authority distribution and crawlability  
- **Keyword Optimization**: Link anchor text includes relevant keywords
- **User Experience**: Consistent navigation and cross-referencing
- **Accessibility**: Proper ARIA labels and semantic markup