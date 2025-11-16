import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import SEOHead from '@site/src/components/SEOHead';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  return (
    <header className={clsx(styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className={styles.modernTitle}>
          Mifty Framework - Modern Node.js TypeScript Framework
        </Heading>
        <p className={styles.modernSubtitle}>
          Build scalable modular backend applications with our enterprise-grade Node.js framework. 
          Features visual database designer, auto code generation, and Prisma integration for rapid development.
        </p>
        <div className={styles.buttons}>
          <Link
            className={styles.primaryButton}
            to="/docs/getting-started/what-is-mifty"
            aria-label="Get started with Mifty Framework - Learn Node.js modular architecture">
            Get Started with Mifty Framework - 5min ⏱️
          </Link>
          <Link
            className={styles.secondaryButton}
            to="/docs/getting-started/quick-start"
            aria-label="Quick start guide for Node.js TypeScript framework">
            Quick Start Guide
          </Link>
        </div>
        <div className={styles.keywordSection}>
          <p className={styles.keywordText}>
            Perfect for developers seeking a <Link to="/docs/framework/architecture" aria-label="Learn about modular architecture in Node.js">modular architecture</Link> solution, 
            <Link to="/docs/getting-started/what-is-mifty" aria-label="Enterprise Node.js framework features"> enterprise Node.js development</Link>, and 
            <Link to="/docs/framework/code-generation" aria-label="Node.js CLI tools and code generation"> automated code generation</Link> tools.
          </p>
        </div>
      </div>
    </header>
  );
}

function HomepageContent() {
  return (
    <section className={styles.contentSection}>
      <div className="container">
        <div className="row">
          <div className="col col--8 col--offset-2">
            <Heading as="h2" className={styles.sectionTitle}>
              Why Choose Mifty for Node.js Backend Development?
            </Heading>
            <p className={styles.sectionDescription}>
              Mifty Framework revolutionizes Node.js backend development with its comprehensive toolkit for building 
              scalable, maintainable applications. Our TypeScript-first approach ensures type safety while our 
              modular architecture promotes clean code organization.
            </p>
            
            <div className="row margin-top--lg">
              <div className="col col--6">
                <Heading as="h3" className={styles.featureTitle}>
                  Enterprise-Grade Node.js Framework
                </Heading>
                <p>
                  Built for production environments, Mifty provides robust <Link to="/docs/framework/architecture" aria-label="Learn about clean architecture in Node.js">clean architecture</Link>, 
                  comprehensive error handling, and <Link to="/docs/framework/testing" aria-label="Node.js testing strategies and best practices">testing utilities</Link> that enterprise teams need.
                </p>
              </div>
              <div className="col col--6">
                <Heading as="h3" className={styles.featureTitle}>
                  Modular Architecture for Scalability
                </Heading>
                <p>
                  Our <Link to="/docs/framework/project-structure" aria-label="Understanding modular architecture in Node.js applications">modular architecture approach</Link> lets you organize code into 
                  reusable modules, making your Node.js applications more maintainable and scalable as they grow.
                </p>
              </div>
            </div>

            <div className="row margin-top--lg">
              <div className="col col--6">
                <Heading as="h3" className={styles.featureTitle}>
                  TypeScript Backend Framework
                </Heading>
                <p>
                  Leverage the power of TypeScript in your backend development. Mifty provides comprehensive 
                  <Link to="/docs/api/core-modules" aria-label="TypeScript types and interfaces for Node.js development"> TypeScript support</Link> with 
                  auto-generated types and interfaces for your database models.
                </p>
              </div>
              <div className="col col--6">
                <Heading as="h3" className={styles.featureTitle}>
                  Prisma Integration & Database Tools
                </Heading>
                <p>
                  Seamlessly integrate with <Link to="/docs/database/configuration" aria-label="Prisma ORM integration with Node.js framework">Prisma ORM</Link> for 
                  type-safe database operations. Our visual database designer makes schema management intuitive and efficient.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home(): React.JSX.Element {
  
  // SEO-optimized metadata for homepage
  const homepageKeywords = [
    'mifty framework',
    'nodejs framework',
    'typescript backend framework',
    'modular architecture',
    'nodejs modular framework',
    'enterprise nodejs framework',
    'prisma nodejs framework',
    'nodejs clean architecture',
    'backend framework typescript',
    'scalable nodejs framework',
    'nodejs cli tools',
    'auto code generation nodejs'
  ];

  return (
    <Layout>
      <SEOHead
        title="Mifty Framework - Node.js TypeScript Framework"
        description="Build scalable modular backend applications with Mifty Framework. Enterprise-grade Node.js TypeScript framework with visual database designer."
        keywords={homepageKeywords}
        type="website"
        url="https://mifty.dev"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'Mifty Framework',
          description: 'Enterprise-Grade Node.js TypeScript Framework with Visual Database Designer & Auto Code Generation for building scalable modular backend applications',
          applicationCategory: 'DeveloperApplication',
          operatingSystem: 'Cross-platform',
          programmingLanguage: ['TypeScript', 'JavaScript'],
          runtimePlatform: 'Node.js',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD'
          },
          author: {
            '@type': 'Organization',
            name: 'Mifty Framework Team',
            url: 'https://mifty.dev'
          },
          url: 'https://mifty.dev',
          downloadUrl: 'https://www.npmjs.com/package/@mifty/cli',
          softwareVersion: 'latest',
          featureList: [
            'Visual Database Designer',
            'Auto Code Generation',
            'Modular Architecture',
            'TypeScript Support',
            'Prisma Integration',
            'CLI Tools',
            'Enterprise-Grade Framework',
            'Clean Architecture',
            'Dependency Injection'
          ],
          screenshot: 'https://mifty.dev/img/logo.png',
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '5.0',
            ratingCount: '1'
          }
        }}
      />
      <HomepageHeader />
      <main>
        <HomepageContent />
        <HomepageFeatures />
      </main>
    </Layout>
  );
}