// Combine class names (simple version without clsx dependency)
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Format price with currency
export function formatPrice(price: number, locale: string = 'pt-PT'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: price % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(price);
}

// Format price simple (€X or €X.XX)
export function formatPriceSimple(price: number): string {
  if (price % 1 === 0) {
    return `€${price}`;
  }
  return `€${price.toFixed(2).replace('.', ',')}`;
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Generate unique ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// Smooth scroll to element
export function scrollToElement(elementId: string, offset: number = 0): void {
  const element = document.getElementById(elementId);
  if (element) {
    const top = element.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({
      top,
      behavior: 'smooth',
    });
  }
}

// Check if we're on the client
export const isClient = typeof window !== 'undefined';

// Check if device is touch-enabled
export function isTouchDevice(): boolean {
  if (!isClient) return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// Preload image
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

// Get scroll progress (0 to 1)
export function getScrollProgress(): number {
  if (!isClient) return 0;
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  return docHeight > 0 ? scrollTop / docHeight : 0;
}
