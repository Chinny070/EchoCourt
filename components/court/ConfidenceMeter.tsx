'use client';

import { cn } from '@/lib/utils/cn';

function getColor(confidence: number) {
  if (confidence >= 75) return 'bg-[var(--mediation-green)]';
  if (confidence >= 50) return 'bg-[var(--witness-gold)]';
  if (confidence >= 25) return 'bg-[var(--tension-red)]';
  return 'bg-[var(--fog-grey)]';
}

export function ConfidenceMeter({ confidence, className }: { confidence: number; className?: string }) {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-[var(--muted)]">Confidence</span>
        <span className="font-medium">{confidence}%</span>
      </div>
      <div className="h-2 rounded-full bg-[var(--muted-paper)] overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-700', getColor(confidence))}
          style={{ width: `${Math.min(100, Math.max(0, confidence))}%` }}
        />
      </div>
    </div>
  );
}
