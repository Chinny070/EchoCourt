'use client';

import type { EvidenceLink } from '@/lib/genlayer/types';
import { ExternalLink } from 'lucide-react';

export function EvidenceRibbon({ evidence }: { evidence: EvidenceLink[] }) {
  if (!evidence.length) {
    return (
      <div className="text-sm text-[var(--muted)] italic py-3">No evidence submitted.</div>
    );
  }

  return (
    <div className="space-y-2">
      {evidence.map((item, i) => (
        <div key={i} className="flex items-start gap-3 rounded-lg bg-[var(--muted-paper)] px-4 py-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{item.label}</span>
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--signal-blue)] hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
            <p className="text-xs text-[var(--muted)] mt-0.5">{item.summary}</p>
            {item.hash && <span className="hash-text">{item.hash}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
