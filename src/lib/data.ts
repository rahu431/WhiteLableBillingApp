import type { Product } from '@/lib/types';
import { Stethoscope, Syringe, Pill, Microscope, ClipboardList, Smile } from 'lucide-react';
import { PlaceHolderImages } from './placeholder-images';

const getImage = (id: string) => PlaceHolderImages.find(img => img.id === id)?.imageUrl || 'https://placehold.co/400x300';

export const products: Product[] = [
  { id: '1', name: 'Consultation', price: 50, icon: Stethoscope, imageUrl: getImage('consultation') },
  { id: '2', name: 'Dental Cleaning', price: 75, icon: Smile, imageUrl: getImage('dental-cleaning') },
  { id: '3', name: 'Lab Test', price: 120, icon: Microscope, imageUrl: getImage('lab-test') },
  { id: '4', name: 'Vaccination', price: 150, icon: Syringe, imageUrl: getImage('vaccination') },
  { id: '5', name: 'Teeth Whitening', price: 300, icon: Smile, imageUrl: getImage('teeth-whitening') },
  { id: '6', name: 'Prescription', price: 25, icon: Pill, imageUrl: getImage('prescription') },
  { id: '7', name: 'General Check-up', price: 60, icon: ClipboardList, imageUrl: getImage('general-check-up') },
  { id: '8', name: 'Filling', price: 180, icon: Smile, imageUrl: getImage('filling') },
];
