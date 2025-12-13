'use client';

import Image from 'next/image';
import { useInvoice } from '@/hooks/use-invoice';
import { products } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function ProductGrid() {
  const { addItem } = useInvoice();
  
  const getImageHint = (url: string) => {
    return PlaceHolderImages.find(img => img.imageUrl === url)?.imageHint || 'product image';
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product) => (
        <Card key={product.id} className="flex flex-col overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 group">
          <div className="relative overflow-hidden">
            <Image 
              src={product.imageUrl} 
              alt={product.name} 
              width={400} 
              height={300} 
              className="object-cover w-full h-32 md:h-40 transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={getImageHint(product.imageUrl)}
            />
             <div className="absolute top-2 right-2 bg-background/80 p-2 rounded-full">
              <product.icon className="w-5 h-5 text-primary" />
            </div>
          </div>
          <CardHeader className="flex-grow p-4">
            <CardTitle className="text-base font-semibold">{product.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between p-4 pt-0">
            <p className="text-lg font-bold text-foreground">{formatCurrency(product.price)}</p>
            <Button size="icon" variant="outline" onClick={() => addItem(product)} aria-label={`Add ${product.name} to invoice`}>
              <Plus className="w-5 h-5" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
