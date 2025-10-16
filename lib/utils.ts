import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility to merge Tailwind CSS classes with proper precedence
 * Used throughout the sporty design system
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}



