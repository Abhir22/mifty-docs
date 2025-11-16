# SEOHead Component

A reusable TypeScript component for consistent SEO metadata across Mifty documentation pages.

## Features

- **Optimized Meta Tags**: Automatically generates title, description, and keyword meta tags
- **Structured Data**: Includes JSON-LD structured data for better search engine understanding
- **Social Media**: Open Graph and Twitter Card meta tags for social sharing
- **Validation**: Built-in validation for optimal title and description lengths
- **Flexible**: Supports custom structured data and metadata

## Usage

### Basic Usage

```tsx
import { SEOHead } from '@site/src/components/SEOHead';

function MyPage() {
  return (
    <>
      <SEOHead
        title="Getting Started with Mifty"
        description="Learn how to get started with Mifty, the modern Node.js TypeScript framework."
        keywords={['mifty', 'nodejs', 'typescript', 'framework']}
      />
      {/* Your page content */}
    </>
  );
}
```

### Advanced Usage

```tsx
<SEOHead
  title="Mifty CLI Commands"
  description="Complete reference for Mifty CLI commands and development tools."
  keywords={['mifty cli', 'nodejs cli', 'code generation']}
  type="article"
  image="/img/cli-preview.png"
  url="https://mifty.dev/docs/commands/cli-reference"
  structuredData={{
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'Mifty CLI Commands Reference',
    // ... additional structured data
  }}
/>
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `title` | `string` | ✅ | Page title (will be suffixed with site title) |
| `description` | `string` | ✅ | Meta description for the page |
| `keywords` | `string[]` | ✅ | Array of keywords for the page |
| `type` | `'website' \| 'article'` | ❌ | Type of content (default: 'website') |
| `image` | `string` | ❌ | Open Graph image URL (default: '/img/logo.png') |
| `url` | `string` | ❌ | Canonical URL for the page |
| `structuredData` | `Record<string, any>` | ❌ | Custom structured data object |

## SEO Best Practices

### Title Optimization
- Keep titles under 60 characters for optimal display in search results
- Include primary keywords near the beginning
- The component automatically appends "| Mifty Framework for Node.js"

### Description Optimization
- Aim for 120-160 characters for optimal display
- Include primary and secondary keywords naturally
- Write compelling copy that encourages clicks

### Keywords
- Use 3-8 relevant keywords per page
- Include primary keywords (mifty, nodejs framework, etc.)
- Add page-specific long-tail keywords

## Validation

The component includes built-in validation that logs warnings for:
- Titles over 60 characters
- Descriptions under 120 or over 160 characters

## Generated Output

The component generates:
- Standard meta tags (title, description, keywords)
- Open Graph meta tags for social sharing
- Twitter Card meta tags
- Canonical URL
- JSON-LD structured data
- Additional SEO meta tags (robots, author, theme-color)

## Requirements Satisfied

This component satisfies the following requirements:
- **4.1**: Reusable SEO system for documentation pages
- **4.2**: Automatic generation of proper metadata
- **4.3**: Structured data markup for better search engine understanding