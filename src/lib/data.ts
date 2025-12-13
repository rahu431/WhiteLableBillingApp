import type { Product } from '@/lib/types';
import { Stethoscope, Syringe, Pill, Microscope, ClipboardList, Smile } from 'lucide-react';

export const products: Product[] = [
  { id: '1', name: 'Consultation', price: 50, icon: Stethoscope },
  { id: '2', name: 'Dental Cleaning', price: 75, icon: Smile },
  { id: '3', name: 'Lab Test', price: 120, icon: Microscope },
  { id: '4', name: 'Vaccination', price: 150, icon: Syringe },
  { id: '5', name: 'Teeth Whitening', price: 300, icon: Smile },
  { id: '6', name: 'Prescription', price: 25, icon: Pill },
  { id: '7', name: 'General Check-up', price: 60, icon: ClipboardList },
  { id: '8', name: 'Filling', price: 180, icon: Smile },
];
