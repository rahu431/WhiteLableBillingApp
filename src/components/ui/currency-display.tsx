'use client';
import React, { memo } from 'react';
import { useSettings } from "@/context/settings-context";
import { IndianRupee } from "lucide-react";
import { cn } from "@/lib/utils";

const CurrencyDisplay: React.FC<{ value: number, className?: string }> = memo(({ value, className }) => {
  const { settings, formatCurrency } = useSettings();

  if (settings?.currency === 'INR') {
    const isNegative = value < 0;
    const formattedValue = new Intl.NumberFormat('en-IN', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(isNegative ? -value : value);
    
    return (
      <span className={cn("inline-flex items-center gap-1", className)}>
        {isNegative && '-'}<IndianRupee className="h-[0.8em] w-[0.8em]" />
        {formattedValue}
      </span>
    );
  }

  return <span className={className}>{formatCurrency(value)}</span>;
});

CurrencyDisplay.displayName = 'CurrencyDisplay';

export default CurrencyDisplay;
