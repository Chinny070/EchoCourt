'use client';

import { cn } from '@/lib/utils/cn';
import { ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold';

const variants: Record<Variant, string> = {
  primary: 'bg-[var(--deep-ink)] text-white hover:bg-[var(--court-slate)]',
  secondary: 'bg-[var(--muted-paper)] text-[var(--deep-ink)] border border-[var(--border)] hover:bg-[var(--soft-bone)]',
  ghost: 'bg-transparent text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--muted-paper)]',
  danger: 'bg-[var(--tension-red)] text-white hover:opacity-90',
  gold: 'bg-[var(--witness-gold)] text-white hover:opacity-90',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading && (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  ),
);

Button.displayName = 'Button';
