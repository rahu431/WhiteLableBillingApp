'use client';
import { useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileLayout from '@/components/app/mobile-layout';
import TabletLayout from '@/components/app/tablet-layout';
import { Skeleton } from '@/components/ui/skeleton';

export default function AppShell() {
  const isMobile = useIsMobile();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="flex h-screen w-full items-start gap-8 p-4 md:p-8 bg-background">
        <div className="hidden md:block md:w-2/3 lg:w-3/4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-lg bg-muted/80" />
            ))}
          </div>
        </div>
        <div className="w-full md:w-1/3 lg:w-1/4">
          <Skeleton className="h-[80vh] rounded-lg bg-muted/80" />
        </div>
      </div>
    );
  }

  return isMobile ? <MobileLayout /> : <TabletLayout />;
}
