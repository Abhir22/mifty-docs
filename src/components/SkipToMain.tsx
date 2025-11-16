import React from 'react';

/**
 * Skip to main content link for accessibility
 * Allows keyboard users to skip navigation and go directly to main content
 */
export default function SkipToMain(): JSX.Element {
  return (
    <a 
      href="#main-content" 
      className="skip-to-main"
      aria-label="Skip to main content"
    >
      Skip to main content
    </a>
  );
}