import React from 'react';
import styles from './styles.module.css';

type ServiceStatus = 'running' | 'stopped' | 'error' | 'starting';

interface ServiceProps {
  name: string;
  url?: string;
  description: string;
  status: ServiceStatus;
  port?: number;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
  }>;
}

interface ServiceTableProps {
  children: React.ReactNode;
  title?: string;
}

const statusConfig = {
  running: {
    color: '#10b981',
    bgColor: '#d1fae5',
    darkBgColor: '#064e3b',
    icon: '●',
    label: 'Running'
  },
  stopped: {
    color: '#6b7280',
    bgColor: '#f3f4f6',
    darkBgColor: '#374151',
    icon: '●',
    label: 'Stopped'
  },
  error: {
    color: '#ef4444',
    bgColor: '#fee2e2',
    darkBgColor: '#7f1d1d',
    icon: '●',
    label: 'Error'
  },
  starting: {
    color: '#f59e0b',
    bgColor: '#fef3c7',
    darkBgColor: '#78350f',
    icon: '●',
    label: 'Starting'
  }
};

export function Service({ name, url, description, status, port, actions }: ServiceProps) {
  const statusInfo = statusConfig[status];
  
  const handleUrlClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <tr className={styles.serviceRow}>
      <td className={styles.nameCell}>
        <div className={styles.nameContainer}>
          <strong className={styles.serviceName}>{name}</strong>
          {port && <span className={styles.port}>:{port}</span>}
        </div>
      </td>
      <td className={styles.statusCell}>
        <div 
          className={styles.statusBadge}
          style={{
            color: statusInfo.color,
            backgroundColor: statusInfo.bgColor
          }}
        >
          <span className={styles.statusIcon}>{statusInfo.icon}</span>
          {statusInfo.label}
        </div>
      </td>
      <td className={styles.urlCell}>
        {url ? (
          <button
            className={styles.urlButton}
            onClick={() => handleUrlClick(url)}
            title={`Open ${url}`}
          >
            {url}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className={styles.externalIcon}>
              <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
            </svg>
          </button>
        ) : (
          <span className={styles.noUrl}>—</span>
        )}
      </td>
      <td className={styles.descriptionCell}>
        {description}
      </td>
      {actions && actions.length > 0 && (
        <td className={styles.actionsCell}>
          <div className={styles.actionsContainer}>
            {actions.map((action, index) => (
              <button
                key={index}
                className={`${styles.actionButton} ${styles[`action${action.variant || 'primary'}`]}`}
                onClick={action.onClick}
              >
                {action.label}
              </button>
            ))}
          </div>
        </td>
      )}
    </tr>
  );
}

export default function ServiceTable({ children, title }: ServiceTableProps) {
  // Check if any service has actions to determine if we need the column
  const hasActions = React.Children.toArray(children).some((child) => {
    if (React.isValidElement(child) && child.props.actions && child.props.actions.length > 0) {
      return true;
    }
    return false;
  });

  return (
    <div className={styles.serviceTableContainer}>
      {title && <h3 className={styles.title}>{title}</h3>}
      <div className={styles.tableWrapper}>
        <table className={styles.serviceTable}>
          <thead>
            <tr className={styles.headerRow}>
              <th className={styles.nameHeader}>Service</th>
              <th className={styles.statusHeader}>Status</th>
              <th className={styles.urlHeader}>URL</th>
              <th className={styles.descriptionHeader}>Description</th>
              {hasActions && <th className={styles.actionsHeader}>Actions</th>}
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