'use client';

import type { Product, ProductData } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle, Upload, Download } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSettings } from '@/context/settings-context';
import { useMemo, useState, useRef } from 'react';
import { Input } from '../ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import ProductForm from './product-form';
import { useProducts } from '@/context/product-context';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '../ui/skeleton';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';
import { collection, doc, writeBatch, type Timestamp, query, where } from 'firebase/firestore';
import { appIcons } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import ProductImage from './product-image';
import CurrencyDisplay from '../ui/currency-display';

interface SalesInvoice {
    createdAt: Timestamp;
    items: {
        id: string;
        quantity: number;
    }[];
}


export default function ProductManagement() {
  const { products, addProduct, updateProduct, isLoading: isLoadingProducts } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [productToArchive, setProductToArchive] = useState<Product | null>(null);
  const [isArchiveAlertOpen, setIsArchiveAlertOpen] = useState(false);
  const { formatCurrency } = useSettings();
  const [activeTab, setActiveTab] = useState('active');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const firestore = useFirestore();
  const { toast } = useToast();
  const { user } = useUser();

  const invoicesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'invoices'), where('userId', '==', user.uid));
  }, [firestore, user]);
  
  const { data: invoices, isLoading: isLoadingInvoices } = useCollection<SalesInvoice>(invoicesQuery);
  
  const isLoading = isLoadingProducts || isLoadingInvoices;

  const dailySales = useMemo(() => {
    if (!invoices) return new Map<string, number>();

    const salesMap = new Map<string, number>();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    invoices.forEach(invoice => {
        const invoiceDate = invoice.createdAt?.toDate();
        if (invoiceDate && invoiceDate >= today) {
            invoice.items.forEach(item => {
                salesMap.set(item.id, (salesMap.get(item.id) || 0) + item.quantity);
            });
        }
    });

    return salesMap;
  }, [invoices]);


  const filteredProducts = useMemo(() => {
    const productsByStatus = products.filter(p => p.status === activeTab);
    if (!searchTerm) return productsByStatus;
    return productsByStatus.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, products, activeTab]);

  const handleSaveProduct = (productData: Omit<ProductData, 'id' | 'status'>) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
    } else {
      addProduct(productData);
    }
    setIsDialogOpen(false);
    setEditingProduct(undefined);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };
  
  const handleConfirmArchive = () => {
    if (!productToArchive) return;
    updateProduct(productToArchive.id, { status: 'archived' });
    setProductToArchive(null);
    setIsArchiveAlertOpen(false);
  };

  const handleUnarchive = (productId: string) => {
    updateProduct(productId, { status: 'active' });
  };

  const openNewProductDialog = () => {
    setEditingProduct(undefined);
    setIsDialogOpen(true);
  }

  const handleExport = () => {
    if (products.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No products to export',
        description: 'Add some products before exporting.',
      });
      return;
    }
    const getIconName = (iconComponent: React.ComponentType<{ className?: string }>) => {
        const iconEntry = appIcons.find(icon => icon.icon === iconComponent);
        return iconEntry ? iconEntry.name : 'Stethoscope';
    };

    const dataToExport = products.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        category: p.category,
        icon: getIconName(p.icon),
        imageUrl: p.imageUrl,
        status: p.status,
    }));

    const csv = Papa.unparse(dataToExport);
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'products.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: 'Export successful', description: 'Your products have been exported to products.csv.' });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const importedProducts = results.data as any[];
        if (!firestore) {
            toast({ variant: 'destructive', title: 'Error', description: 'Firestore not available.' });
            return;
        }

        try {
            const batch = writeBatch(firestore);
            
            importedProducts.forEach(prod => {
                if (!prod.name || !prod.price) {
                    console.warn('Skipping invalid CSV row:', prod);
                    return;
                }

                const productData: ProductData = {
                    id: prod.id || doc(collection(firestore, 'products')).id,
                    name: prod.name,
                    price: parseFloat(prod.price) || 0,
                    category: prod.category || 'Uncategorized',
                    icon: appIcons.find(i => i.name === prod.icon)?.name || 'Stethoscope',
                    imageUrl: prod.imageUrl || PlaceHolderImages[0]?.imageUrl || 'https://placehold.co/400x300',
                    status: prod.status === 'archived' ? 'archived' : 'active',
                };
                
                const docRef = doc(firestore, 'products', productData.id);
                batch.set(docRef, productData, { merge: true });
            });

            await batch.commit();
            toast({ title: 'Import Successful', description: `${importedProducts.length} products have been imported/updated.` });

        } catch (error: any) {
            console.error('Import failed:', error);
            toast({ variant: 'destructive', title: 'Import Failed', description: error.message });
        } finally {
            if(e.target) e.target.value = '';
        }
      },
      error: (error: any) => {
          console.error('CSV parsing error:', error);
          toast({ variant: 'destructive', title: 'CSV Parsing Error', description: error.message });
      }
    });
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingProduct(undefined);
    }
  };

  const renderTableBody = () => {
    if (isLoading) {
      return [...Array(5)].map((_, i) => (
         <TableRow key={i}>
            <TableCell className="hidden sm:table-cell">
              <Skeleton className="h-16 w-16 rounded-md" />
            </TableCell>
            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
            <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
            <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
            <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
            <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-12" /></TableCell>
            <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
          </TableRow>
      ));
    }

    if (filteredProducts.length > 0) {
      return filteredProducts.map((product) => (
        <TableRow key={product.id}>
          <TableCell className="hidden sm:table-cell">
            <ProductImage
              alt={product.name}
              className="aspect-square rounded-md object-cover"
              height="64"
              src={product.imageUrl}
              width="64"
            />
          </TableCell>
          <TableCell className="font-medium">{product.name}</TableCell>
          <TableCell className="hidden md:table-cell">{product.category}</TableCell>
          <TableCell>
            <Badge variant={product.status === 'active' ? 'outline' : 'secondary'}>
              {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
            </Badge>
          </TableCell>
          <TableCell className="hidden md:table-cell">
            <CurrencyDisplay value={product.price} />
          </TableCell>
          <TableCell className="hidden md:table-cell">{dailySales.get(product.id) || 0}</TableCell>
          <TableCell>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button aria-haspopup="true" size="icon" variant="ghost">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleEdit(product)}>Edit</DropdownMenuItem>
                {product.status === 'active' ? (
                  <DropdownMenuItem 
                    className="text-destructive" 
                    onSelect={(e) => {
                      e.preventDefault();
                      setProductToArchive(product);
                      setIsArchiveAlertOpen(true);
                    }}
                  >
                    Archive
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => handleUnarchive(product.id)}>Unarchive</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      ))
    }

    return (
      <TableRow>
        <TableCell colSpan={7} className="h-24 text-center">
          No {activeTab} products found. Add one to get started.
        </TableCell>
      </TableRow>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
            <div>
              <CardTitle>Products</CardTitle>
              <CardDescription>
                Manage your products and view their sales performance.
              </CardDescription>
            </div>
             <div className="flex items-center gap-2 self-end md:self-auto">
                <Button variant="outline" onClick={handleExport}>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                </Button>
                <Button variant="outline" onClick={handleImportClick}>
                    <Upload className="mr-2 h-4 w-4" />
                    Import
                </Button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileImport}
                    style={{ display: 'none' }}
                    accept=".csv"
                />
                <Button onClick={openNewProductDialog}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Product
                </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <Tabs defaultValue="active" onValueChange={(value) => setActiveTab(value)}>
                <TabsList>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="archived">Archived</TabsTrigger>
                </TabsList>
            </Tabs>
            <div className="w-1/3">
                <Input 
                    placeholder={`Search ${activeTab} products...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  <span className="sr-only">Image</span>
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Price</TableHead>
                <TableHead className="hidden md:table-cell">
                  Total Sales
                </TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {renderTableBody()}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Update the details of your product.' : 'Fill in the details for the new product.'}
            </DialogDescription>
          </DialogHeader>
          <ProductForm 
            product={editingProduct} 
            onSave={handleSaveProduct} 
          />
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isArchiveAlertOpen} onOpenChange={setIsArchiveAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to archive this product?</AlertDialogTitle>
              <AlertDialogDescription>
                Archived products will not be available for selection when creating new invoices.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmArchive}>Archive Product</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
