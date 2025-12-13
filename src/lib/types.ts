import type { LucideIcon } from 'lucide-react';

export interface Product {
  id: string;
  name: string;
  price: number;
  icon: React.ComponentType<{ className?: string }>;
}

export interface InvoiceItem extends Product {
  quantity: number;
  discount: number;
}
