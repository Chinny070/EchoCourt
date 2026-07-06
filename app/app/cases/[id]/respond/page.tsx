'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, Textarea, Label } from '@/components/ui/Input';
import { TransactionToast } from '@/components/wallet/TransactionToast';
import { sendTransaction, waitForReceipt } from '@/lib/genlayer/client';
import { MessageSquare, Plus, X } from 'lucide-react';

type TxStatus = 'preparing' | 'confirming' | 'pending' | 'success' | 'error';

export default function RespondPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [statement, setStatement] = useState('');
  const [contextExplanation, setContextExplanation] = useState('');
  const [mitigatingFactors, setMitigatingFactors] = useState('');
  const [counterEvidence, setCounterEvidence] = useState<{ label: string; url: string; summary: string }[]>([
    { label: '', url: '', summary: '' },
  ]);
  const [txStatus, setTxStatus] = useState<TxStatus | null>(null);
  const [txHash, setTxHash] = useState('');

  function addEvidence() {
    setCounterEvidence([...counterEvidence, { label: '', url: '', summary: '' }]);
  }
  function removeEvidence(i: number) {
    setCounterEvidence(counterEvidence.filter((_, idx) => idx !== i));
  }
  function updateEvidence(i: number, field: string, value: string) {
    const updated = [...counterEvidence];
    (updated[i] as Record<string, string>)[field] = value;
    setCounterEvidence(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTxStatus('confirming');

    try {
      const result = await sendTransaction('submit_response', [
        id,
        statement,
        JSON.stringify(counterEvidence.filter(e => e.label || e.url)),
        contextExplanation,
        mitigatingFactors,
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
        <MessageSquare className="w-6 h-6 text-[var(--witness-gold)]" />
        <h1 className="text-3xl font-medium">Respond to Case</h1>
      </div>
      <p className="text-[var(--muted)] mb-2">
        Provide context, not noise. Validators will compare your response against the charter, the evidence, and the claimant&apos;s interpretation.
      </p>
      <p className="text-xs text-[var(--muted)] mb-8">Case ID: <span className="hash-text">{id}</span></p>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <h2 className="text-lg font-medium mb-4">Your Response</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="statement">Response Statement</Label>
              <Textarea
                id="statement"
                placeholder="Provide your side of the dispute. Explain what happened from your perspective..."
                value={statement}
                onChange={e => setStatement(e.target.value)}
                className="min-h-[160px]"
                required
              />
            </div>
            <div>
              <Label htmlFor="contextExplanation">Context Explanation</Label>
              <Textarea
                id="contextExplanation"
                placeholder="Explain the context: relationship, timing, audience, any prior interactions relevant to interpretation..."
                value={contextExplanation}
                onChange={e => setContextExplanation(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="mitigatingFactors">Mitigating Factors</Label>
              <Textarea
                id="mitigatingFactors"
                placeholder="Any factors that should reduce the severity of interpretation..."
                value={mitigatingFactors}
                onChange={e => setMitigatingFactors(e.target.value)}
              />
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-medium mb-4">Counter Evidence</h2>
          <div className="space-y-4">
            {counterEvidence.map((ev, i) => (
              <div key={i} className="rounded-lg bg-[var(--muted-paper)] p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[var(--muted)]">Evidence #{i + 1}</span>
                  {counterEvidence.length > 1 && (
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
            <Plus className="w-3.5 h-3.5" /> Add Counter Evidence
          </Button>
        </Card>

        <Button type="submit" size="lg" loading={txStatus === 'confirming' || txStatus === 'pending'}>
          Submit Response to GenLayer
        </Button>
      </form>

      {txStatus && <TransactionToast status={txStatus} hash={txHash || undefined} />}
    </div>
  );
}
