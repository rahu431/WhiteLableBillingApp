'use client';

import React, { createContext, useContext, useMemo, useCallback, useEffect, useState } from 'react';
import type { Product, ProductData } from '@/lib/types';
import { useCollection, useFirestore, useMemoFirebase, setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { getIconComponent } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

const initialProducts: Omit<ProductData, 'id' | 'status'>[] = [
    // Iced Brews
    { name: 'Vietnamese Iced coffee (Small)', price: 70, icon: 'Coffee', imageUrl: 'https://images.unsplash.com/photo-1551030173-17d642ae958a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxWaWV0bmFtZXNlJTIwSWNlZCUyMGNvZmZlZXxlbnwwfHx8fDE3NjkxNTAwNTl8MA&ixlib=rb-4.1.0&q=80&w=1080', category: 'Iced Brews' },
    { name: 'Vietnamese Iced coffee (Medium)', price: 80, icon: 'Coffee', imageUrl: 'https://images.unsplash.com/photo-1551030173-17d642ae958a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxWaWV0bmFtZXNlJTIwSWNlZCUyMGNvZmZlZXxlbnwwfHx8fDE3NjkxNTAwNTl8MA&ixlib=rb-4.1.0&q=80&w=1080', category: 'Iced Brews' },
    { name: 'Vietnamese Iced coffee (Large)', price: 110, icon: 'Coffee', imageUrl: 'https://images.unsplash.com/photo-1551030173-17d642ae958a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxWaWV0bmFtZXNlJTIwSWNlZCUyMGNvZmZlZXxlbnwwfHx8fDE3NjkxNTAwNTl8MA&ixlib=rb-4.1.0&q=80&w=1080', category: 'Iced Brews' },
    { name: 'Iced Mocha (Small)', price: 70, icon: 'Coffee', imageUrl: 'https://images.unsplash.com/photo-1584312528148-3c878b66a840?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxJY2VkJTIwTW9jaGF8ZW58MHx8fHwxNzY5MTUwMDk2fDA&ixlib=rb-4.1.0&q=80&w=1080', category: 'Iced Brews' },
    { name: 'Iced Mocha (Medium)', price: 80, icon: 'Coffee', imageUrl: 'https://images.unsplash.com/photo-1584312528148-3c878b66a840?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxJY2VkJTIwTW9jaGF8ZW58MHx8fHwxNzY5MTUwMDk2fDA&ixlib-rb-4.1.0&q=80&w=1080', category: 'Iced Brews' },
    { name: 'Iced Mocha (Large)', price: 110, icon: 'Coffee', imageUrl: 'https://images.unsplash.com/photo-1584312528148-3c878b66a840?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxJY2VkJTIwTW9jaGF8ZW58MHx8fHwxNzY5MTUwMDk2fDA&ixlib-rb-4.1.0&q=80&w=1080', category: 'Iced Brews' },
    { name: 'Cold Caramel (Small)', price: 70, icon: 'Coffee', imageUrl: 'https://images.unsplash.com/photo-1572422319406-8b770f9e8020?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxDYXJhbWVsJTIwSWNlZCUyMENvZmZlZXxlbnwwfHx8fDE3NjkxNTAxMjR8MA&ixlib=rb-4.1.0&q=80&w=1080', category: 'Iced Brews' },
    { name: 'Cold Caramel (Medium)', price: 80, icon: 'Coffee', imageUrl: 'https://images.unsplash.com/photo-1572422319406-8b770f9e8020?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxDYXJhbWVsJTIwSWNlZCUyMENvZmZlZXxlbnwwfHx8fDE3NjkxNTAxMjR8MA&ixlib-rb-4.1.0&q=80&w=1080', category: 'Iced Brews' },
    { name: 'Cold Caramel (Large)', price: 110, icon: 'Coffee', imageUrl: 'https://images.unsplash.com/photo-1572422319406-8b770f9e8020?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxDYXJhbWVsJTIwSWNlZCUyMENvZmZlZXxlbnwwfHx8fDE3NjkxNTAxMjR8MA&ixlib-rb-4.1.0&q=80&w=1080', category: 'Iced Brews' },
    { name: 'Iced Black Coffee', price: 40, icon: 'Coffee', imageUrl: 'https://images.unsplash.com/photo-1517701559435-50a18a8aaa9a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxJY2VkJTIwQmxhY2slMjBDb2ZmZWV8ZW58MHx8fHwxNzY5MTUwMTUxfDA&ixlib-rb-4.1.0&q=80&w=1080', category: 'Iced Brews' },
    
    // Classics
    { name: 'Filter Coffee', price: 35, icon: 'Coffee', imageUrl: 'https://images.unsplash.com/photo-1623902327423-75a7b1b59dfe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxGaWx0ZXIlMjBDb2ZmZWV8ZW58MHx8fHwxNzY5MTUwMTc1fDA&ixlib-rb-4.1.0&q=80&w=1080', category: 'Classics' },
    { name: 'Black Coffee', price: 30, icon: 'Coffee', imageUrl: 'https://images.unsplash.com/photo-1593441829334-cf9a4a759bad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxhbWVyaWNhbm98ZW58MHx8fHwxNzY4MjU4Nzc3fDA&ixlib.rb-4.1.0&q=80&w=1080', category: 'Classics' },
    { name: 'Bullet Coffee', price: 40, icon: 'Coffee', imageUrl: 'https://images.unsplash.com/photo-1549922378-8456a640b490?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxCdWxsZXRwcm9vZiUyMENvZmZlZXxlbnwwfHx8fDE3NjkxNTAyMjN8MA&ixlib-rb-4.1.0&q=80&w=1080', category: 'Classics' },
    { name: 'Butter Bun', price: 50, icon: 'Coffee', imageUrl: 'https://images.unsplash.com/photo-1621817181839-85b5650e82f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxidXR0ZXIlMjBidW58ZW58MHx8fHwxNzY5MTUwMjQ4fDA&ixlib-rb-4.1.0&q=80&w=1080', category: 'Classics' },
    { name: 'Masala Bun', price: 50, icon: 'Coffee', imageUrl: 'https://images.unsplash.com/photo-1609363114407-336c7320a95c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxtYXNhbGJhJTIwYnVufGVufDB8fHx8MTc2OTE1MDI4Nnww&ixlib-rb-4.1.0&q=80&w=1080', category: 'Classics' },

    // Coffee Desserts
    { name: 'Affogato', price: 70, icon: 'Coffee', imageUrl: 'https://images.unsplash.com/photo-1579705136879-c45437435136?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxhZmZvZ2F0b3xlbnwwfHx8fDE3NjkxNTAzMTB8MA&ixlib-rb-4.1.0&q=80&w=1080', category: 'Coffee Desserts' },
    { name: 'Coffee CreamShake', price: 90, icon: 'Coffee', imageUrl: 'https://images.unsplash.com/photo-1570912187654-c95a0715e219?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBtaWxrc2hha2V8ZW58MHx8fHwxNzY5MTUwMzQwfDA&ixlib-rb-4.1.0&q=80&w=1080', category: 'Coffee Desserts' },
];

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
  const [isSeeding, setIsSeeding] = useState(false);

  const productsCollectionRef = useMemoFirebase(() =>
    firestore ? collection(firestore, 'products') : null,
    [firestore]
  );
  
  const { data: productData, isLoading, error } = useCollection<ProductData>(productsCollectionRef);

  useEffect(() => {
    if (firestore && !isLoading && productData && !isSeeding) {
        const seedDatabase = async () => {
            setIsSeeding(true);
            try {
                const batch = writeBatch(firestore);
                const dbProductMap = new Map(productData.map(p => [p.name, p]));
                let changesMade = false;

                initialProducts.forEach(initialProduct => {
                    const existingProduct = dbProductMap.get(initialProduct.name);
                    if (existingProduct) {
                        // Product exists, check if update is needed
                        const updateData: Partial<ProductData> = {};
                        if (existingProduct.price !== initialProduct.price) updateData.price = initialProduct.price;
                        if (existingProduct.imageUrl !== initialProduct.imageUrl) updateData.imageUrl = initialProduct.imageUrl;
                        if (existingProduct.icon !== initialProduct.icon) updateData.icon = initialProduct.icon;
                        if (existingProduct.category !== initialProduct.category) updateData.category = initialProduct.category;
                        
                        if (Object.keys(updateData).length > 0) {
                            const productDocRef = doc(firestore, 'products', existingProduct.id);
                            batch.update(productDocRef, updateData);
                            changesMade = true;
                        }
                    } else {
                        // Product doesn't exist, add it
                        const newDocRef = doc(collection(firestore, 'products'));
                        const product: ProductData = {
                            ...initialProduct,
                            id: newDocRef.id,
                            status: 'active',
                        };
                        batch.set(newDocRef, product);
                        changesMade = true;
                    }
                });

                if (changesMade) {
                    await batch.commit();
                    toast({
                        title: "Product Catalog Updated",
                        description: "Your product list has been updated with the new menu items.",
                    });
                }
            } catch (e) {
                console.error("Error seeding database:", e);
                toast({
                    variant: "destructive",
                    title: "Database Seeding Failed",
                    description: "Could not add or update products in the database.",
                });
            } finally {
                // This ensures seeding is attempted only once per session, even on failure.
                // For a more robust solution, a persistent flag in the DB would be better.
                setIsSeeding(true);
            }
        };

        seedDatabase();
    }
  }, [firestore, isLoading, productData, isSeeding, toast]);

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
