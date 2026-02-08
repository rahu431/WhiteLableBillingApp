'use client';

import Image from 'next/image';
import { useInvoice } from '@/hooks/use-invoice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { placeholderImages } from '@/lib/placeholder-images.json';
import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Product } from '@/lib/types';
import { Plus } from 'lucide-react';
import { useProducts } from '@/context/product-context';
import { useSettings } from '@/context/settings-context';

export default function ProductGrid() {
  const { addItem } = useInvoice();
  const { products } = useProducts();
  const { formatCurrency } = useSettings();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);

  const groupedProducts = useMemo(() => {
    const activeProducts = products.filter(p => p.status === 'active');
    return activeProducts.reduce((acc, product) => {
        const category = product.category || 'Uncategorized';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(product);
        return acc;
    }, {} as Record<string, Product[]>);
  }, [products]);


  const getImageHint = (url: string) => {
    return placeholderImages.find(img => img.imageUrl === url)?.imageHint || 'product image';
  }

  const handleCardClick = (product: Product) => {
    setSelectedProduct(product);
    setQuantity(1);
  };

  const handleAddToCart = () => {
    if (selectedProduct) {
      addItem(selectedProduct, quantity);
      setSelectedProduct(null);
    }
  };

  const handleDialogClose = () => {
    setSelectedProduct(null);
  };

  return (
    <>
      <div className="space-y-8">
        {Object.entries(groupedProducts).map(([category, productsInCategory]) => (
          <div key={category}>
            <h2 className="text-2xl font-bold mb-4 capitalize">{category}</h2>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {productsInCategory.map((product) => (
                <Card 
                  key={product.id} 
                  className="flex flex-col overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 group cursor-pointer"
                  onClick={() => handleCardClick(product)}
                >
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
                    <Button size="icon" variant="outline" aria-label={`Add ${product.name} to invoice`}>
                      <Plus className="w-5 h-5" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!selectedProduct} onOpenChange={handleDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add {selectedProduct?.name} to Invoice</DialogTitle>
            <DialogDescription>
              How many units would you like to add?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Quantity
              </Label>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="col-span-3"
                min="1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={handleDialogClose}>Cancel</Button>
            <Button onClick={handleAddToCart}>Add to Invoice</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
