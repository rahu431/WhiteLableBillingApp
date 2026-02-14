'use client';
import { useParams, useRouter } from 'next/navigation';
import { useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer } from 'lucide-react';
import PrintableInvoice from '@/components/app/printable-invoice';
import { type Invoice } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect } from 'react';

export default function InvoicePrintPage() {
    const params = useParams();
    const router = useRouter();
    const invoiceId = params.invoiceId as string;
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();

    const invoiceDocRef = useMemoFirebase(() => {
        if (!firestore || !invoiceId || !user) return null;
        return doc(firestore, 'invoices', invoiceId);
    }, [firestore, invoiceId, user]);

    const { data: invoice, isLoading } = useDoc<Invoice>(invoiceDocRef);
    
    // Redirect if user is not owner
    useEffect(() => {
        if (!isLoading && !isUserLoading && invoice && user && invoice.userId !== user.uid) {
            router.push('/accounts');
        }
    }, [invoice, user, isLoading, isUserLoading, router]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="bg-muted min-h-screen p-4 sm:p-8 print:bg-white print:p-0 print:m-0">
            <div className="max-w-4xl mx-auto print:max-w-none print:mx-0 print:w-full">
                <div className="mb-8 flex justify-between items-center print:hidden">
                    <Button variant="outline" onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <div className="flex flex-col items-end gap-2">
                        <Button onClick={handlePrint}>
                            <Printer className="mr-2 h-4 w-4" />
                            Print Thermal Receipt
                        </Button>
                        <p className="text-xs text-muted-foreground">
                            Optimized for 57-58mm thermal paper
                        </p>
                    </div>
                </div>

                {isLoading || isUserLoading ? (
                    <div className="bg-white p-12 rounded-lg shadow-lg print:hidden"><Skeleton className="h-[800px] w-full" /></div>
                ) : invoice ? (
                    <PrintableInvoice invoice={invoice} />
                ) : (
                    <div className="bg-white p-12 rounded-lg shadow-lg text-center print:hidden">
                        <p>Invoice not found or you don't have permission to view it.</p>
                    </div>
                )}
                
                {/* Print Instructions - shown only in print preview */}
                <div className="hidden print:hidden">
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h3 className="font-semibold text-blue-900 mb-2">📝 Thermal Printer Setup Instructions:</h3>
                        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                            <li>In the print dialog, click "More settings" or "Advanced"</li>
                            <li>Set Paper size to: <strong>"Custom" or "Roll Paper 58mm"</strong></li>
                            <li>Set Width: <strong>58mm</strong> (or 2.28 inches)</li>
                            <li>Set Height: <strong>Auto</strong> or leave blank for continuous roll</li>
                            <li>Set all margins to: <strong>0mm</strong></li>
                            <li>Disable "Headers and footers"</li>
                            <li>Enable "Background graphics" (if available)</li>
                        </ol>
                        <p className="text-xs text-blue-600 mt-2">💡 For thermal printers, select your thermal printer as the destination instead of "Save as PDF"</p>
                    </div>
                </div>
            </div>
            <style jsx global>{`
                @media print {
                    @page {
                        size: 58mm auto;
                        margin: 0;
                        padding: 0;
                    }
                    
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important;
                    }
                    
                    html, body {
                        width: 58mm !important;
                        max-width: 58mm !important;
                        min-width: 58mm !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background-color: #fff !important;
                        background: none !important;
                        overflow-x: hidden !important;
                    }
                    
                    body > div {
                        width: 58mm !important;
                        max-width: 58mm !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: none !important;
                    }
                    
                    body > div > div {
                        width: 58mm !important;
                        max-width: 58mm !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: none !important;
                    }
                    
                    .print-container {
                        display: block !important;
                        width: 58mm !important;
                        max-width: 58mm !important;
                        min-width: 58mm !important;
                        padding: 2mm !important;
                        margin: 0 !important;
                        box-shadow: none !important;
                        border-radius: 0 !important;
                        background: white !important;
                        font-size: 8pt !important;
                        line-height: 1.2 !important;
                        overflow: hidden !important;
                    }
                    
                    .print-container * {
                        max-width: 100% !important;
                        box-sizing: border-box !important;
                    }
                    
                    .print-container img {
                        max-width: 100% !important;
                        height: auto !important;
                        object-fit: contain !important;
                    }
                    
                    .print-container table {
                        width: 100% !important;
                        font-size: 7pt !important;
                        border-collapse: collapse !important;
                    }
                    
                    .print-container table td,
                    .print-container table th {
                        padding: 1mm !important;
                        word-wrap: break-word !important;
                        overflow-wrap: break-word !important;
                    }
                    
                    .print-container h1 {
                        font-size: 11pt !important;
                        margin: 1mm 0 !important;
                    }
                    
                    .print-container h2,
                    .print-container h3 {
                        font-size: 8pt !important;
                        margin: 1mm 0 !important;
                    }
                    
                    .print-container p {
                        font-size: 7pt !important;
                        margin: 0.5mm 0 !important;
                    }
                    
                    /* Hide non-essential elements on small paper */
                    .print\\:hidden {
                        display: none !important;
                    }
                    
                    /* Remove all shadows, borders, and rounded corners */
                    * {
                        box-shadow: none !important;
                        border-radius: 0 !important;
                    }
                }
            `}</style>
        </div>
    );
}
