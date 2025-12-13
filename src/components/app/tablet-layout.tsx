import ProductGrid from '@/components/app/product-grid';
import InvoiceDetails from '@/components/app/invoice-details';

export default function TabletLayout() {
  return (
    <div className="flex h-screen w-full items-start">
      <div className="w-2/3 h-screen overflow-y-auto p-8">
        <header className="mb-6">
          <h1 className="text-4xl font-bold font-headline text-primary">Care Billing</h1>
          <p className="text-muted-foreground mt-1">Select services to build the invoice.</p>
        </header>
        <ProductGrid />
      </div>
      <div className="w-1/3 h-screen bg-secondary/50 border-l p-6 flex flex-col">
        <h2 className="text-2xl font-bold font-headline mb-4">Current Invoice</h2>
        <InvoiceDetails />
      </div>
    </div>
  );
}
