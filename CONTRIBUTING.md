# Contributing to Mifty Documentation

Thank you for your interest in contributing to the Mifty Framework documentation! This guide will help you get started with contributing to our documentation site.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Content Guidelines](#content-guidelines)
- [Code Style](#code-style)
- [Submitting Changes](#submitting-changes)
- [Review Process](#review-process)
- [Maintenance](#maintenance)

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm** (version 9 or higher)
- **Git**

### Development Setup

1. **Fork the repository**
   ```bash
   # Fork the repository on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/mifty.git
   cd mifty/docs
   ```

2. **Install dependencies**
   ```bash
   npm ci
   ```

3. **Start the development server**
   ```bash
   npm start
   ```
   
   The documentation site will be available at `http://localhost:3000`

4. **Verify your setup**
   ```bash
   # Run type checking
   npm run typecheck
   
   # Test the build
   npm run build
   
   # Run accessibility tests
   npm run test:a11y
   ```

## Content Guidelines

### Writing Style

- **Clear and Concise**: Write in simple, clear language
- **Active Voice**: Use active voice whenever possible
- **Consistent Terminology**: Use consistent terms throughout the documentation
- **User-Focused**: Write from the user's perspective

### Documentation Structure

```
docs/
├── getting-started/     # Installation and quick start
├── framework/          # Core framework concepts
├── database/           # Database design and configuration
├── commands/           # CLI commands reference
├── adapters/           # Third-party integrations
├── tutorials/          # Step-by-step guides
├── api/               # API reference
├── troubleshooting/   # Problem solving guides
└── contributing/      # Development and contribution
```

### Content Types

#### 1. Guides and Tutorials
- Include step-by-step instructions
- Provide code examples
- Add expected outputs
- Include troubleshooting tips

#### 2. Reference Documentation
- Use consistent formatting
- Include all parameters and options
- Provide usage examples
- Link to related content

#### 3. API Documentation
- Document all public methods
- Include parameter types
- Provide return value information
- Add usage examples

### Markdown Guidelines

#### Headings
```markdown
# Page Title (H1) - Only one per page
## Section Title (H2)
### Subsection Title (H3)
#### Sub-subsection Title (H4)
```

#### Code Blocks
```markdown
# Inline code
Use `backticks` for inline code.

# Code blocks with language
\`\`\`typescript
interface User {
  id: string;
  name: string;
}
\`\`\`

# Command examples
\`\`\`bash
npm install @mifty/cli
mifty init my-project
\`\`\`
```

#### Links
```markdown
# Internal links
[Getting Started](./getting-started/what-is-mifty.md)

# External links
[Node.js](https://nodejs.org/) (opens in new tab)
```

#### Admonitions
```markdown
:::tip
This is a helpful tip for users.
:::

:::warning
This is important information users should be aware of.
:::

:::danger
This is critical information that could cause issues if ignored.
:::

:::info
This is additional information that might be useful.
:::
```

## Code Style

### TypeScript/JavaScript

We use the following tools for code quality:

- **ESLint** for linting
- **Prettier** for formatting
- **TypeScript** for type checking

#### Component Guidelines

```typescript
import React from 'react';

interface ComponentProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

/**
 * Component description
 */
export default function Component({
  title,
  description,
  children,
}: ComponentProps): JSX.Element {
  return (
    <div className="component">
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {children}
    </div>
  );
}
```

#### Custom Components

When creating custom components:

1. **Accessibility First**: Ensure components are accessible
2. **Responsive Design**: Components should work on all screen sizes
3. **Performance**: Optimize for performance
4. **Documentation**: Include JSDoc comments

### CSS Guidelines

```css
/* Use CSS custom properties for theming */
.component {
  background: var(--ifm-color-emphasis-100);
  border-radius: var(--ifm-border-radius);
  padding: var(--ifm-spacing-vertical) var(--ifm-spacing-horizontal);
}

/* Mobile-first responsive design */
@media (max-width: 768px) {
  .component {
    padding: 0.5rem;
  }
}

/* Dark mode support */
[data-theme='dark'] .component {
  background: var(--ifm-color-emphasis-200);
}
```

## Submitting Changes

### Branch Naming

Use descriptive branch names:

```bash
# Feature branches
git checkout -b docs/add-authentication-guide
git checkout -b docs/update-api-reference

# Bug fixes
git checkout -b docs/fix-broken-links
git checkout -b docs/fix-mobile-navigation

# Improvements
git checkout -b docs/improve-search-functionality
git checkout -b docs/enhance-accessibility
```

### Commit Messages

Follow conventional commit format:

```bash
# Format
type(scope): description

# Examples
docs(getting-started): add installation troubleshooting section
feat(components): add new CommandBlock component
fix(navigation): resolve mobile menu accessibility issues
style(css): improve responsive design for tablets
```

### Pull Request Process

1. **Create a Pull Request**
   - Use a descriptive title
   - Fill out the PR template
   - Link related issues

2. **PR Template**
   ```markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] Documentation update
   - [ ] New feature/component
   - [ ] Bug fix
   - [ ] Performance improvement
   - [ ] Accessibility improvement

   ## Testing
   - [ ] Tested locally
   - [ ] Accessibility tested
   - [ ] Mobile responsive tested
   - [ ] All links work correctly

   ## Screenshots (if applicable)
   Add screenshots for UI changes

   ## Checklist
   - [ ] Content follows style guidelines
   - [ ] Code follows coding standards
   - [ ] Self-review completed
   - [ ] Documentation updated if needed
   ```

3. **Review Checklist**
   - Content accuracy
   - Grammar and spelling
   - Code quality
   - Accessibility compliance
   - Mobile responsiveness
   - Performance impact

## Review Process

### Review Criteria

All contributions are reviewed for:

1. **Content Quality**
   - Accuracy and completeness
   - Clarity and readability
   - Consistency with existing content

2. **Technical Quality**
   - Code functionality
   - Performance impact
   - Accessibility compliance
   - Cross-browser compatibility

3. **Design Quality**
   - Visual consistency
   - Responsive design
   - User experience

### Review Timeline

- **Initial Review**: Within 2-3 business days
- **Follow-up Reviews**: Within 1-2 business days
- **Final Approval**: After all feedback is addressed

### Reviewer Guidelines

For reviewers:

1. **Be Constructive**: Provide specific, actionable feedback
2. **Be Respectful**: Maintain a positive and collaborative tone
3. **Be Thorough**: Check content, code, and design aspects
4. **Be Timely**: Respond to review requests promptly

## Maintenance

### Content Maintenance

#### Regular Tasks

1. **Link Checking** (Monthly)
   ```bash
   npm run test:links
   ```

2. **Accessibility Audit** (Quarterly)
   ```bash
   npm run test:a11y
   ```

3. **Performance Audit** (Quarterly)
   ```bash
   npm run lighthouse
   ```

4. **Content Review** (Bi-annually)
   - Update outdated information
   - Improve unclear sections
   - Add missing content

#### Version Updates

When updating Mifty framework versions:

1. **Update Version References**
   - Installation commands
   - Package.json examples
   - API documentation

2. **Update Screenshots**
   - CLI output examples
   - UI screenshots
   - Code examples

3. **Update Compatibility Information**
   - Node.js version requirements
   - Browser compatibility
   - Operating system support

### Technical Maintenance

#### Dependencies

```bash
# Check for outdated dependencies
npm outdated

# Update dependencies
npm update

# Audit for security vulnerabilities
npm audit
```

#### Performance Monitoring

```bash
# Run performance tests
npm run test:performance

# Generate build analysis
npm run analyze

# Check bundle size
npm run build && ls -la build/static/js/
```

#### Accessibility Monitoring

```bash
# Run accessibility tests
npm run test:a11y

# Manual testing checklist
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility
- [ ] Color contrast compliance
- [ ] Focus indicators visible
- [ ] Alt text for images
```

### Deployment Maintenance

#### Automated Deployments

The documentation is automatically deployed when:

- Changes are merged to the `main` branch
- All tests pass
- Build completes successfully

#### Manual Deployment

For emergency deployments:

```bash
# GitHub Pages
npm run deploy:github

# Netlify
npm run deploy:netlify

# Vercel
npm run deploy:vercel
```

#### Monitoring

Monitor the following after deployments:

1. **Site Availability**: Ensure the site loads correctly
2. **Performance**: Check Core Web Vitals
3. **Functionality**: Test search, navigation, and interactive elements
4. **Analytics**: Monitor traffic and user behavior

### Issue Management

#### Issue Templates

We use GitHub issue templates for:

- **Bug Reports**: For documentation errors or technical issues
- **Feature Requests**: For new documentation or functionality
- **Content Requests**: For missing or incomplete documentation

#### Issue Triage

Issues are triaged based on:

1. **Priority**
   - Critical: Site-breaking issues
   - High: Major functionality problems
   - Medium: Minor issues or improvements
   - Low: Nice-to-have enhancements

2. **Type**
   - Bug: Something is broken
   - Enhancement: Improvement to existing content
   - Feature: New functionality or content
   - Question: User needs help or clarification

#### Response Times

- **Critical Issues**: Within 24 hours
- **High Priority**: Within 3 business days
- **Medium Priority**: Within 1 week
- **Low Priority**: Within 2 weeks

## Getting Help

### Community Support

- **GitHub Discussions**: For questions and community support
- **GitHub Issues**: For bug reports and feature requests
- **Discord**: For real-time community chat (if available)

### Documentation Team

For documentation-specific questions:

- **Email**: docs@mifty.dev
- **GitHub**: @mifty-docs-team
- **Office Hours**: Tuesdays 2-3 PM EST (if applicable)

### Resources

- [Docusaurus Documentation](https://docusaurus.io/docs)
- [Markdown Guide](https://www.markdownguide.org/)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Web Performance Best Practices](https://web.dev/performance/)

---

Thank you for contributing to Mifty documentation! Your contributions help make the framework more accessible and easier to use for developers worldwide.