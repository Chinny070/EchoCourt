export type CommunityCharter = {
  communityId: string;
  communityName: string;
  title: string;
  summary: string;
  allowedNorms: string[];
  forbiddenBehaviours: string[];
  toneExpectations: string;
  remedyPolicy: string;
  appealPolicy: string;
  bondAmount: string;
  status: 'active' | 'inactive';
  createdBy: string;
  createdAt: string;
};

export type EvidenceLink = {
  label: string;
  url: string;
  summary: string;
  hash?: string;
  image?: string;
};

export type EchoCase = {
  caseId: string;
  communityId: string;
  title: string;
  caseType: string;
  claimant: string;
  respondent: string;
  claimSummary: string;
  requestedOutcome: string;
  evidenceLinks: EvidenceLink[];
  contextNotes: string;
  status: string;
  bondAmount: string;
  createdAt: string;
  responseDeadline: string;
};

export type CaseResponse = {
  caseId: string;
  respondentStatement: string;
  counterEvidenceLinks: EvidenceLink[];
  contextExplanation: string;
  mitigatingFactors: string;
  submittedAt: string;
};

export type EchoVerdict = {
  caseId: string;
  primaryInterpretation: string;
  impactLevel: string;
  intentAssessment: string;
  contextQuality: string;
  charterAlignment: string;
  recommendedRemedy: string;
  confidence: number;
  shortReason: string;
  publicSummary: string;
  transactionHash: string;
  decidedAt: string;
};

export type Appeal = {
  caseId: string;
  basis: string;
  explanation: string;
  newEvidenceLinks: EvidenceLink[];
  requestedCorrection: string;
  status: string;
  submittedAt: string;
};

export const CASE_TYPES = [
  'harassment_claim',
  'misrepresentation_claim',
  'tone_dispute',
  'community_norm_violation',
  'bad_faith_complaint',
  'moderation_review',
  'public_statement_review',
  'governance_conduct_review',
  'creator_brand_dispute',
  'other',
] as const;

export const CASE_TYPE_LABELS: Record<string, string> = {
  harassment_claim: 'Harassment Claim',
  misrepresentation_claim: 'Misrepresentation Claim',
  tone_dispute: 'Tone Dispute',
  community_norm_violation: 'Community Norm Violation',
  bad_faith_complaint: 'Bad-Faith Complaint Review',
  moderation_review: 'Moderation Review',
  public_statement_review: 'Public Statement Review',
  governance_conduct_review: 'Governance Conduct Review',
  creator_brand_dispute: 'Creator/Brand Dispute',
  other: 'Other',
};

export const CASE_STATUSES = [
  'DRAFT', 'SUBMITTED', 'AWAITING_RESPONSE', 'READY_FOR_INTERPRETATION',
  'INTERPRETING', 'DECIDED', 'APPEALED', 'FINALIZED',
  'DISMISSED', 'CANCELLED', 'INSUFFICIENT_CONTEXT',
] as const;

export const PRIMARY_INTERPRETATIONS = [
  'no_violation', 'minor_norm_drift', 'contextual_misunderstanding',
  'careless_harm', 'clear_violation', 'severe_violation',
  'bad_faith_claim', 'insufficient_context',
] as const;

export const IMPACT_LEVELS = ['none', 'low', 'medium', 'high', 'severe', 'unclear'] as const;

export const INTENT_ASSESSMENTS = [
  'likely_benign', 'careless', 'reckless', 'targeted', 'manipulative', 'unclear',
] as const;

export const CONTEXT_QUALITIES = [
  'strong_context', 'partial_context', 'thin_context',
  'conflicting_context', 'insufficient_context',
] as const;

export const CHARTER_ALIGNMENTS = [
  'aligned', 'borderline', 'misaligned', 'clearly_violated', 'not_applicable', 'unclear',
] as const;

export const RECOMMENDED_REMEDIES = [
  'no_action', 'private_clarification', 'public_clarification', 'mediation',
  'warning', 'apology_requested', 'temporary_restriction', 'role_review',
  'removal_recommended', 'dismiss_claim', 'request_more_context',
] as const;

export const APPEAL_BASES = [
  'missing_context', 'false_evidence', 'wrong_charter_applied',
  'new_evidence', 'disproportionate_remedy', 'procedural_issue',
] as const;
