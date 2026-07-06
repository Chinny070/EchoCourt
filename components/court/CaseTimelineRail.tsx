'use client';

import { cn } from '@/lib/utils/cn';

interface TimelineEvent {
  label: string;
  active: boolean;
  completed: boolean;
}

export function CaseTimelineRail({ status }: { status: string }) {
  const steps = ['Submitted', 'Response', 'Ready', 'Interpreting', 'Decided'];
  const statusIndex: Record<string, number> = {
    SUBMITTED: 0,
    AWAITING_RESPONSE: 1,
    READY_FOR_INTERPRETATION: 2,
    INTERPRETING: 3,
    DECIDED: 4,
    APPEALED: 4,
    FINALIZED: 4,
  };

  const current = statusIndex[status] ?? -1;

  const events: TimelineEvent[] = steps.map((label, i) => ({
    label,
    active: i === current,
    completed: i < current,
  }));

  return (
    <div className="flex flex-col gap-0">
      {events.map((e, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'w-3 h-3 rounded-full border-2 mt-0.5',
                e.completed && 'bg-[var(--mediation-green)] border-[var(--mediation-green)]',
                e.active && 'bg-[var(--violet-echo)] border-[var(--violet-echo)] pulse-glow',
                !e.completed && !e.active && 'bg-transparent border-[var(--fog-grey)]',
              )}
            />
            {i < events.length - 1 && (
              <div
                className={cn(
                  'w-0.5 h-8',
                  e.completed ? 'bg-[var(--mediation-green)]' : 'bg-[var(--border)]',
                )}
              />
            )}
          </div>
          <span
            className={cn(
              'text-xs',
              e.active && 'font-semibold text-[var(--violet-echo)]',
              e.completed && 'text-[var(--mediation-green)]',
              !e.completed && !e.active && 'text-[var(--fog-grey)]',
            )}
          >
            {e.label}
          </span>
        </div>
      ))}
    </div>
  );
}
