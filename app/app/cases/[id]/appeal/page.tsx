'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, Textarea, Label } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { TransactionToast } from '@/components/wallet/TransactionToast';
import { sendTransaction, waitForReceipt } from '@/lib/genlayer/client';
import { APPEAL_BASES } from '@/lib/genlayer/types';
import { RotateCcw, Plus, X } from 'lucide-react';

type TxStatus = 'preparing' | 'confirming' | 'pending' | 'success' | 'error';

const appealLabels: Record<string, string> = {
  missing_context: 'Missing Context',
  false_evidence: 'False Evidence',
  wrong_charter_applied: 'Wrong Charter Applied',
  new_evidence: 'New Evidence',
  disproportionate_remedy: 'Disproportionate Remedy',
  procedural_issue: 'Procedural Issue',
};

export default function AppealPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [basis, setBasis] = useState<string>(APPEAL_BASES[0]);
  const [explanation, setExplanation] = useState('');
  const [requestedCorrection, setRequestedCorrection] = useState('');
  const [newEvidence, setNewEvidence] = useState<{ label: string; url: string; summary: string }[]>([
    { label: '', url: '', summary: '' },
  ]);
  const [txStatus, setTxStatus] = useState<TxStatus | null>(null);
  const [txHash, setTxHash] = useState('');

  function addEvidence() {
    setNewEvidence([...newEvidence, { label: '', url: '', summary: '' }]);
  }
  function removeEvidence(i: number) {
    setNewEvidence(newEvidence.filter((_, idx) => idx !== i));
  }
  function updateEvidence(i: number, field: string, value: string) {
    const updated = [...newEvidence];
    (updated[i] as Record<string, string>)[field] = value;
    setNewEvidence(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTxStatus('confirming');

    try {
      const result = await sendTransaction('appeal_case', [
        id,
        basis,
        explanation,
        JSON.stringify(newEvidence.filter(e => e.label || e.url)),
        requestedCorrection,
      ]);

      if (result.status === 'error') { setTxStatus('error'); return; }

      setTxHash(result.hash);
      setTxStatus('pending');

      const receipt = await waitForReceipt(result.hash);
      if (receipt.status === 'success') {
        setTxStatus('success');
        setTimeout(() => router.push(`/app/cases/${id}`), 1500);
      } else {
        setTxStatus('error');
      }
    } catch {
      setTxStatus('error');
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <RotateCcw className="w-6 h-6 text-[var(--tension-red)]" />
        <h1 className="text-3xl font-medium">Appeal Case</h1>
      </div>
      <p className="text-[var(--muted)] mb-2">
        Submit a formal appeal against the current verdict. Provide your basis, new evidence, and requested correction.
      </p>
      <p className="text-xs text-[var(--muted)] mb-8">Case ID: <span className="hash-text">{id}</span></p>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <h2 className="text-lg font-medium mb-4">Appeal Basis</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="basis">Grounds for Appeal</Label>
              <Select id="basis" value={basis} onChange={e => setBasis(e.target.value)}>
                {APPEAL_BASES.map(b => (
                  <option key={b} value={b}>{appealLabels[b] || b}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="explanation">Explanation</Label>
              <Textarea
                id="explanation"
                placeholder="Explain why the current verdict should be reconsidered..."
                value={explanation}
                onChange={e => setExplanation(e.target.value)}
                className="min-h-[140px]"
                required
              />
            </div>
            <div>
              <Label htmlFor="requestedCorrection">Requested Correction</Label>
              <Textarea
                id="requestedCorrection"
                placeholder="What specific change to the verdict or remedy are you requesting?"
                value={requestedCorrection}
                onChange={e => setRequestedCorrection(e.target.value)}
              />
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-medium mb-4">New Evidence</h2>
          <div className="space-y-4">
            {newEvidence.map((ev, i) => (
              <div key={i} className="rounded-lg bg-[var(--muted-paper)] p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[var(--muted)]">Evidence #{i + 1}</span>
                  {newEvidence.length > 1 && (
                    <button type="button" onClick={() => removeEvidence(i)} className="text-[var(--muted)] hover:text-[var(--tension-red)]">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <Input placeholder="Label" value={ev.label} onChange={e => updateEvidence(i, 'label', e.target.value)} />
                <Input placeholder="URL" value={ev.url} onChange={e => updateEvidence(i, 'url', e.target.value)} />
                <Input placeholder="Summary" value={ev.summary} onChange={e => updateEvidence(i, 'summary', e.target.value)} />
              </div>
            ))}
          </div>
          <Button type="button" variant="ghost" size="sm" className="mt-3" onClick={addEvidence}>
            <Plus className="w-3.5 h-3.5" /> Add New Evidence
          </Button>
        </Card>

        <Button type="submit" size="lg" loading={txStatus === 'confirming' || txStatus === 'pending'}>
          Submit Appeal to GenLayer
        </Button>
      </form>

      {txStatus && <TransactionToast status={txStatus} hash={txHash || undefined} />}
    </div>
  );
}
