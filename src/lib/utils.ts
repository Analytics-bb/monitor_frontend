import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Объединяет className с учётом Tailwind-конфликтов (shadcn/ui). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
