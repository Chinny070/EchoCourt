'use client';

import type { EchoVerdict } from '@/lib/genlayer/types';
import { Badge } from '@/components/ui/Badge';

function formatLabel(s: string) {
  return s.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
}

const fieldVariant: Record<string, 'default' | 'gold' | 'blue' | 'red' | 'green' | 'violet' | 'grey'> = {
  no_violation: 'green',
  minor_norm_drift: 'gold',
  contextual_misunderstanding: 'blue',
  careless_harm: 'red',
  clear_violation: 'red',
  severe_violation: 'red',
  bad_faith_claim: 'grey',
  insufficient_context: 'violet',
  none: 'green',
  low: 'green',
  medium: 'gold',
  high: 'red',
  severe: 'red',
  unclear: 'grey',
  likely_benign: 'green',
  careless: 'gold',
  reckless: 'red',
  targeted: 'red',
  manipulative: 'red',
  strong_context: 'green',
  partial_context: 'gold',
  thin_context: 'red',
  conflicting_context: 'red',
  insufficient_context_cq: 'violet',
  aligned: 'green',
  borderline: 'gold',
  misaligned: 'red',
  clearly_violated: 'red',
  not_applicable: 'grey',
  no_action: 'green',
  private_clarification: 'blue',
  public_clarification: 'blue',
  mediation: 'violet',
  warning: 'gold',
  apology_requested: 'gold',
  temporary_restriction: 'red',
  role_review: 'red',
  removal_recommended: 'red',
  dismiss_claim: 'grey',
  request_more_context: 'violet',
};

function getVariant(value: string) {
  return fieldVariant[value] || 'default';
}

const rows: { label: string; key: keyof EchoVerdict }[] = [
  { label: 'Primary Interpretation', key: 'primaryInterpretation' },
  { label: 'Impact Level', key: 'impactLevel' },
  { label: 'Intent Assessment', key: 'intentAssessment' },
  { label: 'Context Quality', key: 'contextQuality' },
  { label: 'Charter Alignment', key: 'charterAlignment' },
  { label: 'Recommended Remedy', key: 'recommendedRemedy' },
];

export function InterpretationGrid({ verdict }: { verdict: EchoVerdict }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {rows.map(({ label, key }) => {
        const val = String(verdict[key] || '');
        return (
          <div key={key} className="flex items-center justify-between rounded-lg bg-[var(--muted-paper)] px-4 py-3">
            <span className="text-xs text-[var(--muted)]">{label}</span>
            <Badge variant={getVariant(val)}>{formatLabel(val)}</Badge>
          </div>
        );
      })}
    </div>
  );
}
