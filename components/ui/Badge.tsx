import { cn } from '@/lib/utils/cn';

type BadgeVariant = 'default' | 'gold' | 'blue' | 'red' | 'green' | 'violet' | 'grey';

const badgeVariants: Record<BadgeVariant, string> = {
  default: 'bg-[var(--muted-paper)] text-[var(--text)]',
  gold: 'bg-amber-100 text-amber-800',
  blue: 'bg-blue-100 text-blue-800',
  red: 'bg-red-100 text-red-800',
  green: 'bg-green-100 text-green-800',
  violet: 'bg-violet-100 text-violet-800',
  grey: 'bg-gray-100 text-gray-600',
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        badgeVariants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

const statusColors: Record<string, BadgeVariant> = {
  SUBMITTED: 'blue',
  AWAITING_RESPONSE: 'gold',
  READY_FOR_INTERPRETATION: 'violet',
  INTERPRETING: 'violet',
  DECIDED: 'green',
  APPEALED: 'red',
  FINALIZED: 'grey',
  DISMISSED: 'grey',
  CANCELLED: 'grey',
  INSUFFICIENT_CONTEXT: 'gold',
};

export function StatusBadge({ status }: { status: string }) {
  const variant = statusColors[status] || 'default';
  const label = status.replace(/_/g, ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase());
  return <Badge variant={variant}>{label}</Badge>;
}
