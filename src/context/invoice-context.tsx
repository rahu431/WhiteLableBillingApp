
"use client";

import React, { createContext, useState, useMemo, useCallback } from 'react';
import type { InvoiceItem, Product } from '@/lib/types';
import { TAX_RATE, DISCOUNT_AMOUNT, PACKAGING_CHARGE, SERVICE_CHARGE } from '@/lib/constants';

interface InvoiceContextType {
  items: InvoiceItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, newQuantity: number) => void;
  clearInvoice: () => void;
  subtotal: number;
  tax: number;
  packagingCharge: number;
  serviceCharge: number;
  discount: number;
  total: number;
}

export const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export const InvoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<InvoiceItem[]>([]);

  const addItem = useCallback((product: Product) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId);
    } else {
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  }, [removeItem]);

  const clearInvoice = useCallback(() => {
    setItems([]);
  }, []);

  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [items]);

  const tax = useMemo(() => {
    return subtotal * TAX_RATE;
  }, [subtotal]);
  
  const packagingCharge = PACKAGING_CHARGE;
  const serviceCharge = SERVICE_CHARGE;
  const discount = DISCOUNT_AMOUNT;

  const total = useMemo(() => {
    return subtotal + tax + packagingCharge + serviceCharge - discount;
  }, [subtotal, tax, packagingCharge, serviceCharge, discount]);

  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearInvoice,
    subtotal,
    tax,
    packagingCharge,
    serviceCharge,
    discount,
    total,
  };

  return <InvoiceContext.Provider value={value}>{children}</InvoiceContext.Provider>;
};
