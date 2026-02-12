'use client';

import React, { useState, useEffect, memo } from 'react';
import Image, { type ImageProps } from 'next/image';
import { Coffee } from 'lucide-react';
import { cn } from '@/lib/utils';

// We need alt for the Image component, and it's good for accessibility.
interface ProductImageProps extends Omit<ImageProps, 'src' | 'onError'> {
  src: string;
  alt: string;
}

const ProductImage: React.FC<ProductImageProps> = memo(({ src, alt, className, ...props }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Reset error state if the image src changes
    setHasError(false);
  }, [src]);

  // If the src is invalid or has failed to load, show the fallback.
  if (hasError || !src) {
    return (
      <div className={cn("flex items-center justify-center bg-muted", className)}>
        <Coffee className="w-1/3 h-1/3 text-muted-foreground" />
      </div>
    );
  }

  // Otherwise, attempt to render the image.
  return (
    <Image
      {...props}
      alt={alt}
      className={className}
      src={src}
      onError={() => {
        setHasError(true);
      }}
    />
  );
});
ProductImage.displayName = 'ProductImage';

export default ProductImage;
