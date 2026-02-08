import { Stethoscope, Syringe, Pill, Microscope, ClipboardList, Smile, Coffee } from 'lucide-react';
import type { ComponentType } from 'react';

// This is for the form dropdown
export const appIcons: {
  id: string;
  name: string;
  icon: ComponentType<{ className?: string }>;
}[] = [
  { id: '1', name: 'Stethoscope', icon: Stethoscope },
  { id: '2', name: 'Syringe', icon: Syringe },
  { id: '3', name: 'Pill', icon: Pill },
  { id: '4', name: 'Microscope', icon: Microscope },
  { id: '5', name: 'ClipboardList', icon: ClipboardList },
  { id: '6', name: 'Smile', icon: Smile },
  { id: '7', name: 'Coffee', icon: Coffee },
];


export const getIconComponent = (iconName: string): ComponentType<{ className?: string }> => {
    const iconInfo = appIcons.find(i => i.name === iconName);
    return iconInfo ? iconInfo.icon : Stethoscope; // Default to Stethoscope
};
