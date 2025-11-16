import React, { useState } from 'react';
import styles from './styles.module.css';

interface EnvVar {
  name: string;
  description: string;
  required: boolean;
  example: string;
  default?: string;
}

interface ConfigStep {
  step: number;
  title: string;
  description: string;
  code?: string;
  language?: string;
  note?: string;
}

interface TroubleshootingItem {
  problem: string;
  solution: string;
  code?: string;
}

interface AdapterGuideProps {
  name: string;
  command: string;
  description: string;
  category?: 'auth' | 'email' | 'storage' | 'payment' | 'ai' | 'messaging';
  envVars?: EnvVar[];
  configSteps?: ConfigStep[];
  examples?: Array<{
    title: string;
    description: string;
    code: string;
    language?: string;
  }>;
  troubleshooting?: TroubleshootingItem[];
}

const categoryConfig = {
  auth: {
    icon: '🔐',
    color: '#3b82f6',
    bgColor: '#dbeafe',
    darkBgColor: '#1e3a8a'
  },
  email: {
    icon: '📧',
    color: '#10b981',
    bgColor: '#d1fae5',
    darkBgColor: '#064e3b'
  },
  storage: {
    icon: '💾',
    color: '#8b5cf6',
    bgColor: '#ede9fe',
    darkBgColor: '#581c87'
  },
  payment: {
    icon: '💳',
    color: '#f59e0b',
    bgColor: '#fef3c7',
    darkBgColor: '#78350f'
  },
  ai: {
    icon: '🤖',
    color: '#ec4899',
    bgColor: '#fce7f3',
    darkBgColor: '#831843'
  },
  messaging: {
    icon: '💬',
    color: '#06b6d4',
    bgColor: '#cffafe',
    darkBgColor: '#164e63'
  }
};

export default function AdapterGuide({
  name,
  command,
  description,
  category = 'auth',
  envVars = [],
  configSteps = [],
  examples = [],
  troubleshooting = []
}: AdapterGuideProps) {
  const [activeSection, setActiveSection] = useState<'install' | 'config' | 'examples' | 'troubleshooting'>('install');
  const [copiedCommand, setCopiedCommand] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState<string | null>(null);

  const categoryInfo = categoryConfig[category];

  const handleCopyCommand = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopiedCommand(true);
      setTimeout(() => setCopiedCommand(false), 2000);
    } catch (err) {
      console.error('Failed to copy command:', err);
    }
  };

  const handleCopyEnvVar = async (envVar: string) => {
    try {
      await navigator.clipboard.writeText(envVar);
      setCopiedEnv(envVar);
      setTimeout(() => setCopiedEnv(null), 2000);
    } catch (err) {
      console.error('Failed to copy env var:', err);
    }
  };

  const generateEnvExample = () => {
    return envVars.map(env => `${env.name}=${env.example}`).join('\n');
  };

  return (
    <div className={styles.adapterGuideContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleContainer}>
          <div 
            className={styles.categoryBadge}
            style={{
              color: categoryInfo.color,
              backgroundColor: categoryInfo.bgColor
            }}
          >
            <span className={styles.categoryIcon}>{categoryInfo.icon}</span>
            {category}
          </div>
          <h2 className={styles.adapterName}>{name}</h2>
        </div>
        <p className={styles.description}>{description}</p>
      </div>

      {/* Navigation */}
      <div className={styles.navigation}>
        <button
          className={`${styles.navButton} ${activeSection === 'install' ? styles.activeNav : ''}`}
          onClick={() => setActiveSection('install')}
        >
          Installation
        </button>
        {configSteps.length > 0 && (
          <button
            className={`${styles.navButton} ${activeSection === 'config' ? styles.activeNav : ''}`}
            onClick={() => setActiveSection('config')}
          >
            Configuration
          </button>
        )}
        {examples.length > 0 && (
          <button
            className={`${styles.navButton} ${activeSection === 'examples' ? styles.activeNav : ''}`}
            onClick={() => setActiveSection('examples')}
          >
            Examples
          </button>
        )}
        {troubleshooting.length > 0 && (
          <button
            className={`${styles.navButton} ${activeSection === 'troubleshooting' ? styles.activeNav : ''}`}
            onClick={() => setActiveSection('troubleshooting')}
          >
            Troubleshooting
          </button>
        )}
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* Installation Section */}
        {activeSection === 'install' && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Installation</h3>
            <div className={styles.commandBlock}>
              <pre className={styles.command}>
                <code>{command}</code>
              </pre>
              <button
                className={styles.copyButton}
                onClick={handleCopyCommand}
                title="Copy command"
              >
                {copiedCommand ? '✓' : '📋'}
              </button>
            </div>

            {envVars.length > 0 && (
              <>
                <h4 className={styles.subsectionTitle}>Environment Variables</h4>
                <div className={styles.envVarsContainer}>
                  {envVars.map((envVar, index) => (
                    <div key={index} className={styles.envVar}>
                      <div className={styles.envVarHeader}>
                        <code className={styles.envVarName}>{envVar.name}</code>
                        {envVar.required && <span className={styles.requiredBadge}>Required</span>}
                        <button
                          className={styles.copyEnvButton}
                          onClick={() => handleCopyEnvVar(`${envVar.name}=${envVar.example}`)}
                          title="Copy environment variable"
                        >
                          {copiedEnv === `${envVar.name}=${envVar.example}` ? '✓' : '📋'}
                        </button>
                      </div>
                      <p className={styles.envVarDescription}>{envVar.description}</p>
                      <div className={styles.envVarExample}>
                        <strong>Example:</strong> <code>{envVar.example}</code>
                        {envVar.default && (
                          <span className={styles.defaultValue}>
                            (Default: <code>{envVar.default}</code>)
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.envFileExample}>
                  <h5 className={styles.envFileTitle}>Complete .env example:</h5>
                  <pre className={styles.envFileCode}>
                    <code>{generateEnvExample()}</code>
                  </pre>
                  <button
                    className={styles.copyButton}
                    onClick={() => handleCopyEnvVar(generateEnvExample())}
                    title="Copy all environment variables"
                  >
                    {copiedEnv === generateEnvExample() ? '✓' : '📋'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Configuration Section */}
        {activeSection === 'config' && configSteps.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Configuration Steps</h3>
            <div className={styles.configSteps}>
              {configSteps.map((step, index) => (
                <div key={index} className={styles.configStep}>
                  <div className={styles.stepHeader}>
                    <span className={styles.stepNumber}>{step.step}</span>
                    <h4 className={styles.stepTitle}>{step.title}</h4>
                  </div>
                  <p className={styles.stepDescription}>{step.description}</p>
                  {step.code && (
                    <pre className={styles.stepCode}>
                      <code className={`language-${step.language || 'text'}`}>
                        {step.code}
                      </code>
                    </pre>
                  )}
                  {step.note && (
                    <div className={styles.stepNote}>
                      <strong>Note:</strong> {step.note}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Examples Section */}
        {activeSection === 'examples' && examples.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Usage Examples</h3>
            <div className={styles.examples}>
              {examples.map((example, index) => (
                <div key={index} className={styles.example}>
                  <h4 className={styles.exampleTitle}>{example.title}</h4>
                  <p className={styles.exampleDescription}>{example.description}</p>
                  <pre className={styles.exampleCode}>
                    <code className={`language-${example.language || 'typescript'}`}>
                      {example.code}
                    </code>
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Troubleshooting Section */}
        {activeSection === 'troubleshooting' && troubleshooting.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Troubleshooting</h3>
            <div className={styles.troubleshooting}>
              {troubleshooting.map((item, index) => (
                <div key={index} className={styles.troubleshootingItem}>
                  <h4 className={styles.problemTitle}>Problem: {item.problem}</h4>
                  <div className={styles.solution}>
                    <strong>Solution:</strong> {item.solution}
                  </div>
                  {item.code && (
                    <pre className={styles.solutionCode}>
                      <code>{item.code}</code>
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}