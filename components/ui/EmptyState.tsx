import { cn } from '@/lib/utils/cn';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-6 text-center', className)}>
      {icon && <div className="mb-4 text-[var(--fog-grey)]">{icon}</div>}
      <h3 className="text-lg font-medium text-[var(--text)] mb-2">{title}</h3>
      <p className="text-sm text-[var(--muted)] max-w-md mb-6">{description}</p>
      {action}
    </div>
  );
}
