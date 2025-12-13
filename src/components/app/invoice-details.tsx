
'use client';

import { useInvoice } from '@/hooks/use-invoice';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Trash2, ShoppingBag, Share2, Minus, Plus } from 'lucide-react';
import QuantityControl from './quantity-control';
import { useToast } from '@/hooks/use-toast';
import { Input } from '../ui/input';

interface InvoiceDetailsProps {
  onShare?: () => void;
}

export default function InvoiceDetails({ onShare }: InvoiceDetailsProps) {
  const { 
    items, 
    subtotal, 
    tax, 
    packagingCharge, 
    serviceCharge, 
    totalDiscount, 
    total, 
    removeItem, 
    updateQuantity,
    updateItemPrice,
    updateItemDiscount,
    clearInvoice 
  } = useInvoice();
  const { toast } = useToast();

  const handleShare = () => {
    if (items.length === 0) {
      toast({
        title: "Cannot Share Empty Invoice",
        description: "Please add items to the invoice before sharing.",
        variant: "destructive",
      });
      return;
    }

    const itemsText = items.map(item => {
      let itemText = `- ${item.name} (x${item.quantity}): ${formatCurrency(item.price * item.quantity)}`;
      if (item.discount > 0) {
        itemText += ` (Discount: ${formatCurrency(item.discount * item.quantity)})`;
      }
      return itemText;
    }).join('\n');
    

    let summaryText = `\n--------------------\nSubtotal: ${formatCurrency(subtotal)}`;
    if (totalDiscount > 0) summaryText += `\nTotal Discount: -${formatCurrency(totalDiscount)}`;
    if (tax > 0) summaryText += `\nTax: ${formatCurrency(tax)}`;
    if (packagingCharge > 0) summaryText += `\nPackaging: ${formatCurrency(packagingCharge)}`;
    if (serviceCharge > 0) summaryText += `\nService Charge: ${formatCurrency(serviceCharge)}`;
    summaryText += `\n--------------------\n*Total: ${formatCurrency(total)}*`;
    
    const message = encodeURIComponent(`*Your Invoice*:\n\n${itemsText}\n${summaryText}`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
    if (onShare) onShare();
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-card rounded-lg shadow-inner">
        <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold">Your invoice is empty</h3>
        <p className="text-muted-foreground mt-2">Select a service to get started.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Card className="flex-grow overflow-hidden shadow-inner">
        <CardContent className="p-4 h-full overflow-y-auto">
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex flex-col gap-2 border-b pb-3">
                <div className="flex items-center">
                  <p className="font-semibold flex-grow">{item.name}</p>
                   <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} aria-label={`Remove ${item.name}`}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-2 items-center">
                   <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Qty</label>
                      <div className="flex items-center">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity - 1)}> <Minus className="h-3 w-3" /> </Button>
                        <Input 
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                            className="w-12 text-center h-8"
                         />
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity + 1)}> <Plus className="h-3 w-3" /> </Button>
                      </div>
                   </div>
                   <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Price</label>
                      <Input 
                        type="number"
                        value={item.price}
                        onChange={(e) => updateItemPrice(item.id, parseFloat(e.target.value) || 0)}
                        className="h-8"
                      />
                   </div>
                   <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Discount</label>
                      <Input
                        type="number"
                        value={item.discount}
                        onChange={(e) => updateItemDiscount(item.id, parseFloat(e.target.value) || 0)}
                        className="h-8"
                      />
                   </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-auto pt-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
           {totalDiscount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-{formatCurrency(totalDiscount)}</span>
            </div>
          )}
          {tax > 0 && (
            <div className="flex justify-between">
              <span>Tax</span>
              <span>{formatCurrency(tax)}</span>
            </div>
          )}
          {packagingCharge > 0 && (
             <div className="flex justify-between">
              <span>Packaging</span>
              <span>{formatCurrency(packagingCharge)}</span>
            </div>
          )}
          {serviceCharge > 0 && (
             <div className="flex justify-between">
              <span>Service</span>
              <span>{formatCurrency(serviceCharge)}</span>
            </div>
          )}
        </div>
        <Separator className="my-3" />
        <div className="flex justify-between items-center text-xl font-bold mb-4">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" /> Share
          </Button>
          <Button 
            className="bg-accent text-accent-foreground hover:bg-accent/90 text-base font-bold"
            onClick={() => {
              toast({ title: "Success!", description: "Invoice generated and ready for payment." });
              clearInvoice();
              if (onShare) onShare();
            }}
          >
            Generate Invoice
          </Button>
        </div>
      </div>
    </div>
  );
}
