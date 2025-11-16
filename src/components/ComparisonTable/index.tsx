import React from 'react';
import styles from './styles.module.css';

interface ComparisonRowProps {
  feature: string;
  traditional: string;
  mifty: string;
  timeSaved?: string;
}

interface ComparisonTableProps {
  children: React.ReactNode;
  title?: string;
}

export function ComparisonRow({ feature, traditional, mifty, timeSaved }: ComparisonRowProps) {
  return (
    <tr className={styles.row}>
      <td className={styles.featureCell}>
        <strong>{feature}</strong>
      </td>
      <td className={styles.traditionalCell}>
        <div className={styles.traditionalContent}>
          <span className={styles.traditionalIcon}>❌</span>
          {traditional}
        </div>
      </td>
      <td className={styles.miftyCell}>
        <div className={styles.miftyContent}>
          <span className={styles.miftyIcon}>✅</span>
          {mifty}
        </div>
      </td>
      {timeSaved && (
        <td className={styles.timeSavedCell}>
          <div className={styles.timeSavedBadge}>
            <span className={styles.timeSavedIcon}>⚡</span>
            {timeSaved}
          </div>
        </td>
      )}
    </tr>
  );
}

export default function ComparisonTable({ children, title }: ComparisonTableProps) {
  // Check if any row has timeSaved to determine if we need the column
  const hasTimeSaved = React.Children.toArray(children).some((child) => {
    if (React.isValidElement(child) && child.props.timeSaved) {
      return true;
    }
    return false;
  });

  return (
    <div className={styles.comparisonTableContainer}>
      {title && <h3 className={styles.title}>{title}</h3>}
      <div className={styles.tableWrapper}>
        <table className={styles.comparisonTable}>
          <thead>
            <tr className={styles.headerRow}>
              <th className={styles.featureHeader}>Feature</th>
              <th className={styles.traditionalHeader}>Traditional Approach</th>
              <th className={styles.miftyHeader}>With Mifty</th>
              {hasTimeSaved && <th className={styles.timeSavedHeader}>Time Saved</th>}
            </tr>
          </thead>
          <tbody>
            {children}
          </tbody>
        </table>
      </div>
    </div>
  );
}