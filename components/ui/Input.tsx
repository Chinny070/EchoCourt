import { cn } from '@/lib/utils/cn';
import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react';

const baseInput =
  'w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--fog-grey)] focus:outline-none focus:ring-2 focus:ring-[var(--violet-echo)]/30 focus:border-[var(--violet-echo)] transition-colors';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(baseInput, className)} {...props} />
  ),
);
Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(baseInput, 'min-h-[100px] resize-y', className)} {...props} />
  ),
);
Textarea.displayName = 'Textarea';

export function Label({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cn('block text-sm font-medium text-[var(--text)] mb-1.5', className)} {...props}>
      {children}
    </label>
  );
}
