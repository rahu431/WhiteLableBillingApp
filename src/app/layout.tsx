
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { SidebarProvider } from '@/components/ui/sidebar';
import { FirebaseClientProvider } from '@/firebase';
import { SettingsProvider } from '@/context/settings-context';
import { ProductProvider } from '@/context/product-context';

export const metadata: Metadata = {
  title: 'Care Billing App',
  description: 'A modern billing application for care providers.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <SettingsProvider>
            <ProductProvider>
              <SidebarProvider>
                {children}
              </SidebarProvider>
            </ProductProvider>
          </SettingsProvider>
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
