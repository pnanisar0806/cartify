import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getSwiggyUrl(ingredient: string): string {
  return `https://www.swiggy.com/instamart/search?custom_back=true&query=${encodeURIComponent(ingredient)}`;
}

export function getBlinkitUrl(ingredient: string): string {
  return `https://blinkit.com/s/?q=${encodeURIComponent(ingredient)}`;
}

