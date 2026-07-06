'use client';

import type { CommunityCharter } from '@/lib/genlayer/types';
import { Card } from '@/components/ui/Card';

export function CharterLens({ charter }: { charter: CommunityCharter }) {
  return (
    <Card variant="parchment" className="space-y-4">
      <h4 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">Charter Lens</h4>
      <div>
        <div className="text-xs text-[var(--muted)] mb-1">Summary</div>
        <p className="text-sm">{charter.summary}</p>
      </div>
      {charter.allowedNorms.length > 0 && (
        <div>
          <div className="text-xs text-[var(--muted)] mb-1">Allowed Norms</div>
          <ul className="text-sm space-y-0.5">
            {charter.allowedNorms.map((n, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-[var(--mediation-green)] mt-0.5">+</span>
                <span>{n}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {charter.forbiddenBehaviours.length > 0 && (
        <div>
          <div className="text-xs text-[var(--muted)] mb-1">Forbidden Behaviours</div>
          <ul className="text-sm space-y-0.5">
            {charter.forbiddenBehaviours.map((b, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-[var(--tension-red)] mt-0.5">-</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {charter.remedyPolicy && (
        <div>
          <div className="text-xs text-[var(--muted)] mb-1">Remedy Policy</div>
          <p className="text-sm">{charter.remedyPolicy}</p>
        </div>
      )}
    </Card>
  );
}
