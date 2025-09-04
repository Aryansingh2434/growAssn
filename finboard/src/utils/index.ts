import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercentage(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

export function formatNumber(value: number): string {
  if (value >= 1e9) {
    return `${(value / 1e9).toFixed(1)}B`;
  }
  if (value >= 1e6) {
    return `${(value / 1e6).toFixed(1)}M`;
  }
  if (value >= 1e3) {
    return `${(value / 1e3).toFixed(1)}K`;
  }
  return value.toLocaleString();
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function getColorForChange(change: number): string {
  if (change > 0) return 'text-green-600';
  if (change < 0) return 'text-red-600';
  return 'text-gray-600';
}

export function getBgColorForChange(change: number): string {
  if (change > 0) return 'bg-green-100 border-green-200';
  if (change < 0) return 'bg-red-100 border-red-200';
  return 'bg-gray-100 border-gray-200';
}

export function validateApiKey(key: string, provider: string): boolean {
  if (!key || key.trim().length === 0) return false;
  
  switch (provider) {
    case 'alphavantage':
      return key.length >= 8 && /^[A-Z0-9]+$/.test(key);
    case 'finnhub':
      return key.length >= 10 && /^[a-zA-Z0-9]+$/.test(key);
    default:
      return key.length >= 8;
  }
}

export function getGridPosition(index: number, cols = 3): { x: number; y: number } {
  return {
    x: index % cols,
    y: Math.floor(index / cols),
  };
}

export function getWidgetSize(type: string): { width: number; height: number } {
  const sizes = {
    card: { width: 300, height: 200 },
    table: { width: 600, height: 400 },
    chart: { width: 500, height: 350 },
  };
  
  return sizes[type as keyof typeof sizes] || sizes.card;
}
