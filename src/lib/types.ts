import type { LucideIcon } from 'lucide-react';
import type { Timestamp } from 'firebase/firestore';

export interface Product {
  id: string;
  name: string;
  price: number;
  icon: React.ComponentType<{ className?: string }>;
  imageUrl: string;
  status: 'active' | 'archived';
  category: string;
}

export interface ProductData {
  id: string;
  name: string;
  price: number;
  icon: string;
  imageUrl: string;
  status: 'active' | 'archived';
  category: string;
}

export interface InvoiceItem extends Product {
  quantity: number;
  discount: number;
}

export interface Invoice {
  id: string;
  tokenId: number;
  userId: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  notes?: string;
  items: {
      id: string;
      name: string;
      price: number;
      quantity: number;
      discount: number;
  }[];
  subtotal: number;
  tax: number;
  packagingCharge: number;
  serviceCharge: number;
  totalDiscount: number;
  total: number;
  createdAt: Timestamp;
}
