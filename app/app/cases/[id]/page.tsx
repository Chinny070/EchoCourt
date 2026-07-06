'use client';

import { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { CaseTimelineRail } from '@/components/court/CaseTimelineRail';
import { StatementStack } from '@/components/court/StatementStack';
import { EvidenceRibbon } from '@/components/court/EvidenceRibbon';
import { VerdictSeal } from '@/components/court/VerdictSeal';
import { InterpretationGrid } from '@/components/court/InterpretationGrid';
import { ConfidenceMeter } from '@/components/court/ConfidenceMeter';
import { TransactionToast } from '@/components/wallet/TransactionToast';
import { callReadMethod, sendTransaction, waitForReceipt } from '@/lib/genlayer/client';
import { explorerTxUrl } from '@/lib/genlayer/network';
import { CASE_TYPE_LABELS } from '@/lib/genlayer/types';
import type { EchoCase, EchoVerdict, CommunityCharter, CaseResponse } from '@/lib/genlayer/types';
import { Gavel, ExternalLink, AlertCircle } from 'lucide-react';

type TxStatus = 'preparing' | 'confirming' | 'pending' | 'success' | 'error';

export default function CaseRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [caseData, setCaseData] = useState<EchoCase | null>(null);
  const [verdict, setVerdict] = useState<EchoVerdict | null>(null);
  const [charter, setCharter] = useState<CommunityCharter | null>(null);
  const [response, setResponse] = useState<CaseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [txStatus, setTxStatus] = useState<TxStatus | null>(null);
  const [txHash, setTxHash] = useState('');

  const loadCase = useCallback(async () => {
    try {
      const raw = await callReadMethod('get_case', [id]);
      const parsed = JSON.parse(raw);
      if (!parsed.case_id) { setLoading(false); return; }

      const mapped: EchoCase = {
        caseId: parsed.case_id,
        communityId: parsed.community_id,
        title: parsed.title,
        caseType: parsed.case_type,
        claimant: parsed.claimant,
        respondent: parsed.respondent,
        claimSummary: parsed.claim_summary,
        requestedOutcome: parsed.requested_outcome,
        evidenceLinks: parsed.evidence_links || [],
        contextNotes: parsed.context_notes,
        status: parsed.status,
        bondAmount: parsed.bond_amount,
        createdAt: parsed.created_at || '',
        responseDeadline: '',
      };
      setCaseData(mapped);

      if (parsed.response_json) {
        const resp = JSON.parse(parsed.response_json);
        setResponse({
          caseId: id,
          respondentStatement: resp.respondent_statement,
          counterEvidenceLinks: resp.counter_evidence_links || [],
          contextExplanation: resp.context_explanation,
          mitigatingFactors: resp.mitigating_factors,
          submittedAt: '',
        });
      }

      try {
        const charterRaw = await callReadMethod('get_charter', [parsed.community_id]);
        const charterParsed = JSON.parse(charterRaw);
        if (charterParsed.community_id) {
          setCharter({
            communityId: charterParsed.community_id,
            communityName: charterParsed.community_name,
            title: charterParsed.title,
            summary: charterParsed.summary,
            allowedNorms: charterParsed.allowed_norms || [],
            forbiddenBehaviours: charterParsed.forbidden_behaviours || [],
            toneExpectations: charterParsed.tone_expectations || '',
            remedyPolicy: charterParsed.remedy_policy || '',
            appealPolicy: charterParsed.appeal_policy || '',
            bondAmount: charterParsed.bond_amount || '0',
            status: charterParsed.status || 'active',
            createdBy: charterParsed.created_by || '',
            createdAt: charterParsed.created_at || '',
          });
        }
      } catch { /* charter may not exist */ }

      if (parsed.status === 'DECIDED' || parsed.status === 'APPEALED' || parsed.status === 'FINALIZED') {
        try {
          const verdictRaw = await callReadMethod('get_verdict', [id]);
          const vp = JSON.parse(verdictRaw);
          if (vp.case_id) {
            setVerdict({
              caseId: vp.case_id,
              primaryInterpretation: vp.primary_interpretation,
              impactLevel: vp.impact_level,
              intentAssessment: vp.intent_assessment,
              contextQuality: vp.context_quality,
              charterAlignment: vp.charter_alignment,
              recommendedRemedy: vp.recommended_remedy,
              confidence: vp.confidence,
              shortReason: vp.short_reason,
              publicSummary: '',
              transactionHash: '',
              decidedAt: '',
            });
          }
        } catch { /* verdict may not exist */ }
      }
    } catch { /* case not found */ }
    setLoading(false);
  }, [id]);

  useEffect(() => { loadCase(); }, [loadCase]);

  async function handleRequestInterpretation() {
    setTxStatus('confirming');
    try {
      const result = await sendTransaction('request_interpretation', [id]);
      if (result.status === 'error') { setTxStatus('error'); return; }

      setTxHash(result.hash);
      setTxStatus('pending');

      const receipt = await waitForReceipt(result.hash);
      if (receipt.status === 'success') {
        setTxStatus('success');
        await loadCase();
      } else {
        setTxStatus('error');
      }
    } catch {
      setTxStatus('error');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="inline-block w-6 h-6 border-2 border-[var(--violet-echo)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!caseData) {
    return (
      <EmptyState
        icon={<AlertCircle className="w-10 h-10" />}
        title="Case not found"
        description="This case does not exist or has not been submitted to the contract yet."
        action={<Link href="/app/cases/new"><Button>Open a New Case</Button></Link>}
      />
    );
  }

  const canInterpret = caseData.status === 'READY_FOR_INTERPRETATION' || caseData.status === 'SUBMITTED';
  const isDecided = caseData.status === 'DECIDED' || caseData.status === 'APPEALED' || caseData.status === 'FINALIZED';

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Gavel className="w-5 h-5 text-[var(--violet-echo)]" />
            <h1 className="text-2xl font-medium">{caseData.title}</h1>
          </div>
          <div className="flex items-center gap-3 text-sm text-[var(--muted)]">
            <StatusBadge status={caseData.status} />
            <span>{CASE_TYPE_LABELS[caseData.caseType] || caseData.caseType}</span>
            <span className="hash-text">{caseData.caseId}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isDecided && (
            <Link href={`/app/cases/${id}/appeal`}>
              <Button variant="secondary" size="sm">Appeal</Button>
            </Link>
          )}
          {!response && caseData.status === 'SUBMITTED' && (
            <Link href={`/app/cases/${id}/respond`}>
              <Button variant="gold" size="sm">Submit Response</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Main Layout — 3 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-[160px_1fr_280px] gap-6">
        {/* Left Rail — Timeline */}
        <div className="hidden lg:block">
          <div className="sticky top-20">
            <div className="text-xs uppercase tracking-wider text-[var(--muted)] font-medium mb-3">Timeline</div>
            <CaseTimelineRail status={caseData.status} />
            <div className="mt-6 space-y-2 text-xs text-[var(--muted)]">
              <div>Claimant: <span className="hash-text">{caseData.claimant}</span></div>
              <div>Respondent: <span className="hash-text">{caseData.respondent}</span></div>
              {caseData.bondAmount !== '0' && <div>Bond: {caseData.bondAmount}</div>}
            </div>
          </div>
        </div>

        {/* Center — Statements + Verdict */}
        <div className="space-y-6">
          <StatementStack
            claimantStatement={caseData.claimSummary}
            respondentStatement={response?.respondentStatement}
            disputedContent={caseData.contextNotes}
          />

          {caseData.evidenceLinks.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)] mb-3">Evidence</h3>
              <EvidenceRibbon evidence={caseData.evidenceLinks} />
            </div>
          )}

          {response && response.counterEvidenceLinks.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)] mb-3">Counter Evidence</h3>
              <EvidenceRibbon evidence={response.counterEvidenceLinks} />
            </div>
          )}

          {response && response.contextExplanation && (
            <Card className="border-l-4 border-l-[var(--witness-gold)]">
              <div className="text-xs uppercase tracking-wider text-[var(--witness-gold)] font-medium mb-2">Context Explanation</div>
              <p className="text-sm">{response.contextExplanation}</p>
              {response.mitigatingFactors && (
                <p className="text-sm text-[var(--muted)] mt-2"><strong>Mitigating factors:</strong> {response.mitigatingFactors}</p>
              )}
            </Card>
          )}

          {/* Interpretation Action */}
          {canInterpret && (
            <Card variant="dark" className="text-center py-8">
              <h3 className="text-lg font-medium text-white mb-2">Request GenLayer Interpretation</h3>
              <p className="text-gray-400 text-sm mb-6">Validators will independently evaluate this case against the community charter.</p>
              <Button
                variant="gold"
                size="lg"
                onClick={handleRequestInterpretation}
                loading={txStatus === 'confirming' || txStatus === 'pending'}
              >
                <Gavel className="w-4 h-4" /> Request Interpretation
              </Button>
            </Card>
          )}

          {/* Verdict */}
          {isDecided && verdict && (
            <div className="space-y-6 fade-in">
              <div className="text-center">
                <VerdictSeal verdict={verdict} />
              </div>
              <ConfidenceMeter confidence={verdict.confidence} />
              <InterpretationGrid verdict={verdict} />
              {verdict.shortReason && (
                <Card variant="parchment">
                  <div className="text-xs uppercase tracking-wider text-[var(--muted)] font-medium mb-2">Reasoning</div>
                  <p className="text-sm leading-relaxed">{verdict.shortReason}</p>
                </Card>
              )}
              {verdict.transactionHash && (
                <a
                  href={explorerTxUrl(verdict.transactionHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[var(--signal-blue)] hover:underline"
                >
                  View on Explorer <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Right Rail — Charter Lens */}
        <div className="hidden lg:block">
          <div className="sticky top-20">
            {charter ? (
              <div className="space-y-4">
                <div className="text-xs uppercase tracking-wider text-[var(--muted)] font-medium">Charter Lens</div>
                <Card variant="parchment" className="text-sm space-y-3">
                  <div className="font-medium">{charter.communityName}</div>
                  <p className="text-xs text-[var(--muted)]">{charter.summary}</p>
                  {charter.allowedNorms.length > 0 && (
                    <div>
                      <div className="text-[0.65rem] text-[var(--muted)] uppercase tracking-wider mb-1">Norms</div>
                      {charter.allowedNorms.map((n, i) => (
                        <div key={i} className="text-xs flex items-start gap-1">
                          <span className="text-[var(--mediation-green)]">+</span> {n}
                        </div>
                      ))}
                    </div>
                  )}
                  {charter.forbiddenBehaviours.length > 0 && (
                    <div>
                      <div className="text-[0.65rem] text-[var(--muted)] uppercase tracking-wider mb-1">Forbidden</div>
                      {charter.forbiddenBehaviours.map((b, i) => (
                        <div key={i} className="text-xs flex items-start gap-1">
                          <span className="text-[var(--tension-red)]">-</span> {b}
                        </div>
                      ))}
                    </div>
                  )}
                  {charter.remedyPolicy && (
                    <div>
                      <div className="text-[0.65rem] text-[var(--muted)] uppercase tracking-wider mb-1">Remedy Policy</div>
                      <p className="text-xs text-[var(--muted)]">{charter.remedyPolicy}</p>
                    </div>
                  )}
                </Card>
              </div>
            ) : (
              <Card variant="parchment" className="text-center py-6">
                <p className="text-xs text-[var(--muted)]">No charter loaded for this community.</p>
              </Card>
            )}
          </div>
        </div>
      </div>

      {txStatus && <TransactionToast status={txStatus} hash={txHash || undefined} />}
    </div>
  );
}
