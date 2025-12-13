'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DialogFooter } from '@/components/ui/dialog';
import type { Product } from '@/lib/types';
import { products as productIcons } from '@/lib/data';
import { useEffect } from 'react';

const productSchema = z.object({
  name: z.string().min(1, { message: "Product name is required" }),
  price: z.coerce.number().min(0, { message: "Price must be a positive number" }),
  icon: z.string().min(1, { message: "An icon is required" }),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product;
  onSave: (data: ProductFormData) => void;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSave, onCancel }) => {
  const { register, handleSubmit, control, formState: { errors }, reset } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || '',
      price: product?.price || 0,
      icon: productIcons.find(p => p.icon === product?.icon)?.name || ''
    }
  });

  useEffect(() => {
    reset({
        name: product?.name || '',
        price: product?.price || 0,
        icon: productIcons.find(p => p.icon === product?.icon)?.name || ''
    });
  }, [product, reset]);

  const onSubmit = (data: ProductFormData) => {
    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Product Name</Label>
        <Input id="name" {...register('name')} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">Price</Label>
        <Input id="price" type="number" step="0.01" {...register('price')} />
        {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="icon">Icon</Label>
        <Controller
          name="icon"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Select an icon" />
              </SelectTrigger>
              <SelectContent>
                {productIcons.map((iconProduct) => (
                  <SelectItem key={iconProduct.id} value={iconProduct.name}>
                    <div className="flex items-center gap-2">
                      <iconProduct.icon className="w-4 h-4" />
                      <span>{iconProduct.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.icon && <p className="text-sm text-destructive">{errors.icon.message}</p>}
      </div>

      <DialogFooter>
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save Product</Button>
      </DialogFooter>
    </form>
  );
};

export default ProductForm;
