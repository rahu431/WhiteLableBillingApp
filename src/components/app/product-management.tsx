'use client';

import { products as initialProducts } from '@/lib/data';
import type { Product } from '@/lib/types';
import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
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
import { useMemo, useState } from 'react';
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import ProductForm from './product-form';
import { useProducts } from '@/context/product-context';

export default function ProductManagement() {
  const { products, setProducts } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const { formatCurrency } = useSettings();
  
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    return products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm, products]);

  const handleSaveProduct = (productData: Omit<Product, 'id' | 'icon' | 'status'> & {icon: string}) => {
    if (editingProduct) {
      // Update existing product
      setProducts(products.map(p => p.id === editingProduct.id ? { ...editingProduct, ...productData, icon: initialProducts.find(ip => ip.name === productData.icon)?.icon || p.icon } : p));
    } else {
      // Add new product
      const newProduct: Product = {
        id: (products.length + 1).toString(),
        ...productData,
        status: 'active',
        icon: initialProducts.find(ip => ip.name === productData.icon)?.icon || initialProducts[0].icon,
      };
      setProducts([...products, newProduct]);
    }
    setIsDialogOpen(false);
    setEditingProduct(undefined);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };
  
  const handleArchive = (productId: string) => {
    setProducts(products.map(p => 
      p.id === productId ? { ...p, status: 'archived' } : p
    ));
  };

  const handleUnarchive = (productId: string) => {
    setProducts(products.map(p => 
      p.id === productId ? { ...p, status: 'active' } : p
    ));
  };

  const openNewProductDialog = () => {
    setEditingProduct(undefined);
    setIsDialogOpen(true);
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Products</CardTitle>
              <CardDescription>
                Manage your products and view their sales performance.
              </CardDescription>
            </div>
            <Button onClick={openNewProductDialog}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>
          <div className="pt-4">
            <Input 
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  <span className="sr-only">Image</span>
                </TableHead>
                <TableHead>Name</TableHead>
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
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="hidden sm:table-cell">
                    <Image
                      alt={product.name}
                      className="aspect-square rounded-md object-cover"
                      height="64"
                      src={product.imageUrl}
                      width="64"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    <Badge variant={product.status === 'active' ? 'outline' : 'secondary'}>
                      {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {formatCurrency(product.price)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">25</TableCell>
                  <TableCell>
                    <AlertDialog>
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
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>Archive</DropdownMenuItem>
                            </AlertDialogTrigger>
                          ) : (
                            <DropdownMenuItem onClick={() => handleUnarchive(product.id)}>Unarchive</DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                       <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure you want to archive this product?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Archived products will not be available for selection when creating new invoices.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleArchive(product.id)}>Archive Product</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
          onCancel={() => {
            setIsDialogOpen(false);
            setEditingProduct(undefined);
          }} 
        />
      </DialogContent>
    </Dialog>
  );
}
