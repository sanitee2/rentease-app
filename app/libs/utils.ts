import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import * as mdIcons from "react-icons/md";
import * as faIcons from "react-icons/fa";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
} 


const allIcons = {
  ...faIcons,
  ...mdIcons,
};

// Function to get the icon component dynamically
export const getIconComponent = (iconName: string) => {
  return allIcons[iconName as keyof typeof allIcons] || faIcons.FaQuestionCircle; // Default icon if not found
};