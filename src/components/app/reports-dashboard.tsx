'use client';

import { useMemo } from 'react';
import { collection, query, where, Timestamp } from 'firebase/firestore';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { useSettings } from '@/context/settings-context';
import { useProducts } from '@/context/product-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bar, BarChart, Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Skeleton } from '@/components/ui/skeleton';
import { format, subDays, startOfDay, getDay, getHours } from 'date-fns';
import { PackageSearch, TrendingUp, Wallet } from 'lucide-react';
import type { Product } from '@/lib/types';


interface Invoice {
    id: string;
    createdAt: Timestamp;
    items: { id: string; name: string; quantity: number; price: number; }[];
    total: number;
}

interface ProductSale {
    id: string;
    name: string;
    quantity: number;
    revenue: number;
}

export default function ReportsDashboard() {
    const firestore = useFirestore();
    const { user } = useUser();
    const { formatCurrency } = useSettings();
    const { products } = useProducts();

    const invoicesQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        // Fetch last 90 days of invoices for performance
        const startDate = subDays(new Date(), 90);
        return query(
            collection(firestore, 'invoices'),
            where('userId', '==', user.uid),
            where('createdAt', '>=', startDate)
        );
    }, [firestore, user]);

    const { data: invoices, isLoading } = useCollection<Invoice>(invoicesQuery);

    const reportData = useMemo(() => {
        if (!invoices || invoices.length === 0) {
            return null;
        }

        const today = startOfDay(new Date());
        const last30Days = subDays(today, 29);

        // --- Key Metrics ---
        const totalRevenue = invoices.reduce((acc, inv) => acc + inv.total, 0);
        const totalInvoices = invoices.length;
        const avgInvoiceValue = totalRevenue / totalInvoices;

        // --- Sales Over Time (Last 30 days) ---
        const salesByDate: { [key: string]: number } = {};
        for (let i = 0; i < 30; i++) {
            const date = format(subDays(today, i), 'MMM d');
            salesByDate[date] = 0;
        }
        invoices.forEach(inv => {
            const invDate = inv.createdAt.toDate();
            if (invDate >= last30Days) {
                const dateStr = format(invDate, 'MMM d');
                if (dateStr in salesByDate) {
                    salesByDate[dateStr] += inv.total;
                }
            }
        });
        const salesOverTimeChartData = Object.keys(salesByDate).map(date => ({
            date,
            revenue: salesByDate[date]
        })).reverse();
        
        // --- Sales by Day of Week ---
        const dayOfWeekLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const salesByDayData = dayOfWeekLabels.map(day => ({ day, revenue: 0 }));
        invoices.forEach(inv => {
            const dayIndex = getDay(inv.createdAt.toDate());
            salesByDayData[dayIndex].revenue += inv.total;
        });

        // --- Sales by Hour of Day ---
        const salesByHourData = Array.from({ length: 24 }, (_, i) => ({
            hour: `${i}:00`,
            invoices: 0,
        }));
        invoices.forEach(inv => {
            const hourIndex = getHours(inv.createdAt.toDate());
            salesByHourData[hourIndex].invoices += 1;
        });

        // --- Trending Products ---
        const productSales: { [key: string]: { quantity: number; revenue: number } } = {};
        invoices.forEach(inv => {
            inv.items.forEach(item => {
                if (!productSales[item.id]) {
                    productSales[item.id] = { quantity: 0, revenue: 0 };
                }
                productSales[item.id].quantity += item.quantity;
                productSales[item.id].revenue += item.price * item.quantity;
            });
        });
        
        const trendingProducts: ProductSale[] = Object.keys(productSales).map(productId => {
            const productInfo = products.find(p => p.id === productId);
            return {
                id: productId,
                name: productInfo?.name || 'Unknown Product',
                quantity: productSales[productId].quantity,
                revenue: productSales[productId].revenue,
            }
        }).sort((a, b) => b.quantity - a.quantity).slice(0, 5);


        return {
            totalRevenue,
            totalInvoices,
            avgInvoiceValue,
            salesOverTimeChartData,
            salesByDayData,
            salesByHourData,
            trendingProducts,
        };
    }, [invoices, products]);

    const chartConfig = {
      revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
      invoices: { label: "Invoices", color: "hsl(var(--chart-2))" }
    } as const;

    if (isLoading) {
        return (
            <div className="space-y-6">
                 <h1 className="text-3xl font-semibold">Reports</h1>
                <div className="grid gap-6 md:grid-cols-3">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32" />)}
                </div>
                 <div className="grid gap-6 md:grid-cols-2">
                    <Skeleton className="h-80" />
                    <Skeleton className="h-80" />
                </div>
                 <div className="grid gap-6 md:grid-cols-2">
                    <Skeleton className="h-80" />
                    <Skeleton className="h-80" />
                </div>
            </div>
        );
    }
    
    if (!reportData) {
        return (
            <>
                <h1 className="text-3xl font-semibold">Reports</h1>
                <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-card rounded-lg shadow-inner mt-6">
                    <PackageSearch className="w-16 h-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold">No Invoice Data Found</h3>
                    <p className="text-muted-foreground mt-2">Generate some invoices to see your reports.</p>
                </div>
            </>
        )
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-semibold">Reports</h1>
            
            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(reportData.totalRevenue)}</div>
                        <p className="text-xs text-muted-foreground">Based on last 90 days</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{reportData.totalInvoices}</div>
                        <p className="text-xs text-muted-foreground">Total invoices generated</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Invoice Value</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(reportData.avgInvoiceValue)}</div>
                         <p className="text-xs text-muted-foreground">Average amount per invoice</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Sales Trend</CardTitle>
                        <CardDescription>Revenue over the last 30 days.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-64">
                            <LineChart data={reportData.salesOverTimeChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => value.slice(0, 3)} />
                                <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => formatCurrency(value as number).slice(0, -3)} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Trending Products</CardTitle>
                        <CardDescription>Top 5 products by quantity sold.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {reportData.trendingProducts.map((product, index) => (
                                <div key={product.id} className="flex items-center">
                                    <div className="font-semibold">{index + 1}. {product.name}</div>
                                    <div className="ml-auto text-right">
                                        <div className="font-bold">{product.quantity} sold</div>
                                        <div className="text-xs text-muted-foreground">{formatCurrency(product.revenue)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Weekly Trends</CardTitle>
                        <CardDescription>Total revenue by day of the week.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-64">
                            <BarChart data={reportData.salesByDayData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
                                <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => formatCurrency(value as number).slice(0, -3)} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Peak Hours</CardTitle>
                        <CardDescription>Number of invoices by hour of the day.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <ChartContainer config={chartConfig} className="h-64">
                            <BarChart data={reportData.salesByHourData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="hour" tickLine={false} axisLine={false} tickMargin={8} 
                                    interval={3}
                                />
                                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tickMargin={8} />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                                <Bar dataKey="invoices" fill="var(--color-invoices)" radius={4} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
