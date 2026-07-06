'use client';

import { ExternalLink, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { explorerTxUrl } from '@/lib/genlayer/network';

type TxStatus = 'preparing' | 'confirming' | 'pending' | 'success' | 'error';

interface TransactionToastProps {
  status: TxStatus;
  hash?: string;
  message?: string;
}

const icons: Record<TxStatus, React.ReactNode> = {
  preparing: <Loader2 className="w-4 h-4 animate-spin text-[var(--violet-echo)]" />,
  confirming: <Loader2 className="w-4 h-4 animate-spin text-[var(--witness-gold)]" />,
  pending: <Loader2 className="w-4 h-4 animate-spin text-[var(--signal-blue)]" />,
  success: <CheckCircle2 className="w-4 h-4 text-[var(--mediation-green)]" />,
  error: <XCircle className="w-4 h-4 text-[var(--tension-red)]" />,
};

const labels: Record<TxStatus, string> = {
  preparing: 'Preparing transaction...',
  confirming: 'Confirm in wallet...',
  pending: 'Transaction pending...',
  success: 'Transaction confirmed',
  error: 'Transaction failed',
};

export function TransactionToast({ status, hash, message }: TransactionToastProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 slide-up">
      <div className="flex items-center gap-3 rounded-xl bg-white border border-[var(--border)] shadow-lg px-4 py-3 min-w-[280px]">
        {icons[status]}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium">{message || labels[status]}</div>
          {hash && (
            <a
              href={explorerTxUrl(hash)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-[var(--signal-blue)] hover:underline mt-0.5"
            >
              View on explorer <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
