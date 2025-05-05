import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date to display in user-friendly format
export function formatDate(date: Date | string): string {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(dateObj);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

// Format time to display in 12-hour format
export function formatTime(date: Date | string): string {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(dateObj);
  } catch (error) {
    console.error('Error formatting time:', error);
    return '';
  }
}

// Get badge color based on priority
export function getPriorityColor(priority: string): string {
  switch (priority.toLowerCase()) {
    case 'high':
      return 'bg-red-100 text-red-800 hover:bg-red-100';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
    case 'low':
      return 'bg-green-100 text-green-800 hover:bg-green-100';
    case 'ai':
      return 'bg-primary-100 text-primary-800 hover:bg-primary-100';
    default:
      return 'bg-neutral-100 text-neutral-800 hover:bg-neutral-100';
  }
}

// Get priority text
export function getPriorityText(priority: string): string {
  switch (priority.toLowerCase()) {
    case 'high':
      return 'High Priority';
    case 'medium':
      return 'Medium Priority';
    case 'low':
      return 'Low Priority';
    case 'ai':
      return 'AI Priority';
    default:
      return 'No Priority';
  }
}

// Calculate days elapsed between two dates
export function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.round(diffTime / oneDay);
}
