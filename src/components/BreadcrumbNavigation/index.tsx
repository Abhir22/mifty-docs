import React from 'react';
import { useLocation } from '@docusaurus/router';
import Link from '@docusaurus/Link';
import { translate } from '@docusaurus/Translate';
import { useSidebarBreadcrumbs, useDocsSidebar } from '@docusaurus/theme-common/internal';
import type { Props } from '@theme/DocBreadcrumbs';

import './styles.css';

interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

export default function BreadcrumbNavigation(): JSX.Element | null {
  const location = useLocation();
  const breadcrumbs = useSidebarBreadcrumbs();
  
  if (!breadcrumbs || breadcrumbs.length <= 1) {
    return null;
  }

  const breadcrumbItems: BreadcrumbItem[] = breadcrumbs.map((item, index) => ({
    label: item.label,
    href: item.href,
    isActive: index === breadcrumbs.length - 1,
  }));

  // Add home breadcrumb
  const homeBreadcrumb: BreadcrumbItem = {
    label: translate({
      id: 'theme.docs.breadcrumbs.home',
      message: 'Home',
      description: 'The ARIA label for the home page in the breadcrumbs',
    }),
    href: '/',
  };

  const allBreadcrumbs = [homeBreadcrumb, ...breadcrumbItems];

  return (
    <nav className="breadcrumb-navigation" aria-label="Breadcrumb">
      <ol className="breadcrumb-list">
        {allBreadcrumbs.map((item, index) => (
          <li key={index} className="breadcrumb-item">
            {item.isActive ? (
              <span className="breadcrumb-current" aria-current="page">
                {item.label}
              </span>
            ) : (
              <>
                <Link
                  to={item.href!}
                  className="breadcrumb-link"
                  itemProp="item"
                >
                  <span itemProp="name">{item.label}</span>
                </Link>
                {index < allBreadcrumbs.length - 1 && (
                  <span className="breadcrumb-separator" aria-hidden="true">
                    /
                  </span>
                )}
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}