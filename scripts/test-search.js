#!/usr/bin/env node

const { searchClient } = require('algoliasearch/lite');

// Configuration
const APP_ID = process.env.ALGOLIA_APP_ID || 'BH4D9OD16A';
const API_KEY = process.env.ALGOLIA_SEARCH_API_KEY || '3c6db5c24d0e6ad9c2f49d7a4c5b8e9f';
const INDEX_NAME = 'mifty-docs';

// Test queries
const testQueries = [
  'installation',
  'getting started',
  'database',
  'CLI commands',
  'adapters',
  'authentication',
  'API reference',
  'troubleshooting',
  'mifty init',
  'visual designer',
];

async function testSearch() {
  console.log('🔍 Testing Algolia DocSearch functionality...\n');
  
  try {
    const client = searchClient(APP_ID, API_KEY);
    const index = client.initIndex(INDEX_NAME);
    
    let totalResults = 0;
    let successfulQueries = 0;
    const results = [];
    
    for (const query of testQueries) {
      const startTime = Date.now();
      
      try {
        const response = await index.search(query, {
          hitsPerPage: 5,
          attributesToRetrieve: ['hierarchy', 'content', 'url'],
          attributesToHighlight: ['hierarchy', 'content'],
        });
        
        const responseTime = Date.now() - startTime;
        const hitCount = response.hits.length;
        
        totalResults += hitCount;
        successfulQueries++;
        
        results.push({
          query,
          hits: hitCount,
          responseTime,
          success: true,
        });
        
        console.log(`✅ "${query}": ${hitCount} results (${responseTime}ms)`);
        
      } catch (error) {
        const responseTime = Date.now() - startTime;
        results.push({
          query,
          hits: 0,
          responseTime,
          success: false,
          error: error.message,
        });
        
        console.log(`❌ "${query}": Error - ${error.message} (${responseTime}ms)`);
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Summary
    console.log('\n📊 Test Summary:');
    console.log(`Success Rate: ${successfulQueries}/${testQueries.length} (${Math.round((successfulQueries / testQueries.length) * 100)}%)`);
    console.log(`Total Results: ${totalResults}`);
    console.log(`Average Response Time: ${Math.round(results.reduce((sum, r) => sum + r.responseTime, 0) / results.length)}ms`);
    
    // Check index statistics
    try {
      const stats = await index.getSettings();
      console.log('\n🔧 Index Configuration:');
      console.log(`Searchable Attributes: ${stats.searchableAttributes?.length || 0}`);
      console.log(`Facets: ${stats.attributesForFaceting?.length || 0}`);
      console.log(`Custom Ranking: ${stats.customRanking?.length || 0} rules`);
    } catch (error) {
      console.log('\n⚠️  Could not retrieve index statistics');
    }
    
    if (successfulQueries === testQueries.length) {
      console.log('\n🎉 All search tests passed!');
      process.exit(0);
    } else {
      console.log('\n⚠️  Some search tests failed. Check configuration.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Search test failed:', error.message);
    console.error('\n💡 Make sure your Algolia credentials are correct and the index exists.');
    process.exit(1);
  }
}

// Run the test
testSearch();