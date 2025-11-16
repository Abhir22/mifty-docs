import React from 'react';
import SkipToMain from '../components/SkipToMain';
import AccessibilityTester from '../components/AccessibilityTester';
import PerformanceMonitor from '../components/PerformanceMonitor';
import Analytics from '../components/Analytics';

// Wrap the entire app to add accessibility features
export default function Root({children}: {children: React.ReactNode}): JSX.Element {
  return (
    <>
      <SkipToMain />
      <Analytics />
      {children}
      <AccessibilityTester />
      <PerformanceMonitor />
    </>
  );
}