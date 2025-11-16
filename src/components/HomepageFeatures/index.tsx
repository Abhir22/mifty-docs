import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Visual Database Designer',
    Svg: require('@site/static/img/database-icon.svg').default,
    description: (
      <>
        Design your database schema with an intuitive drag-and-drop interface.
        Create tables, relationships, and constraints visually without writing SQL.
      </>
    ),
  },
  {
    title: 'Auto Code Generation',
    Svg: require('@site/static/img/code-generation-icon.svg').default,
    description: (
      <>
        Generate complete CRUD modules, API routes, tests, and documentation
        automatically from your database schema. Save hours of boilerplate coding.
      </>
    ),
  },
  {
    title: 'Clean Architecture',
    Svg: require('@site/static/img/architecture-icon.svg').default,
    description: (
      <>
        Built on clean architecture principles with dependency injection,
        layered structure, and separation of concerns for maintainable code.
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}