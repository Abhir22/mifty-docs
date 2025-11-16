import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx(styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className={styles.modernTitle}>
          {siteConfig.title}
        </Heading>
        <p className={styles.modernSubtitle}>{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className={styles.primaryButton}
            to="/docs/getting-started/what-is-mifty">
            Get Started - 5min ⏱️
          </Link>
          <Link
            className={styles.secondaryButton}
            to="/docs/getting-started/quick-start">
            Quick Start Guide
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} - Enterprise Node.js TypeScript Framework`}
      description="Enterprise-Grade Node.js TypeScript Framework with Visual Database Designer & Auto Code Generation">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}