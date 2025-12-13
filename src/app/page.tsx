import { InvoiceProvider } from '@/context/invoice-context';
import AppShell from '@/components/app/app-shell';

export default function Home() {
  return (
    <InvoiceProvider>
      <AppShell />
    </InvoiceProvider>
  );
}
