import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return `₹${price.toLocaleString('en-IN')}`;
}

export function generateOrderId(): string {
  return `ORD-${Date.now().toString(36).toUpperCase()}`;
}

/**
 * Convert Google Drive share link to direct image URL
 * Supports various Google Drive URL formats:
 * - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 * - https://drive.google.com/open?id=FILE_ID
 * - https://drive.google.com/uc?id=FILE_ID
 */
export function getGoogleDriveImageUrl(url: string): string {
  if (!url) return '';
  
  // Already a direct URL or not a Google Drive link
  if (!url.includes('drive.google.com') && !url.includes('docs.google.com')) {
    return url;
  }
  
  let fileId = '';
  
  // Format: /file/d/FILE_ID/
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) {
    fileId = fileMatch[1];
  }
  
  // Format: ?id=FILE_ID or &id=FILE_ID
  if (!fileId) {
    const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idMatch) {
      fileId = idMatch[1];
    }
  }
  
  // Format: /uc?export=view&id=FILE_ID
  if (!fileId) {
    const ucMatch = url.match(/\/uc\?.*id=([a-zA-Z0-9_-]+)/);
    if (ucMatch) {
      fileId = ucMatch[1];
    }
  }
  
  if (fileId) {
    // Use the thumbnail endpoint which works better with Next.js Image
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }
  
  return url;
}

/**
 * Check if a URL is a Google Drive link
 */
export function isGoogleDriveUrl(url: string): boolean {
  return url?.includes('drive.google.com') || url?.includes('docs.google.com') || url?.includes('googleusercontent.com');
}
