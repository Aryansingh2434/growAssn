import React from 'react';
import { cn } from '../../utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    primary: 'bg-[var(--primary-button)] text-white hover:bg-[var(--primary-button-hover)] focus:ring-2 focus:ring-[var(--accent-color)] shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5',
    secondary: 'bg-slate-600 text-white hover:bg-slate-700 focus:ring-2 focus:ring-slate-500 dark:bg-slate-700 dark:hover:bg-slate-600 shadow-md hover:shadow-lg transition-all duration-200',
    outline: 'border-2 border-[var(--border-color)] bg-[var(--card-background)] text-[var(--foreground)] hover:bg-[var(--primary-button)] hover:text-white hover:border-[var(--primary-button)] focus:ring-2 focus:ring-[var(--accent-color)] transition-all duration-200 shadow-sm hover:shadow-md',
    ghost: 'text-[var(--foreground)] hover:bg-[var(--primary-button)] hover:text-white focus:ring-2 focus:ring-[var(--accent-color)] transition-all duration-200 rounded-lg',
    destructive: 'bg-red-500 text-white hover:bg-red-600 focus:ring-2 focus:ring-red-400 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  
  return (
    <button
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
};
