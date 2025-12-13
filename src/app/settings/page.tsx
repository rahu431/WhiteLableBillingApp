
'use client';

import AppLayout from '@/components/app/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { doc } from 'firebase/firestore';
import { useDoc, useFirestore, useUser, setDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const SETTINGS_DOC_ID = 'global-sheet-settings';

export default function SettingsPage() {
    const { toast } = useToast();
    const { user } = useUser();
    const firestore = useFirestore();

    // E-commerce state
    const [currency, setCurrency] = useState('USD');
    const [taxRate, setTaxRate] = useState('10');
    const [packagingCharge, setPackagingCharge] = useState('0');
    const [serviceCharge, setServiceCharge] = useState('0');
    const [discount, setDiscount] = useState('0');

    // Google Sheets state
    const [spreadsheetUrl, setSpreadsheetUrl] = useState('');
    const [credentials, setCredentials] = useState('');

    const settingsDocRef = useMemoFirebase(() => 
        firestore ? doc(firestore, 'google_sheet_settings', SETTINGS_DOC_ID) : null,
        [firestore]
    );
    const { data: sheetSettings, isLoading: isLoadingSettings, error: sheetSettingsError } = useDoc(settingsDocRef);
    
    useEffect(() => {
        if (sheetSettings) {
            setSpreadsheetUrl(sheetSettings.spreadsheetUrl || '');
            setCredentials(sheetSettings.credentials || '');
        }
    }, [sheetSettings]);


    const handleEcommerceSave = () => {
        toast({
            title: "Settings Saved",
            description: "Your new e-commerce settings have been saved.",
        });
    }

    const handleGoogleSheetsSave = () => {
        if (!user || !settingsDocRef) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'You must be logged in to save settings.',
            });
            return;
        }

        const newSettings = {
            id: SETTINGS_DOC_ID,
            spreadsheetUrl: spreadsheetUrl,
            credentials: credentials,
            lastUpdated: new Date().toISOString(),
        };

        setDocumentNonBlocking(settingsDocRef, newSettings, { merge: true });

        toast({
            title: "Settings Saved",
            description: "Your Google Sheets settings have been updated.",
        });
    }

    const renderGoogleSheetsContent = () => {
        if (isLoadingSettings) {
            return (
                 <div className="space-y-4">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="space-y-2">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                </div>
            );
        }

        if (sheetSettingsError) {
            return (
                 <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error Loading Settings</AlertTitle>
                    <AlertDescription>
                        <p>There was a problem fetching your Google Sheets settings. Please check your Firestore security rules or network connection.</p>
                        <pre className="mt-2 text-xs bg-destructive-foreground/10 p-2 rounded-md overflow-auto">{sheetSettingsError.message}</pre>
                    </AlertDescription>
                </Alert>
            )
        }

        return (
            <form className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="spreadsheet-url">Spreadsheet URL</Label>
                    <Input 
                        id="spreadsheet-url" 
                        placeholder="https://docs.google.com/spreadsheets/d/..." 
                        value={spreadsheetUrl}
                        onChange={(e) => setSpreadsheetUrl(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="credentials">Service Account Credentials (JSON)</Label>
                    <Textarea
                        id="credentials"
                        placeholder='{ "type": "service_account", ... }'
                        className="min-h-[150px] font-mono"
                        value={credentials}
                        onChange={(e) => setCredentials(e.target.value)}
                    />
                </div>
            </form>
        );
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
                <Button onClick={handleEcommerceSave}>Save</Button>
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
                <CardTitle>Google Sheets Integration</CardTitle>
                <CardDescription>
                  Enter your Google Sheet URL and Service Account credentials to store invoice data.
                </CardDescription>
              </CardHeader>
              <CardContent>
                 {renderGoogleSheetsContent()}
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button onClick={handleGoogleSheetsSave} disabled={isLoadingSettings}>Save Settings</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
