'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, Textarea, Label } from '@/components/ui/Input';
import { TransactionToast } from '@/components/wallet/TransactionToast';
import { sendTransaction, waitForReceipt } from '@/lib/genlayer/client';
import { ScrollText, Plus, X } from 'lucide-react';

type TxStatus = 'preparing' | 'confirming' | 'pending' | 'success' | 'error';

export default function CharterPage() {
  const [communityId, setCommunityId] = useState('');
  const [communityName, setCommunityName] = useState('');
  const [charterTitle, setCharterTitle] = useState('');
  const [charterSummary, setCharterSummary] = useState('');
  const [allowedNorms, setAllowedNorms] = useState<string[]>(['']);
  const [forbiddenBehaviours, setForbiddenBehaviours] = useState<string[]>(['']);
  const [toneExpectations, setToneExpectations] = useState('');
  const [remedyPolicy, setRemedyPolicy] = useState('');
  const [appealPolicy, setAppealPolicy] = useState('');
  const [bondAmount, setBondAmount] = useState('0');
  const [txStatus, setTxStatus] = useState<TxStatus | null>(null);
  const [txHash, setTxHash] = useState('');

  function addNorm() { setAllowedNorms([...allowedNorms, '']); }
  function removeNorm(i: number) { setAllowedNorms(allowedNorms.filter((_, idx) => idx !== i)); }
  function updateNorm(i: number, v: string) { const n = [...allowedNorms]; n[i] = v; setAllowedNorms(n); }

  function addForbidden() { setForbiddenBehaviours([...forbiddenBehaviours, '']); }
  function removeForbidden(i: number) { setForbiddenBehaviours(forbiddenBehaviours.filter((_, idx) => idx !== i)); }
  function updateForbidden(i: number, v: string) { const n = [...forbiddenBehaviours]; n[i] = v; setForbiddenBehaviours(n); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTxStatus('confirming');

    try {
      const result = await sendTransaction('create_charter', [
        communityId,
        communityName,
        charterTitle,
        charterSummary,
        JSON.stringify(allowedNorms.filter(Boolean)),
        JSON.stringify(forbiddenBehaviours.filter(Boolean)),
        toneExpectations,
        remedyPolicy,
        appealPolicy,
        bondAmount,
      ]);

      if (result.status === 'error') {
        setTxStatus('error');
        return;
      }

      setTxHash(result.hash);
      setTxStatus('pending');

      const receipt = await waitForReceipt(result.hash);
      setTxStatus(receipt.status === 'success' ? 'success' : 'error');
    } catch {
      setTxStatus('error');
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <ScrollText className="w-6 h-6 text-[var(--witness-gold)]" />
        <h1 className="text-3xl font-medium">Create Community Charter</h1>
      </div>
      <p className="text-[var(--muted)] mb-8">
        Define the standards your community wants EchoCourt to interpret against. This charter becomes the reference for all future case judgements.
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <h2 className="text-lg font-medium mb-4">Community Identity</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="communityId">Community ID</Label>
              <Input id="communityId" placeholder="my-dao-community" value={communityId} onChange={e => setCommunityId(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="communityName">Community Name</Label>
              <Input id="communityName" placeholder="My DAO Community" value={communityName} onChange={e => setCommunityName(e.target.value)} required />
            </div>
          </div>
          <div className="mt-4">
            <Label htmlFor="charterTitle">Charter Title</Label>
            <Input id="charterTitle" placeholder="Community Conduct Standards" value={charterTitle} onChange={e => setCharterTitle(e.target.value)} required />
          </div>
          <div className="mt-4">
            <Label htmlFor="charterSummary">Charter Summary</Label>
            <Textarea
              id="charterSummary"
              placeholder="This community allows strong disagreement, jokes, criticism, and debate. It does not allow targeted harassment, threats, deliberate humiliation..."
              value={charterSummary}
              onChange={e => setCharterSummary(e.target.value)}
              required
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-medium mb-4">Allowed Norms</h2>
          <p className="text-xs text-[var(--muted)] mb-3">Behaviours and communication styles your community accepts.</p>
          <div className="space-y-2">
            {allowedNorms.map((n, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[var(--mediation-green)] text-sm flex-shrink-0">+</span>
                <Input placeholder="e.g. Strong disagreement and open debate" value={n} onChange={e => updateNorm(i, e.target.value)} />
                {allowedNorms.length > 1 && (
                  <button type="button" onClick={() => removeNorm(i)} className="text-[var(--muted)] hover:text-[var(--tension-red)] transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <Button type="button" variant="ghost" size="sm" className="mt-3" onClick={addNorm}>
            <Plus className="w-3.5 h-3.5" /> Add Norm
          </Button>
        </Card>

        <Card>
          <h2 className="text-lg font-medium mb-4">Forbidden Behaviours</h2>
          <p className="text-xs text-[var(--muted)] mb-3">Actions and patterns your community considers violations.</p>
          <div className="space-y-2">
            {forbiddenBehaviours.map((b, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[var(--tension-red)] text-sm flex-shrink-0">-</span>
                <Input placeholder="e.g. Targeted harassment or doxxing" value={b} onChange={e => updateForbidden(i, e.target.value)} />
                {forbiddenBehaviours.length > 1 && (
                  <button type="button" onClick={() => removeForbidden(i)} className="text-[var(--muted)] hover:text-[var(--tension-red)] transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <Button type="button" variant="ghost" size="sm" className="mt-3" onClick={addForbidden}>
            <Plus className="w-3.5 h-3.5" /> Add Forbidden Behaviour
          </Button>
        </Card>

        <Card>
          <h2 className="text-lg font-medium mb-4">Policies</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="toneExpectations">Tone Expectations</Label>
              <Textarea id="toneExpectations" placeholder="We expect direct, honest communication. Sarcasm is allowed but should not be used to humiliate..." value={toneExpectations} onChange={e => setToneExpectations(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="remedyPolicy">Remedy Policy</Label>
              <Textarea id="remedyPolicy" placeholder="First violations should result in clarification or mediation. Repeated severe violations may result in temporary restriction..." value={remedyPolicy} onChange={e => setRemedyPolicy(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="appealPolicy">Appeal Policy</Label>
              <Textarea id="appealPolicy" placeholder="Appeals are accepted when new evidence is available or when the original context was incomplete..." value={appealPolicy} onChange={e => setAppealPolicy(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="bondAmount">Bond Amount (for case submission)</Label>
              <Input id="bondAmount" type="text" placeholder="0" value={bondAmount} onChange={e => setBondAmount(e.target.value)} />
              <p className="text-xs text-[var(--muted)] mt-1">Amount claimants must lock when submitting a case. Forfeited on bad-faith claims.</p>
            </div>
          </div>
        </Card>

        <div className="bg-[var(--muted-paper)] rounded-xl p-4 border border-[var(--border)]">
          <p className="text-xs text-[var(--muted)]">
            This charter will be published to the GenLayer network. Once active, all cases in this community will be judged against these standards.
          </p>
        </div>

        <Button type="submit" size="lg" loading={txStatus === 'confirming' || txStatus === 'pending'}>
          Publish Charter to GenLayer
        </Button>
      </form>

      {txStatus && <TransactionToast status={txStatus} hash={txHash || undefined} />}
    </div>
  );
}
