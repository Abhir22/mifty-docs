import React from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
}

/**
 * Optimized image component with accessibility and performance features
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  loading = 'lazy',
  priority = false,
}: OptimizedImageProps): JSX.Element {
  const imageProps = {
    src,
    alt,
    className: `optimized-image ${className}`.trim(),
    loading: priority ? 'eager' : loading,
    decoding: 'async' as const,
    ...(width && { width }),
    ...(height && { height }),
  };

  return (
    <img
      {...imageProps}
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        console.warn(`Failed to load image: ${src}`);
      }}
    />
  );
}