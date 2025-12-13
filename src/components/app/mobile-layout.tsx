
'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import ProductGrid from '@/components/app/product-grid';
import InvoiceDetails from '@/components/app/invoice-details';
import { useInvoice } from '@/hooks/use-invoice';
import { formatCurrency } from '@/lib/utils';
import { ShoppingCart } from 'lucide-react';

export default function MobileLayout() {
  const [isSheetOpen, setSheetOpen] = useState(false);
  const { items, total } = useInvoice();
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  const closeSheet = () => setSheetOpen(false);

  return (
    <div className="relative min-h-screen w-full p-4 pb-28">
      <header className="mb-4">
        <h1 className="text-3xl font-bold font-headline text-primary">New Invoice</h1>
        <p className="text-muted-foreground">Select services to add them to the bill.</p>
      </header>
      <ProductGrid />
      
      {items.length > 0 && (
        <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t">
              <Button size="lg" className="w-full text-lg">
                <ShoppingCart className="mr-2" />
                View Invoice ({totalItems} {totalItems === 1 ? 'item' : 'items'})
                <span className="ml-auto font-bold">{formatCurrency(total)}</span>
              </Button>
            </div>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[90vh] flex flex-col">
            <SheetHeader>
              <SheetTitle className="text-2xl">Current Invoice</SheetTitle>
            </SheetHeader>
            <div className="flex-grow overflow-auto">
              <InvoiceDetails onShare={closeSheet} onInvoiceGenerated={closeSheet} />
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}

    