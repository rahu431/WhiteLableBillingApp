
"use client";

import React, { createContext, useState, useMemo, useCallback } from 'react';
import type { InvoiceItem, Product } from '@/lib/types';
import { TAX_RATE, DISCOUNT_AMOUNT, PACKAGING_CHARGE, SERVICE_CHARGE } from '@/lib/constants';

interface InvoiceContextType {
  items: InvoiceItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, newQuantity: number) => void;
  updateItemPrice: (productId: string, newPrice: number) => void;
  updateItemDiscount: (productId: string, newDiscount: number) => void;
  clearInvoice: () => void;
  subtotal: number;
  tax: number;
  packagingCharge: number;
  serviceCharge: number;
  totalDiscount: number;
  total: number;
}

export const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export const InvoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<InvoiceItem[]>([]);

  const addItem = useCallback((product: Product, quantity = 1) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prevItems, { ...product, quantity: quantity, discount: 0 }];
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

  const updateItemPrice = useCallback((productId: string, newPrice: number) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, price: newPrice >= 0 ? newPrice : 0 } : item
      )
    );
  }, []);

  const updateItemDiscount = useCallback((productId: string, newDiscount: number) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, discount: newDiscount >= 0 ? newDiscount : 0 } : item
      )
    );
  }, []);

  const clearInvoice = useCallback(() => {
    setItems([]);
  }, []);

  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [items]);
  
  const totalDiscount = useMemo(() => {
    const itemDiscounts = items.reduce((acc, item) => acc + (item.discount || 0) * item.quantity, 0);
    return itemDiscounts + DISCOUNT_AMOUNT;
  }, [items]);

  const tax = useMemo(() => {
    return (subtotal - totalDiscount) * TAX_RATE;
  }, [subtotal, totalDiscount]);
  
  const packagingCharge = PACKAGING_CHARGE;
  const serviceCharge = SERVICE_CHARGE;

  const total = useMemo(() => {
    return subtotal + tax + packagingCharge + serviceCharge - totalDiscount;
  }, [subtotal, tax, packagingCharge, serviceCharge, totalDiscount]);

  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    updateItemPrice,
    updateItemDiscount,
    clearInvoice,
    subtotal,
    tax,
    packagingCharge,
    serviceCharge,
    totalDiscount,
    total,
  };

  return <InvoiceContext.Provider value={value}>{children}</InvoiceContext.Provider>;
};
