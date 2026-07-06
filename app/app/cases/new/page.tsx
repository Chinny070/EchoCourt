'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, Textarea, Label } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { TransactionToast } from '@/components/wallet/TransactionToast';
import { sendTransaction, waitForReceipt } from '@/lib/genlayer/client';
import { CASE_TYPES, CASE_TYPE_LABELS } from '@/lib/genlayer/types';
import { FileWarning, Plus, X } from 'lucide-react';

type TxStatus = 'preparing' | 'confirming' | 'pending' | 'success' | 'error';

export default function CaseIntakePage() {
  const router = useRouter();
  const [communityId, setCommunityId] = useState('');
  const [caseTitle, setCaseTitle] = useState('');
  const [caseType, setCaseType] = useState(CASE_TYPES[0]);
  const [respondent, setRespondent] = useState('');
  const [claimSummary, setClaimSummary] = useState('');
  const [requestedOutcome, setRequestedOutcome] = useState('');
  const [contextNotes, setContextNotes] = useState('');
  const [bondAmount, setBondAmount] = useState('0');

  const [evidenceLinks, setEvidenceLinks] = useState<{ label: string; url: string; summary: string }[]>([
    { label: '', url: '', summary: '' },
  ]);

  const [txStatus, setTxStatus] = useState<TxStatus | null>(null);
  const [txHash, setTxHash] = useState('');

  function addEvidence() {
    setEvidenceLinks([...evidenceLinks, { label: '', url: '', summary: '' }]);
  }
  function removeEvidence(i: number) {
    setEvidenceLinks(evidenceLinks.filter((_, idx) => idx !== i));
  }
  function updateEvidence(i: number, field: string, value: string) {
    const updated = [...evidenceLinks];
    (updated[i] as Record<string, string>)[field] = value;
    setEvidenceLinks(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTxStatus('confirming');

    const caseId = `case-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    try {
      const result = await sendTransaction('submit_case', [
        caseId,
        communityId,
        caseTitle,
        caseType,
        respondent,
        claimSummary,
        requestedOutcome,
        JSON.stringify(evidenceLinks.filter(e => e.label || e.url)),
        contextNotes,
        bondAmount,
      ]);

      if (result.status === 'error') {
        setTxStatus('error');
        return;
      }

      setTxHash(result.hash);
      setTxStatus('pending');

      const receipt = await waitForReceipt(result.hash);
      if (receipt.status === 'success') {
        setTxStatus('success');
        setTimeout(() => router.push(`/app/cases/${caseId}`), 1500);
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
        <FileWarning className="w-6 h-6 text-[var(--tension-red)]" />
        <h1 className="text-3xl font-medium">Open a Case</h1>
      </div>
      <p className="text-[var(--muted)] mb-8">
        Submit a dispute for interpretation. Provide as much context as possible — validators will evaluate tone, intent, impact, and charter alignment.
      </p>

      {/* Warning */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
        <p className="text-sm text-amber-800">
          EchoCourt is for structured community interpretation. Do not submit private, illegal, or dangerous personal information.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <h2 className="text-lg font-medium mb-4">Case Details</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="communityId">Community ID</Label>
              <Input id="communityId" placeholder="my-dao-community" value={communityId} onChange={e => setCommunityId(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="caseTitle">Case Title</Label>
              <Input id="caseTitle" placeholder="Proposal Thread Misrepresentation" value={caseTitle} onChange={e => setCaseTitle(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="caseType">Case Type</Label>
              <Select id="caseType" value={caseType} onChange={e => setCaseType(e.target.value)}>
                {CASE_TYPES.map(t => (
                  <option key={t} value={t}>{CASE_TYPE_LABELS[t]}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="respondent">Respondent (wallet address or identifier)</Label>
              <Input id="respondent" placeholder="0x..." value={respondent} onChange={e => setRespondent(e.target.value)} required />
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-medium mb-4">Claim</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="claimSummary">Claimant Statement</Label>
              <Textarea
                id="claimSummary"
                placeholder="Describe the disputed action, what happened, and why you believe it violates community standards..."
                value={claimSummary}
                onChange={e => setClaimSummary(e.target.value)}
                className="min-h-[140px]"
                required
              />
            </div>
            <div>
              <Label htmlFor="requestedOutcome">Requested Outcome</Label>
              <Textarea
                id="requestedOutcome"
                placeholder="What resolution are you requesting? e.g. Public clarification, mediation, warning..."
                value={requestedOutcome}
                onChange={e => setRequestedOutcome(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="contextNotes">Context Notes</Label>
              <Textarea
                id="contextNotes"
                placeholder="Any additional context: timing, audience, relationship between parties, prior conduct..."
                value={contextNotes}
                onChange={e => setContextNotes(e.target.value)}
              />
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-medium mb-4">Evidence</h2>
          <p className="text-xs text-[var(--muted)] mb-4">Provide links and summaries for each piece of evidence.</p>
          <div className="space-y-4">
            {evidenceLinks.map((ev, i) => (
              <div key={i} className="rounded-lg bg-[var(--muted-paper)] p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[var(--muted)]">Evidence #{i + 1}</span>
                  {evidenceLinks.length > 1 && (
                    <button type="button" onClick={() => removeEvidence(i)} className="text-[var(--muted)] hover:text-[var(--tension-red)]">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <Input placeholder="Label (e.g. Discord screenshot)" value={ev.label} onChange={e => updateEvidence(i, 'label', e.target.value)} />
                <Input placeholder="URL" value={ev.url} onChange={e => updateEvidence(i, 'url', e.target.value)} />
                <Input placeholder="Brief summary of what this evidence shows" value={ev.summary} onChange={e => updateEvidence(i, 'summary', e.target.value)} />
              </div>
            ))}
          </div>
          <Button type="button" variant="ghost" size="sm" className="mt-3" onClick={addEvidence}>
            <Plus className="w-3.5 h-3.5" /> Add Evidence
          </Button>
        </Card>

        <Card>
          <h2 className="text-lg font-medium mb-4">Bond</h2>
          <div>
            <Label htmlFor="bondAmount">Bond Amount</Label>
            <Input id="bondAmount" type="text" placeholder="0" value={bondAmount} onChange={e => setBondAmount(e.target.value)} />
            <p className="text-xs text-[var(--muted)] mt-1">If the verdict is bad_faith_claim, this bond may be forfeited.</p>
          </div>
        </Card>

        <Button type="submit" size="lg" loading={txStatus === 'confirming' || txStatus === 'pending'}>
          Submit Case to GenLayer
        </Button>
      </form>

      {txStatus && <TransactionToast status={txStatus} hash={txHash || undefined} />}
    </div>
  );
}
