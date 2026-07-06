'use client';

import { cn } from '@/lib/utils/cn';
import type { EchoVerdict } from '@/lib/genlayer/types';

const interpretationColors: Record<string, string> = {
  no_violation: 'border-green-400 text-green-700 bg-green-50',
  minor_norm_drift: 'border-amber-400 text-amber-700 bg-amber-50',
  contextual_misunderstanding: 'border-blue-400 text-blue-700 bg-blue-50',
  careless_harm: 'border-orange-400 text-orange-700 bg-orange-50',
  clear_violation: 'border-red-400 text-red-700 bg-red-50',
  severe_violation: 'border-red-600 text-red-800 bg-red-100',
  bad_faith_claim: 'border-gray-400 text-gray-700 bg-gray-50',
  insufficient_context: 'border-violet-400 text-violet-700 bg-violet-50',
};

export function VerdictSeal({ verdict }: { verdict: EchoVerdict }) {
  const colorClass = interpretationColors[verdict.primaryInterpretation] || 'border-gray-300 text-gray-600 bg-gray-50';
  const label = verdict.primaryInterpretation.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());

  return (
    <div className={cn('seal-stamp inline-flex flex-col items-center gap-3 rounded-2xl border-2 px-8 py-6', colorClass)}>
      <div className="text-xs uppercase tracking-[0.15em] font-medium opacity-70">Interpretation</div>
      <div className="text-2xl font-medium font-[family-name:var(--font-inter)]">{label}</div>
      <div className="flex items-center gap-1.5 text-sm">
        <span className="opacity-60">Confidence</span>
        <span className="font-semibold">{verdict.confidence}%</span>
      </div>
    </div>
  );
}
