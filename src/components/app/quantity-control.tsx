'use client';

import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';

interface QuantityControlProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
}

export default function QuantityControl({ quantity, onIncrease, onDecrease }: QuantityControlProps) {
  return (
    <div className="flex items-center gap-1">
      <Button variant="outline" size="icon" className="h-8 w-8" onClick={onDecrease} aria-label="Decrease quantity">
        <Minus className="h-4 w-4" />
      </Button>
      <span className="w-8 text-center font-bold text-lg">{quantity}</span>
      <Button variant="outline" size="icon" className="h-8 w-8" onClick={onIncrease} aria-label="Increase quantity">
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
