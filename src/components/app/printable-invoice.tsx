'use client';
import { useSettings } from "@/context/settings-context";
import { type Invoice } from "@/lib/types";
import Image from "next/image";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import CurrencyDisplay from "../ui/currency-display";

export default function PrintableInvoice({ invoice }: { invoice: Invoice }) {
    const { settings, formatCurrency } = useSettings();

    const formatTimestamp = (timestamp: any) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate();
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            timeZone: settings?.timezone || 'UTC'
        }).format(date);
    };
    
    const upiUrl = settings?.upiId 
    ? `upi://pay?pa=${settings.upiId}&pn=${encodeURIComponent(settings.appName || 'Your App')}&am=${invoice.total.toFixed(2)}&cu=${settings.currency || 'INR'}` 
    : '';

    const qrCodeUrl = upiUrl 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=128x128&data=${encodeURIComponent(upiUrl)}` 
    : '';

    return (
        <div className="bg-white p-8 sm:p-12 rounded-lg shadow-lg print-container print:bg-white print:p-0 print:rounded-none print:shadow-none">
            <header className="flex justify-between items-start mb-10 pb-4 border-b print:mb-3 print:pb-2 print:flex-col print:gap-2">
                <div>
                    {settings?.logoUrl && (
                        <Image src={settings.logoUrl} alt={settings.appName || 'Logo'} width={80} height={80} className="mb-4 print:w-12 print:h-12 print:mb-2" />
                    )}
                    <h1 className="text-3xl font-bold text-gray-800 print:text-base">{settings?.appName || 'Invoice'}</h1>
                    <p className="text-gray-500 print:text-xs">Invoice #{invoice.tokenId}</p>
                    {settings?.address && (
                        <p className="text-gray-500 mt-2 whitespace-pre-line print:text-xs print:mt-1">{settings.address}</p>
                    )}
                </div>
                <div className="text-right print:text-left">
                    <p className="font-semibold text-gray-800 print:text-xs">Invoice ID: {invoice.id}</p>
                    <p className="text-gray-500 print:text-xs">Date Issued: {formatTimestamp(invoice.createdAt)}</p>
                    {settings?.gstNumber && (
                        <p className="text-gray-500 mt-1 print:text-xs print:mt-0.5">GSTIN: {settings.gstNumber}</p>
                    )}
                </div>
            </header>

            <section className="grid grid-cols-2 gap-8 mb-10 print:grid-cols-1 print:gap-2 print:mb-3">
                <div>
                    <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2 print:text-xs print:mb-1">Billed To</h2>
                    <p className="font-bold text-gray-800 print:text-xs">{invoice.customerName || 'N/A'}</p>
                    <p className="text-gray-600 print:text-xs">{invoice.customerEmail}</p>
                    <p className="text-gray-600 print:text-xs">{invoice.customerPhone}</p>
                </div>
                {invoice.notes && (
                    <div className="text-right print:text-left">
                         <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2 print:text-xs print:mb-1">Notes</h2>
                         <p className="text-gray-600 print:text-xs">{invoice.notes}</p>
                    </div>
                )}
            </section>

            <section className="mb-10 print:mb-3">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50">
                            <TableHead className="text-gray-600">Item</TableHead>
                            <TableHead className="text-center text-gray-600">Qty</TableHead>
                            <TableHead className="text-right text-gray-600">Price</TableHead>
                            <TableHead className="text-right text-gray-600">Discount</TableHead>
                            <TableHead className="text-right text-gray-600">Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoice.items.map(item => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell className="text-center">{item.quantity}</TableCell>
                                <TableCell className="text-right"><CurrencyDisplay value={item.price} /></TableCell>
                                <TableCell className="text-right"><CurrencyDisplay value={item.discount * item.quantity} /></TableCell>
                                <TableCell className="text-right font-medium"><CurrencyDisplay value={item.price * item.quantity - item.discount * item.quantity} /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </section>

            <section className="grid grid-cols-2 gap-8 print:grid-cols-1 print:gap-2">
                <div className="print:order-2 print:mt-2">
                    {qrCodeUrl && (
                        <>
                            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2 print:text-xs print:mb-1">Scan to Pay</h3>
                            <Image src={qrCodeUrl} alt="UPI QR Code" width={128} height={128} className="print:w-24 print:h-24" data-ai-hint="qr code" />
                            <p className="mt-2 text-xs text-gray-500 print:mt-1">UPI ID: {settings?.upiId}</p>
                        </>
                    )}
                </div>
                <div className="text-right space-y-2 print:order-1 print:space-y-1">
                    <div className="flex justify-between print:text-xs">
                        <span className="text-gray-500">Subtotal:</span>
                        <span className="font-medium text-gray-800"><CurrencyDisplay value={invoice.subtotal} /></span>
                    </div>
                     {invoice.totalDiscount > 0 && (
                        <div className="flex justify-between print:text-xs">
                        <span className="text-gray-500">Discount:</span>
                        <span className="font-medium text-gray-800">-<CurrencyDisplay value={invoice.totalDiscount} /></span>
                        </div>
                    )}
                    {invoice.tax > 0 && (
                        <div className="flex justify-between print:text-xs">
                        <span className="text-gray-500">Tax:</span>
                        <span className="font-medium text-gray-800"><CurrencyDisplay value={invoice.tax} /></span>
                        </div>
                    )}
                    {invoice.packagingCharge > 0 && (
                        <div className="flex justify-between print:text-xs">
                        <span className="text-gray-500">Packaging:</span>
                        <span className="font-medium text-gray-800"><CurrencyDisplay value={invoice.packagingCharge} /></span>
                        </div>
                    )}
                    {invoice.serviceCharge > 0 && (
                        <div className="flex justify-between print:text-xs">
                        <span className="text-gray-500">Service Fee:</span>
                        <span className="font-medium text-gray-800"><CurrencyDisplay value={invoice.serviceCharge} /></span>
                        </div>
                    )}
                    <Separator className="my-2"/>
                     <div className="flex justify-between text-xl font-bold print:text-sm">
                        <span className="text-gray-800">Total:</span>
                        <span className="text-gray-900"><CurrencyDisplay value={invoice.total} /></span>
                    </div>
                </div>
            </section>
        </div>
    );
}
