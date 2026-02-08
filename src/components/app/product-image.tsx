'use client';

import { useState, useEffect } from 'react';
import Image, { type ImageProps } from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface ProductImageProps extends Omit<ImageProps, 'src' | 'onError'> {
  src: string;
}

const ProductImage: React.FC<ProductImageProps> = ({ src, ...props }) => {
  const [imgSrc, setImgSrc] = useState(src);
  
  const fallbackSrc = PlaceHolderImages.find(p => p.id === 'general-check-up')?.imageUrl || 'https://placehold.co/400x300';

  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  return (
    <Image
      {...props}
      src={imgSrc}
      onError={() => {
        setImgSrc(fallbackSrc);
      }}
    />
  );
};

export default ProductImage;
