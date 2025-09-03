import React from 'react';
import { cn } from '../../utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
}

export const Card: React.FC<CardProps> = ({ children, className, title, description }) => {
  return (
    <div className={cn('bg-[var(--card-background)] rounded-lg border border-[var(--border-color)] shadow-sm', className)}>
      {(title || description) && (
        <div className="p-4 border-b border-[var(--border-color)]">
          {title && <h3 className="text-lg font-medium text-[var(--foreground)]">{title}</h3>}
          {description && <p className="text-sm text-[var(--secondary-text)] mt-1">{description}</p>}
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => {
  return (
    <div className={cn('p-4 border-b border-[var(--border-color)]', className)}>
      {children}
    </div>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className }) => {
  return (
    <div className={cn('p-4', className)}>
      {children}
    </div>
  );
};
