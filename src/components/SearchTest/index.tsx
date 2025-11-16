import React, { useState, useEffect } from 'react';
import { searchClient } from 'algoliasearch/lite';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

interface SearchTestProps {
  className?: string;
}

interface TestResult {
  query: string;
  results: number;
  responseTime: number;
  success: boolean;
  error?: string;
}

export default function SearchTest({ className }: SearchTestProps): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [client, setClient] = useState<any>(null);

  const algoliaConfig = siteConfig.themeConfig.algolia;

  useEffect(() => {
    if (algoliaConfig?.appId && algoliaConfig?.apiKey) {
      const searchClientInstance = searchClient(algoliaConfig.appId, algoliaConfig.apiKey);
      setClient(searchClientInstance);
    }
  }, [algoliaConfig]);

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

  const runSearchTest = async (query: string): Promise<TestResult> => {
    const startTime = Date.now();
    
    try {
      if (!client) {
        throw new Error('Search client not initialized');
      }

      const index = client.initIndex(algoliaConfig.indexName);
      const response = await index.search(query, {
        ...algoliaConfig.searchParameters,
        hitsPerPage: 5,
      });

      const responseTime = Date.now() - startTime;

      return {
        query,
        results: response.hits.length,
        responseTime,
        success: true,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        query,
        results: 0,
        responseTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    const results: TestResult[] = [];
    
    for (const query of testQueries) {
      const result = await runSearchTest(query);
      results.push(result);
      setTestResults([...results]);
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setIsRunning(false);
  };

  const getTestSummary = () => {
    if (testResults.length === 0) return null;

    const successful = testResults.filter(r => r.success).length;
    const totalResults = testResults.reduce((sum, r) => sum + r.results, 0);
    const avgResponseTime = testResults.reduce((sum, r) => sum + r.responseTime, 0) / testResults.length;

    return {
      successful,
      total: testResults.length,
      totalResults,
      avgResponseTime: Math.round(avgResponseTime),
    };
  };

  const summary = getTestSummary();

  if (process.env.NODE_ENV !== 'development') {
    return null; // Only show in development
  }

  return (
    <div className={`search-test ${className || ''}`}>
      <div className="search-test-header">
        <h3>Search Functionality Test</h3>
        <button 
          onClick={runAllTests} 
          disabled={isRunning || !client}
          className="button button--primary"
        >
          {isRunning ? 'Running Tests...' : 'Run Search Tests'}
        </button>
      </div>

      {summary && (
        <div className="search-test-summary">
          <h4>Test Summary</h4>
          <ul>
            <li>Success Rate: {summary.successful}/{summary.total} ({Math.round((summary.successful / summary.total) * 100)}%)</li>
            <li>Total Results Found: {summary.totalResults}</li>
            <li>Average Response Time: {summary.avgResponseTime}ms</li>
          </ul>
        </div>
      )}

      {testResults.length > 0 && (
        <div className="search-test-results">
          <h4>Test Results</h4>
          <table>
            <thead>
              <tr>
                <th>Query</th>
                <th>Results</th>
                <th>Response Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {testResults.map((result, index) => (
                <tr key={index} className={result.success ? 'success' : 'error'}>
                  <td>{result.query}</td>
                  <td>{result.results}</td>
                  <td>{result.responseTime}ms</td>
                  <td>
                    {result.success ? '✅ Success' : `❌ ${result.error}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style jsx>{`
        .search-test {
          margin: 20px 0;
          padding: 20px;
          border: 1px solid var(--ifm-color-emphasis-300);
          border-radius: 8px;
          background: var(--ifm-color-emphasis-100);
        }

        .search-test-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .search-test-summary {
          margin-bottom: 15px;
          padding: 10px;
          background: var(--ifm-color-emphasis-200);
          border-radius: 4px;
        }

        .search-test-results table {
          width: 100%;
          border-collapse: collapse;
        }

        .search-test-results th,
        .search-test-results td {
          padding: 8px 12px;
          text-align: left;
          border-bottom: 1px solid var(--ifm-color-emphasis-300);
        }

        .search-test-results th {
          background: var(--ifm-color-emphasis-200);
          font-weight: 600;
        }

        .search-test-results tr.success {
          background: rgba(0, 255, 0, 0.1);
        }

        .search-test-results tr.error {
          background: rgba(255, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}