
'use client';

import { useInvoice } from '@/hooks/use-invoice';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Trash2, ShoppingBag, Share2 } from 'lucide-react';
import QuantityControl from './quantity-control';
import { useToast } from '@/hooks/use-toast';

interface InvoiceDetailsProps {
  onShare?: () => void;
}

export default function InvoiceDetails({ onShare }: InvoiceDetailsProps) {
  const { items, subtotal, tax, packagingCharge, serviceCharge, discount, total, removeItem, updateQuantity, clearInvoice } = useInvoice();
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

    const itemsText = items.map(item => 
      `- ${item.name} (x${item.quantity}): ${formatCurrency(item.price * item.quantity)}`
    ).join('\n');

    let summaryText = `\n--------------------\nSubtotal: ${formatCurrency(subtotal)}`;
    if (tax > 0) summaryText += `\nTax: ${formatCurrency(tax)}`;
    if (packagingCharge > 0) summaryText += `\nPackaging: ${formatCurrency(packagingCharge)}`;
    if (serviceCharge > 0) summaryText += `\nService Charge: ${formatCurrency(serviceCharge)}`;
    if (discount > 0) summaryText += `\nDiscount: -${formatCurrency(discount)}`;
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
              <div key={item.id} className="flex items-center">
                <div className="flex-grow">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{formatCurrency(item.price)} each</p>
                </div>
                <div className="flex items-center gap-2">
                  <QuantityControl
                    quantity={item.quantity}
                    onIncrease={() => updateQuantity(item.id, item.quantity + 1)}
                    onDecrease={() => updateQuantity(item.id, item.quantity - 1)}
                  />
                  <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} aria-label={`Remove ${item.name}`}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
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
          {discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-{formatCurrency(discount)}</span>
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
