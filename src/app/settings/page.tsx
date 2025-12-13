
'use client';

import AppLayout from '@/components/app/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export default function SettingsPage() {
    const { toast } = useToast();
    const [currency, setCurrency] = useState('USD');
    const [taxRate, setTaxRate] = useState('10');
    const [packagingCharge, setPackagingCharge] = useState('0');
    const [serviceCharge, setServiceCharge] = useState('0');
    const [discount, setDiscount] = useState('0');

    const handleSave = () => {
        // Here you would typically save these values to a backend or context
        // For now, we'll just show a toast notification
        toast({
            title: "Settings Saved",
            description: "Your new settings have been saved.",
        });
    }

  return (
    <AppLayout>
      <div className="mx-auto grid w-full max-w-6xl gap-2">
        <h1 className="text-3xl font-semibold">Settings</h1>
      </div>
      <div className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
        <Tabs defaultValue="ecommerce" className="w-full md:col-span-2">
          <TabsList className="grid w-full grid-cols-3 md:inline-flex">
            <TabsTrigger value="ecommerce">E-commerce</TabsTrigger>
            <TabsTrigger value="whitelabel">White Label</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>
          <TabsContent value="ecommerce">
            <Card>
              <CardHeader>
                <CardTitle>E-commerce Settings</CardTitle>
                <CardDescription>
                  Configure your store's currency, tax, and additional charges.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency Symbol</Label>
                      <Input id="currency" value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="e.g. USD, EUR, INR" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                      <Input id="tax-rate" type="number" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} placeholder="e.g. 10" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="packaging-charge">Packaging Charges</Label>
                      <Input id="packaging-charge" type="number" value={packagingCharge} onChange={(e) => setPackagingCharge(e.target.value)} placeholder="e.g. 5" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="service-charge">Handling/Service Charges</Label>
                      <Input id="service-charge" type="number" value={serviceCharge} onChange={(e) => setServiceCharge(e.target.value)} placeholder="e.g. 2.50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="discount">Flat Discount</Label>
                      <Input id="discount" type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="e.g. 10" />
                    </div>
                  </div>
                   <div className="flex items-center space-x-2 pt-4">
                    <Switch id="enable-payments" />
                    <Label htmlFor="enable-payments">Enable Online Payments</Label>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button onClick={handleSave}>Save</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="whitelabel">
            <Card>
              <CardHeader>
                <CardTitle>White Label</CardTitle>
                <CardDescription>
                  Customize the appearance of the application. More features coming soon.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="app-name">App Name</Label>
                    <Input id="app-name" defaultValue="Care Billing" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="logo">Logo</Label>
                    <Input id="logo" type="file" />
                  </div>
                </form>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button>Save</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="integrations">
            <Card>
              <CardHeader>
                <CardTitle>Google Sheets</CardTitle>
                <CardDescription>
                  Manage settings for Google Sheets integration.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="spreadsheet-url">Spreadsheet URL</Label>
                    <Input id="spreadsheet-url" placeholder="Enter your Google Sheet URL" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="credentials">Credentials</Label>
                    <Input id="credentials" type="text" placeholder="Enter your credentials" />
                  </div>
                </form>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button>Save</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
