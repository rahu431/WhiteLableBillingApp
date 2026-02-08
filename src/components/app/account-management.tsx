'use client';
import { useMemo, useState } from 'react';
import type { DateRange } from "react-day-picker"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from '@/components/ui/button';
import { MoreHorizontal, FileDown, Calendar as CalendarIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useSettings } from '@/context/settings-context';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, Timestamp } from 'firebase/firestore';
import { Skeleton } from '../ui/skeleton';
import { Calendar } from "@/components/ui/calendar"
import { addDays, format, startOfWeek, endOfDay } from "date-fns"
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';
import type { Invoice } from '@/lib/types';


export default function AccountManagement() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { settings, formatCurrency } = useSettings();
  const { toast } = useToast();
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -29),
    to: new Date(),
  });

  const invoicesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'invoices'),
      where('userId', '==', user.uid)
    );
  }, [firestore, user]);

  const { data: invoices, isLoading } = useCollection<Invoice>(invoicesQuery);

  const sortedInvoices = useMemo(() => {
    if (!invoices) return [];
    return [...invoices].sort((a, b) => {
      const dateA = a.createdAt?.toDate() ?? new Date(0);
      const dateB = b.createdAt?.toDate() ?? new Date(0);
      return dateB.getTime() - dateA.getTime();
    });
  }, [invoices]);

  const formatTimestamp = (timestamp: Timestamp | null | undefined) => {
    if (!timestamp) return 'N/A';
    return timestamp.toDate().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: settings?.timezone || 'UTC',
    });
  };

  const handleExport = (rangeType: 'last30days' | 'thisWeek' | 'today' | 'custom') => {
    let from: Date | undefined;
    let to: Date | undefined;
    const now = new Date();

    switch (rangeType) {
        case 'last30days':
            from = addDays(now, -29);
            to = now;
            break;
        case 'thisWeek':
            from = startOfWeek(now);
            to = now;
            break;
        case 'today':
            from = new Date();
            from.setHours(0,0,0,0);
            to = now;
            break;
        case 'custom':
            from = dateRange?.from;
            to = dateRange?.to;
            break;
    }

    if (!from) {
        toast({
            variant: "destructive",
            title: 'Invalid Date Range',
            description: "Please select a 'from' date for the export.",
        });
        return;
    }
     if (!to) {
        to = from;
    }
    
    const toDate = endOfDay(to);

    const invoicesToExport = sortedInvoices.filter(invoice => {
        const invoiceDate = invoice.createdAt.toDate();
        return invoiceDate >= from! && invoiceDate <= toDate;
    });

    if (invoicesToExport.length === 0) {
        toast({
            title: "No Invoices Found",
            description: "There are no invoices in the selected date range to export.",
        });
        if (rangeType === 'custom') {
            setIsExportDialogOpen(false);
        }
        return;
    }

    const dataForCsv = invoicesToExport.flatMap(invoice => 
        invoice.items.map(item => ({
            'Invoice ID': invoice.id,
            'Token': invoice.tokenId,
            'Date': formatTimestamp(invoice.createdAt),
            'Customer Name': invoice.customerName || '',
            'Customer Email': invoice.customerEmail || '',
            'Customer Phone': invoice.customerPhone || '',
            'Notes': invoice.notes || '',
            'Item ID': item.id,
            'Item Name': item.name,
            'Quantity': item.quantity,
            'Item Price': item.price,
            'Item Discount': item.discount,
            'Item Total': (item.price * item.quantity) - (item.discount * item.quantity),
            'Subtotal': invoice.subtotal,
            'Tax': invoice.tax,
            'Packaging Charge': invoice.packagingCharge,
            'Service Charge': invoice.serviceCharge,
            'Total Discount': invoice.totalDiscount,
            'Total': invoice.total,
        }))
    );

    const csv = Papa.unparse(dataForCsv);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `invoices-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
        title: "Export Successful",
        description: `${invoicesToExport.length} invoices have been exported.`,
    });
    
    if (rangeType === 'custom') {
        setIsExportDialogOpen(false);
    }
  };
  
  const handlePrintInvoice = (invoiceId: string) => {
      window.open(`/accounts/invoice/${invoiceId}`, '_blank');
  };

  const getInvoiceAsText = (invoice: Invoice) => {
    const appName = settings?.appName || 'Your App';
    const header = `*Invoice from ${appName}*\n\n`;
    
    const customerInfo = `Customer: ${invoice.customerName || 'N/A'}\nInvoice ID: ${invoice.id}\nDate: ${formatTimestamp(invoice.createdAt)}\n\n`;

    const itemsText = invoice.items.map(item => {
      let itemText = `- ${item.name} (x${item.quantity}): ${formatCurrency((item.price * item.quantity) - (item.discount * item.quantity))}`;
      if (item.discount > 0) {
        itemText += ` (Discount: ${formatCurrency(item.discount * item.quantity)})`;
      }
      return itemText;
    }).join('\n');
    

    let summaryText = `\n--------------------\nSubtotal: ${formatCurrency(invoice.subtotal)}`;
    if (invoice.totalDiscount > 0) summaryText += `\nTotal Discount: -${formatCurrency(invoice.totalDiscount)}`;
    if (invoice.tax > 0) summaryText += `\nTax: ${formatCurrency(invoice.tax)}`;
    if (invoice.packagingCharge > 0) summaryText += `\nPackaging: ${formatCurrency(invoice.packagingCharge)}`;
    if (invoice.serviceCharge > 0) summaryText += `\nService Charge: ${formatCurrency(invoice.serviceCharge)}`;
    summaryText += `\n--------------------\n*Total: ${formatCurrency(invoice.total)}*`;

    return `${header}${customerInfo}${itemsText}\n${summaryText}`;
  }

  const handleCopyInvoice = async (invoice: Invoice) => {
    const invoiceText = getInvoiceAsText(invoice);
    try {
      await navigator.clipboard.writeText(invoiceText);
      toast({
        title: "Invoice Copied",
        description: "The invoice details have been copied to your clipboard.",
      });
    } catch (err) {
      console.error('Error copying to clipboard:', err);
      toast({
        title: "Copying Failed",
        description: "Could not copy the invoice to your clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Accounts</CardTitle>
              <CardDescription>
                A list of all generated invoices.
              </CardDescription>
            </div>
            <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <FileDown className="mr-2 h-4 w-4" />
                    Export to Excel
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleExport('last30days')}>Last 30 days</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('thisWeek')}>This Week</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('today')}>Today</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Custom Range...</DropdownMenuItem>
                  </DialogTrigger>
                </DropdownMenuContent>
              </DropdownMenu>
              <DialogContent className="sm:max-w-[625px]">
                  <DialogHeader>
                      <DialogTitle>Export Custom Range</DialogTitle>
                      <DialogDescription>
                          Select the start and end date for the export.
                      </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                          <Popover>
                              <PopoverTrigger asChild>
                                  <Button
                                      id="date"
                                      variant={"outline"}
                                      className={cn(
                                          "w-full justify-start text-left font-normal",
                                          !dateRange && "text-muted-foreground"
                                      )}
                                  >
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      {dateRange?.from ? (
                                          dateRange.to ? (
                                              <>
                                                  {format(dateRange.from, "LLL dd, y")} -{" "}
                                                  {format(dateRange.to, "LLL dd, y")}
                                              </>
                                          ) : (
                                              format(dateRange.from, "LLL dd, y")
                                          )
                                      ) : (
                                          <span>Pick a date range</span>
                                      )}
                                  </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                      initialFocus
                                      mode="range"
                                      defaultMonth={dateRange?.from}
                                      selected={dateRange}
                                      onSelect={setDateRange}
                                      numberOfMonths={2}
                                  />
                              </PopoverContent>
                          </Popover>
                      </div>
                  </div>
                  <DialogFooter>
                      <Button onClick={() => setIsExportDialogOpen(false)} variant="outline">Cancel</Button>
                      <Button onClick={() => handleExport('custom')}>Export</Button>
                  </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Token</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : sortedInvoices && sortedInvoices.length > 0 ? (
                sortedInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-semibold">{invoice.tokenId}</TableCell>
                    <TableCell className="font-medium">{invoice.customerName || 'N/A'}</TableCell>
                    <TableCell className="font-medium truncate" style={{ maxWidth: 150 }}>{invoice.id}</TableCell>
                    <TableCell>{formatTimestamp(invoice.createdAt)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">Paid</Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(invoice.total)}</TableCell>
                    <TableCell>{invoice.items.length}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => setSelectedInvoice(invoice)}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePrintInvoice(invoice.id)}>
                            Print Invoice
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCopyInvoice(invoice)}>
                            Copy Invoice
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                  <TableRow>
                      <TableCell colSpan={8} className="text-center h-24">
                          No invoices found.
                      </TableCell>
                  </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={!!selectedInvoice} onOpenChange={(open) => !open && setSelectedInvoice(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Invoice #{selectedInvoice?.tokenId}</DialogTitle>
            <DialogDescription>
                Generated on {selectedInvoice ? formatTimestamp(selectedInvoice.createdAt) : ''}
            </DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <div className="py-4 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-2">
                  <h3 className="font-semibold">Customer Details</h3>
                  <div className="text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg">
                      <p><strong>Name:</strong> {selectedInvoice.customerName || 'N/A'}</p>
                      <p><strong>Email:</strong> {selectedInvoice.customerEmail || 'N/A'}</p>
                      <p><strong>Phone:</strong> {selectedInvoice.customerPhone || 'N/A'}</p>
                      {selectedInvoice.notes && <p><strong>Notes:</strong> {selectedInvoice.notes}</p>}
                  </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Items</h3>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead className="text-center">Qty</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-right">Discount</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {selectedInvoice.items.map(item => (
                            <TableRow key={item.id}>
                                <TableCell>{item.name}</TableCell>
                                <TableCell className="text-center">{item.quantity}</TableCell>
                                <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(item.discount * item.quantity)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(item.price * item.quantity - item.discount * item.quantity)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
              </div>
              
              <div className="flex justify-end">
                <div className="w-full md:w-1/2 space-y-2">
                    <h3 className="font-semibold">Summary</h3>
                    <Separator />
                    <div className="flex justify-between text-sm">
                        <span>Subtotal</span>
                        <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                    </div>
                    {selectedInvoice.totalDiscount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                        <span>Discount</span>
                        <span>-{formatCurrency(selectedInvoice.totalDiscount)}</span>
                        </div>
                    )}
                    {selectedInvoice.tax > 0 && (
                        <div className="flex justify-between text-sm">
                        <span>Tax</span>
                        <span>{formatCurrency(selectedInvoice.tax)}</span>
                        </div>
                    )}
                    {selectedInvoice.packagingCharge > 0 && (
                        <div className="flex justify-between text-sm">
                        <span>Packaging</span>
                        <span>{formatCurrency(selectedInvoice.packagingCharge)}</span>
                        </div>
                    )}
                    {selectedInvoice.serviceCharge > 0 && (
                        <div className="flex justify-between text-sm">
                        <span>Service</span>
                        <span>{formatCurrency(selectedInvoice.serviceCharge)}</span>
                        </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>{formatCurrency(selectedInvoice.total)}</span>
                    </div>
                </div>
              </div>
            </div>
          )}
           <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Close</Button>
                </DialogClose>
           </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
