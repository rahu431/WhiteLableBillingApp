'use client';

import { useInvoice } from '@/hooks/use-invoice';
import { products } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function ProductGrid() {
  const { addItem } = useInvoice();

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product) => (
        <Card key={product.id} className="flex flex-col overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex-row items-center justify-between p-4">
            <CardTitle className="text-base font-semibold">{product.name}</CardTitle>
            <product.icon className="w-6 h-6 text-primary" />
          </CardHeader>
          <CardContent className="flex-grow flex items-end justify-between p-4 pt-0">
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
