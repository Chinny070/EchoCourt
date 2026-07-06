'use client';

import { Card } from '@/components/ui/Card';

interface StatementStackProps {
  claimantStatement: string;
  respondentStatement?: string;
  disputedContent?: string;
}

export function StatementStack({ claimantStatement, respondentStatement, disputedContent }: StatementStackProps) {
  return (
    <div className="space-y-4">
      <Card className="border-l-4 border-l-[var(--signal-blue)]">
        <div className="text-xs uppercase tracking-wider text-[var(--signal-blue)] font-medium mb-2">Claimant Statement</div>
        <p className="text-sm leading-relaxed">{claimantStatement}</p>
      </Card>

      {respondentStatement && (
        <Card className="border-l-4 border-l-[var(--witness-gold)]">
          <div className="text-xs uppercase tracking-wider text-[var(--witness-gold)] font-medium mb-2">Respondent Statement</div>
          <p className="text-sm leading-relaxed">{respondentStatement}</p>
        </Card>
      )}

      {disputedContent && (
        <Card variant="parchment" className="border-l-4 border-l-[var(--fog-grey)]">
          <div className="text-xs uppercase tracking-wider text-[var(--fog-grey)] font-medium mb-2">Disputed Content</div>
          <p className="text-sm leading-relaxed italic">{disputedContent}</p>
        </Card>
      )}
    </div>
  );
}
