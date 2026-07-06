import { cn } from '@/lib/utils/cn';
import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'parchment' | 'dark';
}

const cardVariants = {
  default: 'bg-white border border-[var(--border)]',
  parchment: 'bg-[var(--muted-paper)] border border-[var(--border)]',
  dark: 'bg-[var(--deep-ink)] text-white border border-[var(--court-slate)]',
};

export function Card({ className, variant = 'default', children, ...props }: CardProps) {
  return (
    <div className={cn('rounded-xl p-5', cardVariants[variant], className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-lg font-medium', className)} {...props}>
      {children}
    </h3>
  );
}
