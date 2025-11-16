import React, { useState, useEffect } from 'react';
import styles from './styles.module.css';

interface CodeTabProps {
  label: string;
  language?: string;
  children: React.ReactNode;
}

interface CodeTabsProps {
  children: React.ReactElement<CodeTabProps>[];
  defaultTab?: string;
  groupId?: string;
}

export function CodeTab({ children }: CodeTabProps) {
  return <>{children}</>;
}

export default function CodeTabs({ children, defaultTab, groupId }: CodeTabsProps) {
  const tabs = React.Children.toArray(children) as React.ReactElement<CodeTabProps>[];
  const [activeTab, setActiveTab] = useState(() => {
    // Try to restore from localStorage if groupId is provided
    if (groupId && typeof window !== 'undefined') {
      const saved = localStorage.getItem(`codeTabs-${groupId}`);
      if (saved && tabs.some(tab => tab.props.label === saved)) {
        return saved;
      }
    }
    // Use defaultTab or first tab
    return defaultTab || tabs[0]?.props.label || '';
  });

  useEffect(() => {
    // Save to localStorage if groupId is provided
    if (groupId && typeof window !== 'undefined') {
      localStorage.setItem(`codeTabs-${groupId}`, activeTab);
    }
  }, [activeTab, groupId]);

  const handleTabClick = (tabLabel: string) => {
    setActiveTab(tabLabel);
  };

  const activeTabData = tabs.find(tab => tab.props.label === activeTab) || tabs[0];

  return (
    <div className={styles.codeTabsContainer}>
      <div className={styles.tabsHeader}>
        {tabs.map((tab) => (
          <button
            key={tab.props.label}
            className={`${styles.tabButton} ${
              activeTab === tab.props.label ? styles.activeTab : ''
            }`}
            onClick={() => handleTabClick(tab.props.label)}
            type="button"
          >
            {tab.props.label}
          </button>
        ))}
      </div>
      <div className={styles.tabContent}>
        <div className={styles.codeContainer}>
          {activeTabData && (
            <pre className={styles.codeBlock}>
              <code className={`language-${activeTabData.props.language || 'text'}`}>
                {typeof activeTabData.props.children === 'string' 
                  ? activeTabData.props.children.trim()
                  : activeTabData.props.children
                }
              </code>
            </pre>
          )}
        </div>
        <button
          className={styles.copyButton}
          onClick={() => {
            if (activeTabData && typeof activeTabData.props.children === 'string') {
              navigator.clipboard.writeText(activeTabData.props.children.trim());
            }
          }}
          title="Copy to clipboard"
          aria-label="Copy code to clipboard"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}