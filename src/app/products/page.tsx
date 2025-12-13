import AppLayout from '@/components/app/app-layout';
import ProductManagement from '@/components/app/product-management';
import { InvoiceProvider } from '@/context/invoice-context';

export default function ProductsPage() {
  return (
    <AppLayout>
        <ProductManagement />
    </AppLayout>
  );
}
