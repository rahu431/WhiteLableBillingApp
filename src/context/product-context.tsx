'use client';

import React, { createContext, useContext, useMemo, useCallback } from 'react';
import type { Product, ProductData } from '@/lib/types';
import { useCollection, useFirestore, useMemoFirebase, setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { getIconComponent } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

interface ProductContextType {
  products: Product[];
  addProduct: (productData: Omit<ProductData, 'id' | 'status'>) => void;
  updateProduct: (productId: string, productData: Partial<ProductData>) => void;
  isLoading: boolean;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const firestore = useFirestore();
  const { toast } = useToast();

  const productsCollectionRef = useMemoFirebase(() =>
    firestore ? collection(firestore, 'products') : null,
    [firestore]
  );
  
  const { data: productData, isLoading, error } = useCollection<ProductData>(productsCollectionRef);

  if (error) {
      console.error("Error fetching products:", error);
      // Optionally render an error state or toast
  }

  const products = useMemo(() => {
    if (!productData) return [];
    return productData.map(p => ({
      ...p,
      icon: getIconComponent(p.icon),
    }));
  }, [productData]);

  const addProduct = useCallback((newProductData: Omit<ProductData, 'id' | 'status'>) => {
    if (!firestore) return;
    const newDocRef = doc(collection(firestore, 'products'));
    const product: ProductData = {
      ...newProductData,
      id: newDocRef.id,
      status: 'active',
    };
    setDocumentNonBlocking(doc(firestore, 'products', product.id), product, {});
    toast({
        title: "Product Added",
        description: `${product.name} has been successfully added.`,
    });
  }, [firestore, toast]);


  const updateProduct = useCallback((productId: string, dataToUpdate: Partial<ProductData>) => {
    if (!firestore) return;
    const productDocRef = doc(firestore, 'products', productId);
    updateDocumentNonBlocking(productDocRef, dataToUpdate);
     toast({
        title: "Product Updated",
        description: `The product has been successfully updated.`,
    });
  }, [firestore, toast]);

  const value = { products, addProduct, updateProduct, isLoading };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
