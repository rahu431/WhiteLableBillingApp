'use client';

import { useInvoice } from '@/hooks/use-invoice';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Trash2, ShoppingBag, Share2, Minus, Plus, Percent } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '../ui/input';
import { useFirestore, useUser } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';


interface InvoiceDetailsProps {
  onShare?: () => void;
  onInvoiceGenerated?: () => void;
}

export default function InvoiceDetails({ onShare, onInvoiceGenerated }: InvoiceDetailsProps) {
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
    toggleDiscountInput,
    isDiscountInputVisible,
    clearInvoice 
  } = useInvoice();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  const getInvoiceAsText = () => {
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

    return `*Your Invoice*:\n\n${itemsText}\n${summaryText}`;
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Invoice Copied",
        description: "The invoice details have been copied to your clipboard.",
      });
      if (onShare) onShare();
    } catch (err) {
      console.error('Error copying to clipboard:', err);
      toast({
        title: "Copying Failed",
        description: "Could not copy the invoice to your clipboard.",
        variant: "destructive",
      });
    }
  };


  const handleShare = async () => {
    if (items.length === 0) {
      toast({
        title: "Cannot Share Empty Invoice",
        description: "Please add items to the invoice before sharing.",
        variant: "destructive",
      });
      return;
    }
    const invoiceText = getInvoiceAsText();

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Your Invoice',
          text: invoiceText,
        });
        if (onShare) onShare();
      } catch (error) {
        if (error instanceof DOMException && error.name === 'NotAllowedError') {
          console.warn('Web Share API permission denied, falling back to clipboard.');
          await copyToClipboard(invoiceText);
        } else {
          console.error('Error sharing:', error);
          await copyToClipboard(invoiceText);
        }
      }
    } else {
      await copyToClipboard(invoiceText);
    }
  };
  
  const handleGenerateInvoice = async () => {
    if (!firestore || !user) {
       toast({
        title: "Error",
        description: "You must be logged in to generate an invoice.",
        variant: "destructive",
      });
      return;
    }
    if (items.length === 0) {
      toast({
        title: "Cannot Generate Empty Invoice",
        description: "Please add items to the invoice first.",
        variant: "destructive",
      });
      return;
    }

    // New user-friendly invoice ID generation logic
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const customInvoiceId = `INV-${year}${month}${day}-${hours}${minutes}${seconds}`;

    const invoiceData = {
      id: customInvoiceId,
      userId: user.uid,
      items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          discount: item.discount
      })),
      subtotal,
      tax,
      packagingCharge,
      serviceCharge,
      totalDiscount,
      total,
      createdAt: serverTimestamp(),
    };
    
    try {
      const invoiceDocRef = doc(firestore, 'invoices', customInvoiceId);
      await setDoc(invoiceDocRef, invoiceData);

      toast({ title: "Success!", description: `Invoice ${customInvoiceId} generated and saved.` });
      clearInvoice();
      if (onInvoiceGenerated) onInvoiceGenerated();
    } catch (e: any) {
       toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: e.message || "Could not save invoice.",
      });
    }
  }


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
              <div key={item.id} className="flex flex-col gap-3 border-b pb-3">
                <div className="flex items-center">
                  <p className="font-semibold flex-grow">{item.name}</p>
                   <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} aria-label={`Remove ${item.name}`}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4 items-end">
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
                        <div className="flex items-center gap-2">
                           <label className="text-xs text-muted-foreground">Price</label>
                           <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => toggleDiscountInput(item.id)}
                            >
                              <Percent className="h-4 w-4" />
                            </Button>
                        </div>
                        <Input 
                          type="number"
                          value={item.price}
                          onChange={(e) => updateItemPrice(item.id, parseFloat(e.target.value) || 0)}
                          className="h-8"
                        />
                   </div>
                </div>
                 {isDiscountInputVisible(item.id) && (
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Discount Amount</label>
                      <Input 
                        type="number"
                        value={item.discount}
                        onChange={(e) => updateItemDiscount(item.id, parseFloat(e.target.value) || 0)}
                        placeholder="e.g. 5.00"
                        className="h-8"
                      />
                    </div>
                  )}
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
            onClick={handleGenerateInvoice}
          >
            Generate Invoice
          </Button>
        </div>
      </div>
    </div>
  );
}
