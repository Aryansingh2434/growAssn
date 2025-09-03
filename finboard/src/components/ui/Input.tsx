import React from 'react';
import { cn } from '../../utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className, ...props }) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-[var(--foreground)]">
          {label}
        </label>
      )}
      <input
        className={cn(
          'block w-full rounded-md border border-[var(--border-color)] bg-[var(--card-background)] text-[var(--foreground)] px-3 py-2 text-sm placeholder-[var(--muted-text)] focus:border-[var(--primary-button)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-button)]',
          error && 'border-[var(--error-color)] focus:border-[var(--error-color)] focus:ring-[var(--error-color)]',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-[var(--error-color)]">{error}</p>
      )}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({ label, error, className, children, ...props }) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-[var(--foreground)]">
          {label}
        </label>
      )}
      <select
        className={cn(
          'block w-full rounded-md border border-[var(--border-color)] bg-[var(--card-background)] text-[var(--foreground)] px-3 py-2 text-sm focus:border-[var(--primary-button)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-button)]',
          error && 'border-[var(--error-color)] focus:border-[var(--error-color)] focus:ring-[var(--error-color)]',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="text-sm text-[var(--error-color)]">{error}</p>
      )}
    </div>
  );
};
