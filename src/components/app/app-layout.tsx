'use client';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarFooter
} from '@/components/ui/sidebar';
import { Home, Settings, Package, BookUser, LogOut, User, LineChart, Receipt } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth, useUser } from '@/firebase';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signOut } from 'firebase/auth';
import { useSettings } from '@/context/settings-context';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { settings } = useSettings();
  const [logoLoadError, setLogoLoadError] = useState(false);

  useEffect(() => {
    // If auth is not loading and there's no user, redirect to login.
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    setLogoLoadError(false);
  }, [settings?.logoUrl]);

  const handleLogout = () => {
    if (auth) {
      signOut(auth);
    }
  };
  
  const getUserInitials = () => {
    if (user?.isAnonymous) return "AN";
    if (user?.displayName) return user.displayName.slice(0, 2).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return "U";
  }

  // While checking auth, show a loading state.
  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen w-full">
        <div className="hidden md:block w-[16rem] h-screen p-4">
            <Skeleton className="h-8 w-1/2 mb-8" />
            <div className='space-y-2'>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        </div>
        <div className="flex-1 flex flex-col">
            <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
                <Skeleton className="h-8 w-8 rounded-full md:hidden" />
                <div className="flex-1" />
                <Skeleton className="h-8 w-8 rounded-full" />
            </header>
            <main className="flex-1 p-4 md:p-6">
                 <Skeleton className="h-full w-full" />
            </main>
        </div>
      </div>
    );
  }

  // If user is authenticated, render the app layout.
  return (
    <div className="flex h-screen w-full">
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <SidebarTrigger className="md:hidden" />
            {settings?.logoUrl && !logoLoadError && (
              <Image 
                src={settings.logoUrl} 
                alt={`${settings.appName} logo`} 
                width={24} 
                height={24} 
                className="rounded-sm"
                onError={() => setLogoLoadError(true)}
              />
            )}
            <h1 className="text-xl font-bold">{settings?.appName || 'Care Billing'}</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/'}
                tooltip={{ children: 'Dashboard' }}
              >
                <Link href="/">
                  <Home />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/products'}
                tooltip={{ children: 'Products' }}
              >
                <Link href="/products">
                  <Package />
                  <span>Products</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/accounts'}
                tooltip={{ children: 'Accounts' }}
              >
                <Link href="/accounts">
                  <BookUser />
                  <span>Accounts</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/expenses'}
                tooltip={{ children: 'Expenses' }}
              >
                <Link href="/expenses">
                  <Receipt />
                  <span>Expenses</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/reports'}
                tooltip={{ children: 'Reports' }}
              >
                <Link href="/reports">
                  <LineChart />
                  <span>Reports</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
            <SidebarMenu>
                 <SidebarMenuItem>
                    <SidebarMenuButton
                        asChild
                        isActive={pathname === '/settings'}
                        tooltip={{ children: 'Settings' }}
                    >
                        <Link href="/settings">
                        <Settings />
                        <span>Settings</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
          <SidebarTrigger />
          <div className="flex-1">
            {/* Can add search or other header items here */}
          </div>
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar>
                  {user.photoURL && <AvatarImage src={user.photoURL} alt="User avatar" />}
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                  <Link href="/users">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </div>
  );
}
