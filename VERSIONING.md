# Documentation Versioning Strategy

This document outlines the versioning strategy for the Mifty Framework documentation, ensuring that users can access documentation for different framework versions while maintaining a clear upgrade path.

## Table of Contents

- [Versioning Philosophy](#versioning-philosophy)
- [Version Structure](#version-structure)
- [Version Management](#version-management)
- [Content Synchronization](#content-synchronization)
- [Migration Guides](#migration-guides)
- [Deprecation Policy](#deprecation-policy)
- [Implementation](#implementation)

## Versioning Philosophy

### Principles

1. **User-Centric**: Documentation versions should align with user needs and framework releases
2. **Backward Compatibility**: Maintain access to older documentation versions
3. **Clear Migration Path**: Provide clear guidance for upgrading between versions
4. **Minimal Maintenance Overhead**: Balance version support with maintenance burden
5. **Search Optimization**: Ensure search works across all supported versions

### Version Support Policy

- **Current Version**: Full support with active updates
- **Previous Major Version**: Security updates and critical bug fixes only
- **Legacy Versions**: Read-only access, no updates
- **Beta/RC Versions**: Separate documentation branch, clearly marked as pre-release

## Version Structure

### Semantic Versioning Alignment

Documentation versions follow the Mifty framework's semantic versioning:

```
Major.Minor.Patch (e.g., 2.1.0)
```

#### Version Categories

1. **Major Versions (2.x.x)**
   - Breaking changes in framework
   - Significant documentation restructuring
   - New major features
   - Full version branch maintained

2. **Minor Versions (x.1.x)**
   - New features added
   - Documentation updates for new features
   - Backward compatible changes
   - Updates applied to current major version

3. **Patch Versions (x.x.1)**
   - Bug fixes and minor improvements
   - Documentation corrections
   - No new features
   - Updates applied to current version only

### URL Structure

```
https://mifty.dev/                    # Latest version (default)
https://mifty.dev/docs/2.1/           # Specific version
https://mifty.dev/docs/2.0/           # Previous major version
https://mifty.dev/docs/next/          # Development version
```

## Version Management

### Docusaurus Versioning

#### Creating New Versions

```bash
# Create a new version when releasing a major framework version
npm run docusaurus docs:version 2.1

# This creates:
# - versioned_docs/version-2.1/
# - versioned_sidebars/version-2.1-sidebars.json
# - versions.json (updated)
```

#### Version Configuration

```javascript
// docusaurus.config.js
module.exports = {
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          // Current version (no prefix)
          routeBasePath: 'docs',
          
          // Version configuration
          lastVersion: 'current',
          versions: {
            current: {
              label: '2.2 (Latest)',
              path: '',
            },
            '2.1': {
              label: '2.1',
              path: '2.1',
            },
            '2.0': {
              label: '2.0 (LTS)',
              path: '2.0',
            },
          },
          
          // Version banner
          onlyIncludeVersions: ['current', '2.1', '2.0'],
        },
      },
    ],
  ],
};
```

### Version Lifecycle

#### 1. Development Phase

```bash
# Work on next version in main branch
git checkout main
# Make documentation updates for upcoming features
git commit -m "docs: add new database adapter documentation"
```

#### 2. Release Preparation

```bash
# Before framework release, create documentation version
npm run docusaurus docs:version 2.2

# Update version references
npm run update:version-refs 2.2

# Test version switching
npm run test:versions
```

#### 3. Release

```bash
# Deploy with new version
npm run build
npm run deploy

# Update version metadata
npm run update:version-metadata
```

#### 4. Maintenance

```bash
# Apply critical fixes to supported versions
git checkout version-2.1
# Make necessary fixes
git commit -m "docs(2.1): fix critical installation issue"

# Cherry-pick to other supported versions if needed
git checkout version-2.0
git cherry-pick <commit-hash>
```

## Content Synchronization

### Cross-Version Updates

#### Types of Updates

1. **Version-Specific Updates**
   - New features in current version only
   - Breaking changes documentation
   - Version-specific examples

2. **Cross-Version Updates**
   - Security fixes
   - Critical bug fixes
   - General improvements (typos, clarity)

3. **Backport Candidates**
   - Security-related documentation
   - Critical installation fixes
   - Major usability improvements

#### Synchronization Process

```bash
# Identify changes that need backporting
git log --oneline --since="1 week ago" docs/

# Create backport script
#!/bin/bash
VERSIONS=("2.1" "2.0")
COMMITS=("abc123" "def456")

for version in "${VERSIONS[@]}"; do
  git checkout "version-$version"
  for commit in "${COMMITS[@]}"; do
    git cherry-pick "$commit" || echo "Manual merge needed for $commit in $version"
  done
done
```

### Automated Synchronization

```yaml
# GitHub Actions workflow for cross-version updates
name: Sync Documentation Versions

on:
  push:
    branches: [main]
    paths: ['docs/**']

jobs:
  sync-versions:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Identify backport candidates
        run: |
          # Check for commits with [backport] tag
          git log --oneline --grep="\[backport\]" HEAD~1..HEAD
      
      - name: Apply to supported versions
        run: |
          # Apply changes to version branches
          ./scripts/backport-changes.sh
```

## Migration Guides

### Migration Documentation Structure

```
docs/
├── migration/
│   ├── v2.0-to-v2.1.md
│   ├── v2.1-to-v2.2.md
│   └── migration-guide-template.md
```

### Migration Guide Template

```markdown
# Migrating from v2.1 to v2.2

## Overview

Brief overview of changes and migration complexity.

## Breaking Changes

### API Changes
- List of breaking API changes
- Before/after code examples
- Migration steps

### Configuration Changes
- Configuration file updates
- Environment variable changes
- New required settings

### Dependency Updates
- Updated dependencies
- New peer dependencies
- Removed dependencies

## New Features

### Feature Name
- Description of new feature
- Usage examples
- Configuration options

## Step-by-Step Migration

### 1. Update Dependencies
```bash
npm update @mifty/cli
```

### 2. Update Configuration
```javascript
// Before
const config = { ... };

// After
const config = { ... };
```

### 3. Update Code
- Specific code changes needed
- Automated migration tools (if available)

## Troubleshooting

Common issues and solutions during migration.

## Rollback Plan

Steps to rollback if migration fails.
```

### Automated Migration Tools

```javascript
// Migration script template
const migrationScript = {
  version: '2.1-to-2.2',
  
  async migrate(projectPath) {
    // 1. Backup current configuration
    await this.backup(projectPath);
    
    // 2. Update package.json
    await this.updateDependencies(projectPath);
    
    // 3. Update configuration files
    await this.updateConfig(projectPath);
    
    // 4. Run code transformations
    await this.transformCode(projectPath);
    
    // 5. Validate migration
    await this.validate(projectPath);
  },
  
  async rollback(projectPath) {
    // Rollback procedures
  }
};
```

## Deprecation Policy

### Deprecation Timeline

1. **Announcement Phase** (Release N)
   - Feature marked as deprecated in documentation
   - Warning added to relevant pages
   - Alternative solutions provided

2. **Warning Phase** (Release N+1)
   - Deprecation warnings in framework
   - Migration guide published
   - Support for migration questions

3. **Removal Phase** (Release N+2)
   - Feature removed from framework
   - Documentation archived
   - Breaking change documented

### Deprecation Documentation

```markdown
:::warning Deprecated
This feature is deprecated as of v2.1 and will be removed in v2.3.
Use [new feature](./new-feature.md) instead.

**Migration Guide**: [v2.1 to v2.2 Migration](./migration/v2.1-to-v2.2.md)
:::
```

### Version Support Matrix

| Framework Version | Documentation Status | Support Level | End of Life |
|-------------------|---------------------|---------------|-------------|
| 2.2.x (Current)   | Active Development  | Full Support  | TBD         |
| 2.1.x             | Maintenance Only    | Security Only | 2024-12-31  |
| 2.0.x (LTS)       | Maintenance Only    | Security Only | 2025-06-30  |
| 1.x.x             | Archived           | None          | 2023-12-31  |

## Implementation

### Technical Implementation

#### Version Switching Component

```typescript
import React from 'react';
import { useDocsVersion } from '@docusaurus/theme-common/internal';

export default function VersionSwitcher(): JSX.Element {
  const { activeVersion, alternateVersions } = useDocsVersion();
  
  return (
    <div className="version-switcher">
      <label htmlFor="version-select">Documentation Version:</label>
      <select 
        id="version-select"
        value={activeVersion.name}
        onChange={(e) => {
          const version = alternateVersions.find(v => v.name === e.target.value);
          if (version) {
            window.location.href = version.path;
          }
        }}
      >
        {[activeVersion, ...alternateVersions].map((version) => (
          <option key={version.name} value={version.name}>
            {version.label}
          </option>
        ))}
      </select>
    </div>
  );
}
```

#### Version Banner Component

```typescript
import React from 'react';
import { useDocsVersion } from '@docusaurus/theme-common/internal';

export default function VersionBanner(): JSX.Element | null {
  const { activeVersion } = useDocsVersion();
  
  if (activeVersion.name === 'current') {
    return null; // No banner for current version
  }
  
  const isLTS = activeVersion.name === '2.0';
  const isDeprecated = activeVersion.name < '2.0';
  
  return (
    <div className={`version-banner ${isDeprecated ? 'deprecated' : 'older'}`}>
      {isDeprecated ? (
        <p>
          ⚠️ This documentation is for an unsupported version of Mifty.
          <a href="/docs/">View current documentation</a>
        </p>
      ) : (
        <p>
          📖 You're viewing documentation for Mifty {activeVersion.label}.
          {isLTS && ' (LTS)'}
          <a href="/docs/">View latest documentation</a>
        </p>
      )}
    </div>
  );
}
```

### SEO Considerations

#### Canonical URLs

```html
<!-- For versioned pages -->
<link rel="canonical" href="https://mifty.dev/docs/getting-started/installation" />

<!-- Version-specific content -->
<link rel="canonical" href="https://mifty.dev/docs/2.1/getting-started/installation" />
```

#### Robots.txt Configuration

```
# Allow indexing of current and previous major version
User-agent: *
Allow: /docs/
Allow: /docs/2.1/

# Discourage indexing of older versions
Disallow: /docs/1.*/
Disallow: /docs/0.*/

# Sitemap
Sitemap: https://mifty.dev/sitemap.xml
```

### Analytics and Monitoring

#### Version Usage Tracking

```javascript
// Track version usage
gtag('event', 'version_view', {
  event_category: 'documentation',
  event_label: activeVersion.name,
  custom_parameter_version: activeVersion.name
});

// Track version switching
gtag('event', 'version_switch', {
  event_category: 'navigation',
  event_label: `${fromVersion} -> ${toVersion}`,
  from_version: fromVersion,
  to_version: toVersion
});
```

#### Version Performance Monitoring

```javascript
// Monitor performance by version
const versionMetrics = {
  version: activeVersion.name,
  loadTime: performance.now(),
  userAgent: navigator.userAgent,
  referrer: document.referrer
};

// Send to analytics
analytics.track('version_performance', versionMetrics);
```

---

This versioning strategy ensures that users can access appropriate documentation for their framework version while maintaining a sustainable maintenance approach for the documentation team.