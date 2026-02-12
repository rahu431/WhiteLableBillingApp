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
import { DialogClose, DialogFooter } from '@/components/ui/dialog';
import type { Product } from '@/lib/types';
import { appIcons } from '@/lib/data';
import React, { useEffect, memo } from 'react';

const productSchema = z.object({
  name: z.string().min(1, { message: "Product name is required" }),
  price: z.coerce.number().min(0, { message: "Price must be a positive number" }),
  icon: z.string().min(1, { message: "An icon is required" }),
  imageUrl: z.string().url({ message: "Please enter a valid URL" }),
  category: z.string().min(1, { message: "Category is required" }),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product;
  onSave: (data: ProductFormData) => void;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = memo(({ product, onSave, onCancel }) => {
  const { register, handleSubmit, control, formState: { errors }, reset } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  useEffect(() => {
    if (product) {
      reset({
          name: product.name,
          price: product.price,
          icon: appIcons.find(p => p.icon === product.icon)?.name || '',
          imageUrl: product.imageUrl,
          category: product.category,
      });
    } else {
      reset({
        name: '',
        price: 0,
        icon: '',
        imageUrl: 'https://picsum.photos/seed/1/400/300',
        category: '',
      });
    }
  }, [product, reset]);

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
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
        <Label htmlFor="category">Category</Label>
        <Input id="category" {...register('category')} />
        {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input id="imageUrl" {...register('imageUrl')} />
        {errors.imageUrl && <p className="text-sm text-destructive">{errors.imageUrl.message}</p>}
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
                {appIcons.map((iconProduct) => (
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
});

ProductForm.displayName = 'ProductForm';

export default ProductForm;
