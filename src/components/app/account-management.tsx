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
import { addDays, format, startOfWeek } from "date-fns"
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';

interface Invoice {
    id: string;
    tokenId: number;
    createdAt: Timestamp;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    notes?: string;
    items: {
        id: string;
        name: string;
        price: number;
        quantity: number;
        discount: number;
    }[];
    subtotal: number;
    tax: number;
    packagingCharge: number;
    serviceCharge: number;
    totalDiscount: number;
    total: number;
}


export default function AccountManagement() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { formatCurrency, settings } = useSettings();
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
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

    switch (rangeType) {
        case 'last30days':
            from = addDays(new Date(), -29);
            to = new Date();
            break;
        case 'thisWeek':
            from = startOfWeek(new Date());
            to = new Date();
            break;
        case 'today':
            from = new Date();
            from.setHours(0,0,0,0);
            to = new Date();
            break;
        case 'custom':
            from = dateRange?.from;
            to = dateRange?.to;
            break;
    }

    if (!from) {
        alert('Please select a "from" date.');
        return;
    }
     if (!to) {
        to = from;
    }

    alert(`Exporting invoices from ${format(from, 'PPP')} to ${format(to, 'PPP')}. This feature is coming soon!`);
    
    if (rangeType === 'custom') {
        setIsExportDialogOpen(false);
    }
  };
  
  const handleViewDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDetailsDialogOpen(true);
  };
  
  const handleDownloadPdf = (invoiceId: string) => {
      alert(`PDF download for invoice ${invoiceId} is coming soon!`);
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
                          <DropdownMenuItem onClick={() => handleViewDetails(invoice)}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownloadPdf(invoice.id)}>
                            Download PDF
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
      
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
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
                <Button onClick={() => setIsDetailsDialogOpen(false)}>Close</Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
