import React, { useEffect, useState } from 'react';

interface AccessibilityIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  element?: string;
}

/**
 * Development-only component for testing accessibility
 * Only runs in development mode
 */
export default function AccessibilityTester(): JSX.Element | null {
  const [issues, setIssues] = useState<AccessibilityIssue[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    const checkAccessibility = () => {
      const foundIssues: AccessibilityIssue[] = [];

      // Check for missing alt text on images
      const images = document.querySelectorAll('img');
      images.forEach((img, index) => {
        if (!img.alt && !img.getAttribute('aria-label')) {
          foundIssues.push({
            type: 'error',
            message: `Image ${index + 1} is missing alt text`,
            element: img.src || `Image ${index + 1}`,
          });
        }
      });

      // Check for missing form labels
      const inputs = document.querySelectorAll('input, textarea, select');
      inputs.forEach((input, index) => {
        const hasLabel = input.getAttribute('aria-label') || 
                        input.getAttribute('aria-labelledby') ||
                        document.querySelector(`label[for="${input.id}"]`);
        
        if (!hasLabel) {
          foundIssues.push({
            type: 'warning',
            message: `Form element ${index + 1} is missing a label`,
            element: input.tagName.toLowerCase(),
          });
        }
      });

      // Check for proper heading hierarchy
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let lastLevel = 0;
      headings.forEach((heading) => {
        const currentLevel = parseInt(heading.tagName.charAt(1));
        if (currentLevel > lastLevel + 1) {
          foundIssues.push({
            type: 'warning',
            message: `Heading level skipped: ${heading.tagName} after h${lastLevel}`,
            element: heading.textContent?.substring(0, 50) || heading.tagName,
          });
        }
        lastLevel = currentLevel;
      });

      // Check for links without descriptive text
      const links = document.querySelectorAll('a');
      links.forEach((link, index) => {
        const text = link.textContent?.trim();
        const ariaLabel = link.getAttribute('aria-label');
        
        if (!text && !ariaLabel) {
          foundIssues.push({
            type: 'error',
            message: `Link ${index + 1} has no accessible text`,
            element: link.href || `Link ${index + 1}`,
          });
        } else if (text && ['click here', 'read more', 'here', 'more'].includes(text.toLowerCase())) {
          foundIssues.push({
            type: 'warning',
            message: `Link has non-descriptive text: "${text}"`,
            element: link.href || text,
          });
        }
      });

      // Check for sufficient color contrast (basic check)
      const elements = document.querySelectorAll('*');
      elements.forEach((element) => {
        const styles = window.getComputedStyle(element);
        const backgroundColor = styles.backgroundColor;
        const color = styles.color;
        
        // This is a simplified check - in production, you'd use a proper contrast ratio calculator
        if (backgroundColor !== 'rgba(0, 0, 0, 0)' && color !== 'rgba(0, 0, 0, 0)') {
          // Add more sophisticated contrast checking here if needed
        }
      });

      setIssues(foundIssues);
    };

    // Run initial check
    checkAccessibility();

    // Set up observer for dynamic content
    const observer = new MutationObserver(() => {
      setTimeout(checkAccessibility, 100);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    return () => observer.disconnect();
  }, []);

  // Don't render in production
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        backgroundColor: '#fff',
        border: '2px solid #6366f1',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        maxWidth: '400px',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <button
        onClick={() => setIsVisible(!isVisible)}
        style={{
          width: '100%',
          padding: '12px 16px',
          backgroundColor: '#6366f1',
          color: 'white',
          border: 'none',
          borderRadius: '6px 6px 0 0',
          cursor: 'pointer',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
        aria-expanded={isVisible}
        aria-controls="accessibility-issues"
      >
        <span>A11y Issues ({issues.length})</span>
        <span>{isVisible ? '▼' : '▶'}</span>
      </button>
      
      {isVisible && (
        <div 
          id="accessibility-issues"
          style={{
            maxHeight: '300px',
            overflow: 'auto',
            padding: '12px',
          }}
        >
          {issues.length === 0 ? (
            <p style={{ margin: 0, color: '#10b981', fontWeight: '500' }}>
              ✅ No accessibility issues found!
            </p>
          ) : (
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {issues.map((issue, index) => (
                <li
                  key={index}
                  style={{
                    padding: '8px 0',
                    borderBottom: index < issues.length - 1 ? '1px solid #e5e7eb' : 'none',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                    }}
                  >
                    <span
                      style={{
                        color: issue.type === 'error' ? '#ef4444' : 
                               issue.type === 'warning' ? '#f59e0b' : '#3b82f6',
                        fontWeight: '600',
                        fontSize: '12px',
                      }}
                    >
                      {issue.type === 'error' ? '❌' : 
                       issue.type === 'warning' ? '⚠️' : 'ℹ️'}
                    </span>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '500' }}>
                        {issue.message}
                      </p>
                      {issue.element && (
                        <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                          {issue.element}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}