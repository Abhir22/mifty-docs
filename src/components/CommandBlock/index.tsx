import React, { useState } from 'react';
import styles from './styles.module.css';

interface CommandBlockProps {
  command: string;
  description?: string;
  language?: string;
}

export default function CommandBlock({ command, description, language = 'bash' }: CommandBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy command:', err);
    }
  };

  return (
    <div className={styles.commandBlock}>
      {description && (
        <div className={styles.description}>
          {description}
        </div>
      )}
      <div className={styles.commandContainer}>
        <pre className={styles.command}>
          <code className={`language-${language}`}>
            {command}
          </code>
        </pre>
        <button
          className={styles.copyButton}
          onClick={handleCopy}
          title="Copy to clipboard"
          aria-label="Copy command to clipboard"
        >
          {copied ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}