#!/usr/bin/env node

/**
 * Performance testing script for Mifty Documentation
 * Tests Core Web Vitals and other performance metrics
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const URLS_TO_TEST = [
  'http://localhost:3000/',
  'http://localhost:3000/docs/getting-started/what-is-mifty',
  'http://localhost:3000/docs/framework/architecture',
  'http://localhost:3000/docs/database/visual-designer',
  'http://localhost:3000/docs/commands/cli-commands',
  'http://localhost:3000/docs/api/core-modules',
];

const PERFORMANCE_THRESHOLDS = {
  fcp: 1800, // First Contentful Paint
  lcp: 2500, // Largest Contentful Paint
  fid: 100,  // First Input Delay
  cls: 0.1,  // Cumulative Layout Shift
  ttfb: 800, // Time to First Byte
};

async function runPerformanceTest() {
  console.log('🚀 Starting performance tests...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const results = [];

  for (const url of URLS_TO_TEST) {
    console.log(`📊 Testing: ${url}`);
    
    const page = await browser.newPage();
    
    // Enable performance monitoring
    await page.setCacheEnabled(false);
    
    // Collect performance metrics
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const metrics = {};
          
          entries.forEach((entry) => {
            if (entry.entryType === 'navigation') {
              metrics.ttfb = entry.responseStart - entry.requestStart;
              metrics.domContentLoaded = entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart;
              metrics.loadComplete = entry.loadEventEnd - entry.loadEventStart;
            }
            
            if (entry.entryType === 'paint') {
              if (entry.name === 'first-contentful-paint') {
                metrics.fcp = entry.startTime;
              }
            }
            
            if (entry.entryType === 'largest-contentful-paint') {
              metrics.lcp = entry.startTime;
            }
            
            if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
              metrics.cls = (metrics.cls || 0) + entry.value;
            }
            
            if (entry.entryType === 'first-input') {
              metrics.fid = entry.processingStart - entry.startTime;
            }
          });
          
          resolve(metrics);
        });
        
        observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint', 'layout-shift', 'first-input'] });
        
        // Fallback timeout
        setTimeout(() => resolve({}), 10000);
      });
    });

    await page.goto(url, { waitUntil: 'networkidle0' });
    
    // Wait for metrics to be collected
    await page.waitForTimeout(2000);
    
    const finalMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');
      
      const result = {
        ttfb: navigation ? navigation.responseStart - navigation.requestStart : null,
        domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart : null,
        loadComplete: navigation ? navigation.loadEventEnd - navigation.loadEventStart : null,
      };
      
      paint.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          result.fcp = entry.startTime;
        }
      });
      
      return result;
    });

    // Get additional metrics
    const performanceMetrics = await page.metrics();
    
    const result = {
      url,
      timestamp: new Date().toISOString(),
      metrics: {
        ...finalMetrics,
        ...performanceMetrics,
      },
      thresholds: PERFORMANCE_THRESHOLDS,
      passed: checkThresholds(finalMetrics),
    };
    
    results.push(result);
    
    console.log(`  ✅ FCP: ${finalMetrics.fcp ? Math.round(finalMetrics.fcp) + 'ms' : 'N/A'}`);
    console.log(`  ✅ TTFB: ${finalMetrics.ttfb ? Math.round(finalMetrics.ttfb) + 'ms' : 'N/A'}`);
    console.log(`  ✅ Load: ${finalMetrics.loadComplete ? Math.round(finalMetrics.loadComplete) + 'ms' : 'N/A'}`);
    
    await page.close();
  }

  await browser.close();

  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests: results.length,
      passed: results.filter(r => r.passed).length,
      failed: results.filter(r => !r.passed).length,
    },
    results,
    thresholds: PERFORMANCE_THRESHOLDS,
  };

  // Save report
  const reportPath = path.join(__dirname, '..', 'performance-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log('\n📋 Performance Test Summary:');
  console.log(`  Total tests: ${report.summary.totalTests}`);
  console.log(`  Passed: ${report.summary.passed}`);
  console.log(`  Failed: ${report.summary.failed}`);
  console.log(`  Report saved: ${reportPath}`);

  // Exit with error code if any tests failed
  if (report.summary.failed > 0) {
    console.log('\n❌ Some performance tests failed!');
    process.exit(1);
  } else {
    console.log('\n✅ All performance tests passed!');
  }
}

function checkThresholds(metrics) {
  const checks = {
    fcp: metrics.fcp ? metrics.fcp <= PERFORMANCE_THRESHOLDS.fcp : true,
    ttfb: metrics.ttfb ? metrics.ttfb <= PERFORMANCE_THRESHOLDS.ttfb : true,
  };
  
  return Object.values(checks).every(Boolean);
}

// Run the test
runPerformanceTest().catch((error) => {
  console.error('❌ Performance test failed:', error);
  process.exit(1);
});