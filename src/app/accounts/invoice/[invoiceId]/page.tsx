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
        if (!firestore || !invoiceId) return null;
        return doc(firestore, 'invoices', invoiceId);
    }, [firestore, invoiceId]);

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
        <div className="bg-muted min-h-screen p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 flex justify-between items-center print:hidden">
                    <Button variant="outline" onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <Button onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print / Save as PDF
                    </Button>
                </div>

                {isLoading || isUserLoading ? (
                    <div className="bg-white p-12 rounded-lg shadow-lg"><Skeleton className="h-[800px] w-full" /></div>
                ) : invoice ? (
                    <PrintableInvoice invoice={invoice} />
                ) : (
                    <div className="bg-white p-12 rounded-lg shadow-lg text-center">
                        <p>Invoice not found or you don't have permission to view it.</p>
                    </div>
                )}
            </div>
            <style jsx global>{`
                @media print {
                    body {
                        background-color: #fff;
                    }
                    .print-container {
                        padding: 0;
                        margin: 0;
                        box-shadow: none;
                    }
                }
            `}</style>
        </div>
    );
}
