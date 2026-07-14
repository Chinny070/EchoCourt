'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, Textarea, Label } from '@/components/ui/Input';
import { TransactionToast } from '@/components/wallet/TransactionToast';
import { sendTransaction, waitForReceipt } from '@/lib/genlayer/client';
import { MessageSquare, Plus, X, ImagePlus } from 'lucide-react';

type TxStatus = 'preparing' | 'confirming' | 'pending' | 'success' | 'error';

function resizeImage(file: File, maxWidth: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width;
        let h = img.height;
        if (w > maxWidth) {
          h = Math.round((h * maxWidth) / w);
          w = maxWidth;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('No canvas context')); return; }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function RespondPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [statement, setStatement] = useState('');
  const [contextExplanation, setContextExplanation] = useState('');
  const [mitigatingFactors, setMitigatingFactors] = useState('');
  const [counterEvidence, setCounterEvidence] = useState<{ label: string; url: string; summary: string; image?: string }[]>([
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
  async function handleImageUpload(i: number, file: File) {
    try {
      const dataUrl = await resizeImage(file, 800);
      const updated = [...counterEvidence];
      updated[i] = { ...updated[i], image: dataUrl };
      if (!updated[i].label) {
        updated[i].label = file.name.replace(/\.[^.]+$/, '');
      }
      setCounterEvidence(updated);
    } catch { /* ignore */ }
  }
  function removeImage(i: number) {
    const updated = [...counterEvidence];
    updated[i] = { ...updated[i], image: undefined };
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
                <Input placeholder="URL (optional if uploading screenshot)" value={ev.url} onChange={e => updateEvidence(i, 'url', e.target.value)} />
                <Input placeholder="Summary" value={ev.summary} onChange={e => updateEvidence(i, 'summary', e.target.value)} />
                {ev.image ? (
                  <div className="relative mt-1">
                    <img src={ev.image} alt={ev.label || 'Evidence screenshot'} className="rounded-lg border border-[var(--border)] max-h-48 object-contain" />
                    <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center gap-2 text-xs text-[var(--signal-blue)] cursor-pointer hover:underline mt-1">
                    <ImagePlus className="w-4 h-4" />
                    Upload Screenshot
                    <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(i, f); }} />
                  </label>
                )}
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
