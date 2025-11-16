#!/usr/bin/env node

/**
 * SEO Audit CLI Tool
 * 
 * This script performs comprehensive SEO audits on the built Docusaurus site.
 * It checks meta tags, structured data, and provides optimization recommendations.
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// SEO validation functions (simplified versions for Node.js)
const validateTitle = (title) => {
  const warnings = [];
  const errors = [];
  let score = 100;

  const minLength = 30;
  const maxLength = 60;

  if (title.length < minLength) {
    errors.push(`Title too short: ${title.length} chars (min: ${minLength})`);
    score -= 30;
  } else if (title.length > maxLength) {
    warnings.push(`Title too long: ${title.length} chars (max: ${maxLength})`);
    score -= 15;
  }

  if (!title.includes('Mifty')) {
    warnings.push('Title should include "Mifty" brand name');
    score -= 10;
  }

  return { isValid: errors.length === 0, warnings, errors, score };
};

const validateDescription = (description) => {
  const warnings = [];
  const errors = [];
  let score = 100;

  const minLength = 120;
  const maxLength = 160;

  if (description.length < minLength) {
    warnings.push(`Description too short: ${description.length} chars (min: ${minLength})`);
    score -= 20;
  } else if (description.length > maxLength) {
    errors.push(`Description too long: ${description.length} chars (max: ${maxLength})`);
    score -= 25;
  }

  const primaryKeywords = ['mifty', 'nodejs', 'typescript', 'framework'];
  const foundKeywords = primaryKeywords.filter(keyword => 
    description.toLowerCase().includes(keyword.toLowerCase())
  );

  if (foundKeywords.length === 0) {
    warnings.push('Description should include primary keywords');
    score -= 15;
  }

  return { isValid: errors.length === 0, warnings, errors, score };
};

const validateMetaTags = (document) => {
  const warnings = [];
  const errors = [];
  let score = 100;

  // Required meta tags
  const requiredTags = [
    { selector: 'title', name: 'Title tag' },
    { selector: 'meta[name="description"]', name: 'Meta description' },
    { selector: 'meta[name="keywords"]', name: 'Meta keywords' },
    { selector: 'link[rel="canonical"]', name: 'Canonical URL' },
  ];

  requiredTags.forEach(tag => {
    const element = document.querySelector(tag.selector);
    if (!element) {
      errors.push(`Missing ${tag.name}`);
      score -= 20;
    } else {
      const content = element.getAttribute('content') || element.textContent;
      if (!content || content.trim().length === 0) {
        errors.push(`Empty ${tag.name}`);
        score -= 15;
      }
    }
  });

  // Open Graph tags
  const ogTags = ['og:title', 'og:description', 'og:type', 'og:url', 'og:image'];
  ogTags.forEach(tag => {
    const element = document.querySelector(`meta[property="${tag}"]`);
    if (!element) {
      warnings.push(`Missing Open Graph tag: ${tag}`);
      score -= 5;
    }
  });

  // Twitter Card tags
  const twitterTags = ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image'];
  twitterTags.forEach(tag => {
    const element = document.querySelector(`meta[name="${tag}"]`);
    if (!element) {
      warnings.push(`Missing Twitter Card tag: ${tag}`);
      score -= 3;
    }
  });

  // Check for structured data
  const structuredDataScript = document.querySelector('script[type="application/ld+json"]');
  if (!structuredDataScript) {
    warnings.push('Missing structured data (JSON-LD)');
    score -= 10;
  } else {
    try {
      JSON.parse(structuredDataScript.textContent);
    } catch (e) {
      errors.push('Invalid JSON-LD structured data');
      score -= 15;
    }
  }

  return { isValid: errors.length === 0, warnings, errors, score };
};

const auditPage = (filePath, relativePath) => {
  try {
    const html = fs.readFileSync(filePath, 'utf8');
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Extract page data
    const titleElement = document.querySelector('title');
    const descriptionElement = document.querySelector('meta[name="description"]');
    
    const title = titleElement ? titleElement.textContent : '';
    const description = descriptionElement ? descriptionElement.getAttribute('content') : '';

    // Run validations
    const titleValidation = validateTitle(title);
    const descriptionValidation = validateDescription(description);
    const metaTagsValidation = validateMetaTags(document);

    // Calculate overall score
    const overallScore = Math.round(
      (titleValidation.score + descriptionValidation.score + metaTagsValidation.score) / 3
    );

    return {
      path: relativePath,
      title,
      description,
      overallScore,
      titleValidation,
      descriptionValidation,
      metaTagsValidation,
      recommendations: [
        ...titleValidation.warnings.map(w => `Title: ${w}`),
        ...titleValidation.errors.map(e => `Title: ${e}`),
        ...descriptionValidation.warnings.map(w => `Description: ${w}`),
        ...descriptionValidation.errors.map(e => `Description: ${e}`),
        ...metaTagsValidation.warnings.map(w => `Meta: ${w}`),
        ...metaTagsValidation.errors.map(e => `Meta: ${e}`)
      ]
    };
  } catch (error) {
    console.error(`Error auditing ${relativePath}:`, error.message);
    return null;
  }
};

const findHtmlFiles = (dir, baseDir = dir) => {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...findHtmlFiles(fullPath, baseDir));
    } else if (item.endsWith('.html')) {
      const relativePath = path.relative(baseDir, fullPath);
      files.push({ fullPath, relativePath });
    }
  }

  return files;
};

const generateReport = (results) => {
  const validResults = results.filter(r => r !== null);
  const totalPages = validResults.length;
  const averageScore = Math.round(
    validResults.reduce((sum, r) => sum + r.overallScore, 0) / totalPages
  );

  console.log('\n🔍 SEO Audit Report');
  console.log('==================');
  console.log(`📊 Total Pages Audited: ${totalPages}`);
  console.log(`📈 Average SEO Score: ${averageScore}/100`);
  console.log('');

  // Group results by score ranges
  const excellent = validResults.filter(r => r.overallScore >= 90);
  const good = validResults.filter(r => r.overallScore >= 70 && r.overallScore < 90);
  const needsImprovement = validResults.filter(r => r.overallScore >= 50 && r.overallScore < 70);
  const poor = validResults.filter(r => r.overallScore < 50);

  console.log(`✅ Excellent (90-100): ${excellent.length} pages`);
  console.log(`🟢 Good (70-89): ${good.length} pages`);
  console.log(`🟡 Needs Improvement (50-69): ${needsImprovement.length} pages`);
  console.log(`🔴 Poor (0-49): ${poor.length} pages`);
  console.log('');

  // Show pages that need attention
  if (poor.length > 0) {
    console.log('🔴 Pages Requiring Immediate Attention:');
    poor.forEach(result => {
      console.log(`   ${result.path} (Score: ${result.overallScore})`);
      result.recommendations.slice(0, 3).forEach(rec => {
        console.log(`     - ${rec}`);
      });
    });
    console.log('');
  }

  if (needsImprovement.length > 0) {
    console.log('🟡 Pages That Could Be Improved:');
    needsImprovement.slice(0, 5).forEach(result => {
      console.log(`   ${result.path} (Score: ${result.overallScore})`);
      result.recommendations.slice(0, 2).forEach(rec => {
        console.log(`     - ${rec}`);
      });
    });
    console.log('');
  }

  // Common issues
  const allRecommendations = validResults.flatMap(r => r.recommendations);
  const issueCount = {};
  allRecommendations.forEach(rec => {
    const key = rec.split(':')[0];
    issueCount[key] = (issueCount[key] || 0) + 1;
  });

  const commonIssues = Object.entries(issueCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  if (commonIssues.length > 0) {
    console.log('📋 Most Common Issues:');
    commonIssues.forEach(([issue, count]) => {
      console.log(`   ${issue}: ${count} pages affected`);
    });
    console.log('');
  }

  // Save detailed report
  const detailedReport = {
    summary: {
      totalPages,
      averageScore,
      distribution: {
        excellent: excellent.length,
        good: good.length,
        needsImprovement: needsImprovement.length,
        poor: poor.length
      }
    },
    pages: validResults.map(r => ({
      path: r.path,
      title: r.title,
      description: r.description,
      score: r.overallScore,
      recommendations: r.recommendations
    })),
    commonIssues: commonIssues.map(([issue, count]) => ({ issue, count }))
  };

  fs.writeFileSync('seo-audit-report.json', JSON.stringify(detailedReport, null, 2));
  console.log('📄 Detailed report saved to: seo-audit-report.json');
};

// Main execution
const main = () => {
  const buildDir = path.join(__dirname, '..', 'build');
  
  if (!fs.existsSync(buildDir)) {
    console.error('❌ Build directory not found. Please run "npm run build" first.');
    process.exit(1);
  }

  console.log('🔍 Starting SEO audit...');
  console.log(`📁 Scanning: ${buildDir}`);

  const htmlFiles = findHtmlFiles(buildDir);
  console.log(`📄 Found ${htmlFiles.length} HTML files`);

  const results = htmlFiles.map(({ fullPath, relativePath }) => 
    auditPage(fullPath, relativePath)
  );

  generateReport(results);
  
  const validResults = results.filter(r => r !== null);
  const averageScore = Math.round(
    validResults.reduce((sum, r) => sum + r.overallScore, 0) / validResults.length
  );

  // Exit with appropriate code
  if (averageScore < 70) {
    console.log('❌ SEO audit failed. Average score below 70.');
    process.exit(1);
  } else {
    console.log('✅ SEO audit passed!');
    process.exit(0);
  }
};

// Install jsdom if not available
try {
  require('jsdom');
  main();
} catch (error) {
  console.log('📦 Installing required dependency: jsdom');
  const { execSync } = require('child_process');
  try {
    execSync('npm install jsdom --save-dev', { stdio: 'inherit' });
    console.log('✅ jsdom installed successfully');
    main();
  } catch (installError) {
    console.error('❌ Failed to install jsdom:', installError.message);
    console.log('Please run: npm install jsdom --save-dev');
    process.exit(1);
  }
}