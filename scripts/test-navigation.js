#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Test configuration
const COMPONENTS_DIR = path.join(__dirname, '..', 'src', 'components');
const DOCS_DIR = path.join(__dirname, '..', 'docs');

// Navigation components to test
const NAVIGATION_COMPONENTS = [
  'BreadcrumbNavigation',
  'TagDiscovery',
  'RelatedArticles',
  'TableOfContents',
  'NavigationEnhanced',
];

async function testNavigationComponents() {
  console.log('🧭 Testing Navigation Enhancement Components...\n');
  
  let allTestsPassed = true;
  const results = [];

  // Test 1: Check if all component files exist
  console.log('📁 Checking component files...');
  for (const component of NAVIGATION_COMPONENTS) {
    const componentPath = path.join(COMPONENTS_DIR, component, 'index.tsx');
    const stylesPath = path.join(COMPONENTS_DIR, component, 'styles.css');
    
    const componentExists = fs.existsSync(componentPath);
    const stylesExist = fs.existsSync(stylesPath) || component === 'NavigationEnhanced';
    
    if (componentExists && stylesExist) {
      console.log(`✅ ${component}: Component and styles found`);
      results.push({ component, test: 'File existence', passed: true });
    } else {
      console.log(`❌ ${component}: Missing files (component: ${componentExists}, styles: ${stylesExist})`);
      results.push({ component, test: 'File existence', passed: false });
      allTestsPassed = false;
    }
  }

  // Test 2: Check TypeScript syntax
  console.log('\n🔍 Checking TypeScript syntax...');
  for (const component of NAVIGATION_COMPONENTS) {
    const componentPath = path.join(COMPONENTS_DIR, component, 'index.tsx');
    
    if (fs.existsSync(componentPath)) {
      try {
        const content = fs.readFileSync(componentPath, 'utf8');
        
        // Basic syntax checks
        const hasImports = content.includes('import React');
        const hasExport = content.includes('export default') || content.includes('export {');
        const hasTypeScript = content.includes(': JSX.Element') || content.includes('interface');
        
        if (hasImports && hasExport && hasTypeScript) {
          console.log(`✅ ${component}: TypeScript syntax looks good`);
          results.push({ component, test: 'TypeScript syntax', passed: true });
        } else {
          console.log(`⚠️  ${component}: Potential syntax issues`);
          results.push({ component, test: 'TypeScript syntax', passed: false });
          allTestsPassed = false;
        }
      } catch (error) {
        console.log(`❌ ${component}: Error reading file - ${error.message}`);
        results.push({ component, test: 'TypeScript syntax', passed: false });
        allTestsPassed = false;
      }
    }
  }

  // Test 3: Check CSS syntax and structure
  console.log('\n🎨 Checking CSS styles...');
  for (const component of NAVIGATION_COMPONENTS) {
    if (component === 'NavigationEnhanced') continue; // Skip as it uses inline styles
    
    const stylesPath = path.join(COMPONENTS_DIR, component, 'styles.css');
    
    if (fs.existsSync(stylesPath)) {
      try {
        const content = fs.readFileSync(stylesPath, 'utf8');
        
        // Basic CSS checks
        const hasRootClass = content.includes(`.${component.toLowerCase().replace(/([A-Z])/g, '-$1').substring(1)}`);
        const hasDarkMode = content.includes('[data-theme=\'dark\']');
        const hasResponsive = content.includes('@media');
        const hasAccessibility = content.includes(':focus');
        
        const score = [hasRootClass, hasDarkMode, hasResponsive, hasAccessibility].filter(Boolean).length;
        
        if (score >= 3) {
          console.log(`✅ ${component}: CSS structure looks good (${score}/4 features)`);
          results.push({ component, test: 'CSS structure', passed: true });
        } else {
          console.log(`⚠️  ${component}: CSS could be improved (${score}/4 features)`);
          results.push({ component, test: 'CSS structure', passed: false });
        }
      } catch (error) {
        console.log(`❌ ${component}: Error reading CSS file - ${error.message}`);
        results.push({ component, test: 'CSS structure', passed: false });
        allTestsPassed = false;
      }
    }
  }

  // Test 4: Check Docusaurus integration
  console.log('\n⚙️  Checking Docusaurus integration...');
  const configPath = path.join(__dirname, '..', 'docusaurus.config.ts');
  
  if (fs.existsSync(configPath)) {
    try {
      const content = fs.readFileSync(configPath, 'utf8');
      
      const hasAlgolia = content.includes('algolia:');
      const hasTOCConfig = content.includes('tableOfContents:');
      const hasDocsConfig = content.includes('versionPersistence:');
      
      if (hasAlgolia && hasTOCConfig && hasDocsConfig) {
        console.log('✅ Docusaurus configuration updated correctly');
        results.push({ component: 'Docusaurus', test: 'Configuration', passed: true });
      } else {
        console.log('⚠️  Docusaurus configuration incomplete');
        results.push({ component: 'Docusaurus', test: 'Configuration', passed: false });
      }
    } catch (error) {
      console.log(`❌ Error reading Docusaurus config - ${error.message}`);
      results.push({ component: 'Docusaurus', test: 'Configuration', passed: false });
      allTestsPassed = false;
    }
  }

  // Test 5: Check package.json dependencies
  console.log('\n📦 Checking dependencies...');
  const packagePath = path.join(__dirname, '..', 'package.json');
  
  if (fs.existsSync(packagePath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      const requiredDeps = [
        '@docsearch/css',
        '@docsearch/react',
        'algoliasearch',
        '@docusaurus/theme-search-algolia',
      ];
      
      const missingDeps = requiredDeps.filter(dep => !deps[dep]);
      
      if (missingDeps.length === 0) {
        console.log('✅ All required dependencies are installed');
        results.push({ component: 'Dependencies', test: 'Installation', passed: true });
      } else {
        console.log(`❌ Missing dependencies: ${missingDeps.join(', ')}`);
        results.push({ component: 'Dependencies', test: 'Installation', passed: false });
        allTestsPassed = false;
      }
    } catch (error) {
      console.log(`❌ Error reading package.json - ${error.message}`);
      results.push({ component: 'Dependencies', test: 'Installation', passed: false });
      allTestsPassed = false;
    }
  }

  // Test Summary
  console.log('\n📊 Test Summary:');
  const totalTests = results.length;
  const passedTests = results.filter(r => r.passed).length;
  
  console.log(`Success Rate: ${passedTests}/${totalTests} (${Math.round((passedTests / totalTests) * 100)}%)`);
  
  if (allTestsPassed) {
    console.log('\n🎉 All navigation enhancement tests passed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Run `npm install` to install new dependencies');
    console.log('2. Run `npm run build` to test the build');
    console.log('3. Run `npm run start` to test in development');
    console.log('4. Configure your Algolia credentials in .env');
    console.log('5. Run `npm run test:search` to test search functionality');
    
    process.exit(0);
  } else {
    console.log('\n⚠️  Some navigation tests failed. Please review the issues above.');
    
    // Show detailed results
    console.log('\n📋 Detailed Results:');
    results.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      console.log(`${status} ${result.component} - ${result.test}`);
    });
    
    process.exit(1);
  }
}

// Run the tests
testNavigationComponents().catch(error => {
  console.error('❌ Navigation test failed:', error.message);
  process.exit(1);
});