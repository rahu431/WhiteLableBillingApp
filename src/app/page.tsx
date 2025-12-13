import { InvoiceProvider } from '@/context/invoice-context';
import AppShell from '@/components/app/app-shell';
import AppLayout from '@/components/app/app-layout';

export default function Home() {
  return (
    <AppLayout>
      <InvoiceProvider>
        <AppShell />
      </InvoiceProvider>
    </AppLayout>
  );
}
