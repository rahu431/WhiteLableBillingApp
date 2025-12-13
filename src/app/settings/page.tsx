import AppLayout from '@/components/app/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SettingsPage() {
  return (
    <AppLayout>
      <div className="mx-auto grid w-full max-w-6xl gap-2">
        <h1 className="text-3xl font-semibold">Settings</h1>
      </div>
      <div className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
        <Tabs defaultValue="ecommerce" className="w-full md:col-span-2">
          <TabsList className="grid w-full grid-cols-2 md:inline-flex">
            <TabsTrigger value="ecommerce">E-commerce</TabsTrigger>
            <TabsTrigger value="whitelabel">White Label</TabsTrigger>
          </TabsList>
          <TabsContent value="ecommerce">
            <Card>
              <CardHeader>
                <CardTitle>E-commerce Settings</CardTitle>
                <CardDescription>
                  Configure your e-commerce options. More features coming soon.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Input id="currency" defaultValue="USD" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="enable-payments" />
                    <Label htmlFor="enable-payments">Enable Online Payments</Label>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button>Save</Button>
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
        </Tabs>
      </div>
    </AppLayout>
  );
}
