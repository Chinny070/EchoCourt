'use client';

import { useState } from 'react';
import type { EvidenceLink } from '@/lib/genlayer/types';
import { ExternalLink, ZoomIn, X } from 'lucide-react';

function ImageLightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-1.5 hover:bg-black/70">
        <X className="w-5 h-5" />
      </button>
      <img src={src} alt={alt} className="max-w-full max-h-[90vh] rounded-lg object-contain" onClick={e => e.stopPropagation()} />
    </div>
  );
}

export function EvidenceRibbon({ evidence }: { evidence: EvidenceLink[] }) {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  if (!evidence.length) {
    return (
      <div className="text-sm text-[var(--muted)] italic py-3">No evidence submitted.</div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {evidence.map((item, i) => (
          <div key={i} className="rounded-lg bg-[var(--muted-paper)] px-4 py-3">
            <div className="flex items-start gap-3">
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
            {item.image && (
              <div className="mt-2 relative group cursor-pointer" onClick={() => setLightboxSrc(item.image!)}>
                <img
                  src={item.image}
                  alt={item.label || 'Evidence screenshot'}
                  className="rounded-lg border border-[var(--border)] max-h-52 object-contain"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-colors flex items-center justify-center">
                  <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {lightboxSrc && <ImageLightbox src={lightboxSrc} alt="Evidence screenshot" onClose={() => setLightboxSrc(null)} />}
    </>
  );
}
