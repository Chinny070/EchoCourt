from genlayer import *

import json


class EchoCourt(gl.Contract):
    charters: TreeMap[str, str]
    cases: TreeMap[str, str]
    verdicts: TreeMap[str, str]
    appeals: TreeMap[str, str]
    community_cases: TreeMap[str, str]
    case_count: u256

    def __init__(self):
        self.case_count = u256(0)

    @gl.public.write
    def create_charter(
        self,
        community_id: str,
        community_name: str,
        charter_title: str,
        charter_summary: str,
        allowed_norms_json: str,
        forbidden_behaviours_json: str,
        tone_expectations: str,
        remedy_policy: str,
        appeal_policy: str,
        bond_amount: str,
    ) -> str:
        if not community_id or len(community_id) > 200:
            raise gl.vm.UserError("Community ID must be 1-200 characters")
        caller = gl.message.sender_address.as_hex
        record = json.dumps({
            "community_id": community_id,
            "community_name": community_name,
            "title": charter_title,
            "summary": charter_summary,
            "allowed_norms": json.loads(allowed_norms_json),
            "forbidden_behaviours": json.loads(forbidden_behaviours_json),
            "tone_expectations": tone_expectations,
            "remedy_policy": remedy_policy,
            "appeal_policy": appeal_policy,
            "bond_amount": bond_amount,
            "status": "active",
            "created_by": caller,
        })
        self.charters[community_id] = record
        return community_id

    @gl.public.write
    def submit_case(
        self,
        case_id: str,
        community_id: str,
        case_title: str,
        case_type: str,
        respondent: str,
        claim_summary: str,
        requested_outcome: str,
        evidence_links_json: str,
        context_notes: str,
    ) -> str:
        if not case_id or len(case_id) > 200:
            raise gl.vm.UserError("Case ID must be 1-200 characters")
        if community_id not in self.charters:
            raise gl.vm.UserError("Community charter not found")
        if case_id in self.cases:
            raise gl.vm.UserError("Case ID already exists")

        caller = gl.message.sender_address.as_hex
        record = json.dumps({
            "case_id": case_id,
            "community_id": community_id,
            "title": case_title,
            "case_type": case_type,
            "claimant": caller,
            "respondent": respondent,
            "claim_summary": claim_summary,
            "requested_outcome": requested_outcome,
            "evidence_links": json.loads(evidence_links_json),
            "context_notes": context_notes,
            "status": "SUBMITTED",
            "response_json": "",
        })
        self.cases[case_id] = record
        self.case_count = u256(int(self.case_count) + 1)

        if community_id in self.community_cases:
            ids = json.loads(self.community_cases[community_id])
        else:
            ids = []
        ids.append(case_id)
        self.community_cases[community_id] = json.dumps(ids)
        return case_id

    @gl.public.write
    def submit_response(
        self,
        case_id: str,
        respondent_statement: str,
        counter_evidence_json: str,
        context_explanation: str,
        mitigating_factors: str,
    ) -> str:
        if case_id not in self.cases:
            raise gl.vm.UserError("Case not found")
        case = json.loads(self.cases[case_id])
        caller = gl.message.sender_address.as_hex
        if case["respondent"] != caller:
            raise gl.vm.UserError("Only the named respondent can submit a response")
        if case["status"] != "SUBMITTED":
            raise gl.vm.UserError("Case is not awaiting a response")
        response_data = json.dumps({
            "respondent_address": caller,
            "respondent_statement": respondent_statement,
            "counter_evidence_links": json.loads(counter_evidence_json),
            "context_explanation": context_explanation,
            "mitigating_factors": mitigating_factors,
        })
        case["response_json"] = response_data
        case["status"] = "READY_FOR_INTERPRETATION"
        self.cases[case_id] = json.dumps(case)
        return case_id

    @gl.public.write
    def request_interpretation(self, case_id: str) -> str:
        if case_id not in self.cases:
            raise gl.vm.UserError("Case not found")
        case = json.loads(self.cases[case_id])
        caller = gl.message.sender_address.as_hex
        if caller != case["claimant"] and caller != case["respondent"]:
            raise gl.vm.UserError("Only case parties can request interpretation")

        community_id = case["community_id"]
        charter = {}
        if community_id in self.charters:
            charter = json.loads(self.charters[community_id])

        charter_text = charter.get("summary", "No charter provided.")
        claimant_text = case.get("claim_summary", "")
        respondent_text = ""
        rj = case.get("response_json", "")
        if rj:
            rd = json.loads(rj)
            respondent_text = rd.get("respondent_statement", "")

        evidence_lines = []
        for item in case.get("evidence_links", []):
            evidence_lines.append(item.get("label", "") + ": " + item.get("summary", ""))
        evidence_text = "\n".join(evidence_lines) if evidence_lines else "None"

        prompt = "You are an EchoCourt validator interpreting a social-context dispute.\n"
        prompt += "Charter: " + charter_text + "\n"
        prompt += "Claimant: " + claimant_text + "\n"
        prompt += "Respondent: " + respondent_text + "\n"
        prompt += "Evidence: " + evidence_text + "\n"
        prompt += "Context: " + case.get("context_notes", "") + "\n\n"
        prompt += "Consider intent, impact, proportionality, and charter alignment.\n"
        prompt += "Return ONLY valid JSON. No markdown.\n"
        prompt += 'Return: {"primary_interpretation":"...","impact_level":"...","intent_assessment":"...","context_quality":"...","charter_alignment":"...","recommended_remedy":"...","confidence":0,"short_reason":"..."}\n'
        prompt += "primary_interpretation: no_violation|minor_norm_drift|contextual_misunderstanding|careless_harm|clear_violation|severe_violation|bad_faith_claim|insufficient_context\n"
        prompt += "impact_level: none|low|medium|high|severe|unclear\n"
        prompt += "intent_assessment: likely_benign|careless|reckless|targeted|manipulative|unclear\n"
        prompt += "context_quality: strong_context|partial_context|thin_context|conflicting_context|insufficient_context\n"
        prompt += "charter_alignment: aligned|borderline|misaligned|clearly_violated|not_applicable|unclear\n"
        prompt += "recommended_remedy: no_action|private_clarification|public_clarification|mediation|warning|apology_requested|temporary_restriction|role_review|removal_recommended|dismiss_claim|request_more_context\n"

        def call_llm():
            result = gl.nondet.exec_prompt(prompt)
            result = result.replace("```json", "").replace("```", "").strip()
            return result

        result = gl.eq_principle.prompt_comparative(
            call_llm,
            "The result must have the same primary_interpretation and recommended_remedy.",
        )

        try:
            parsed = json.loads(result)
        except Exception:
            verdict_record = json.dumps({
                "case_id": case_id,
                "primary_interpretation": "insufficient_context",
                "impact_level": "unclear",
                "intent_assessment": "unclear",
                "context_quality": "insufficient_context",
                "charter_alignment": "unclear",
                "recommended_remedy": "request_more_context",
                "confidence": 0,
                "short_reason": "AI result could not be parsed. Human review required.",
                "needs_human_review": True,
                "raw_result": result[:500],
            })
            self.verdicts[case_id] = verdict_record
            case["status"] = "NEEDS_HUMAN_REVIEW"
            case["interpretation_requested_by"] = caller
            self.cases[case_id] = json.dumps(case)
            return verdict_record

        verdict_record = json.dumps({
            "case_id": case_id,
            "primary_interpretation": parsed.get("primary_interpretation", ""),
            "impact_level": parsed.get("impact_level", ""),
            "intent_assessment": parsed.get("intent_assessment", ""),
            "context_quality": parsed.get("context_quality", ""),
            "charter_alignment": parsed.get("charter_alignment", ""),
            "recommended_remedy": parsed.get("recommended_remedy", ""),
            "confidence": parsed.get("confidence", 0),
            "short_reason": parsed.get("short_reason", ""),
            "needs_human_review": False,
        })
        self.verdicts[case_id] = verdict_record
        case["status"] = "DECIDED"
        case["interpretation_requested_by"] = caller
        self.cases[case_id] = json.dumps(case)
        return result

    @gl.public.write
    def appeal_case(
        self,
        case_id: str,
        appeal_basis: str,
        explanation: str,
        new_evidence_json: str,
        requested_correction: str,
    ) -> str:
        if case_id not in self.cases:
            raise gl.vm.UserError("Case not found")
        case = json.loads(self.cases[case_id])
        caller = gl.message.sender_address.as_hex
        if caller != case["claimant"] and caller != case["respondent"]:
            raise gl.vm.UserError("Only case parties can appeal")
        if case["status"] != "DECIDED" and case["status"] != "NEEDS_HUMAN_REVIEW":
            raise gl.vm.UserError("Case must be decided before appeal")

        appeal_record = json.dumps({
            "case_id": case_id,
            "appealed_by": caller,
            "basis": appeal_basis,
            "explanation": explanation,
            "new_evidence_links": json.loads(new_evidence_json),
            "requested_correction": requested_correction,
            "status": "submitted",
        })
        self.appeals[case_id] = appeal_record
        case["status"] = "APPEALED"
        self.cases[case_id] = json.dumps(case)
        return case_id

    @gl.public.write
    def resolve_appeal(self, case_id: str) -> str:
        if case_id not in self.cases:
            raise gl.vm.UserError("Case not found")
        case = json.loads(self.cases[case_id])
        if case["status"] != "APPEALED":
            raise gl.vm.UserError("Case must be appealed first")
        if case_id not in self.appeals:
            raise gl.vm.UserError("Appeal record not found")

        appeal = json.loads(self.appeals[case_id])
        prev_verdict = {}
        if case_id in self.verdicts:
            prev_verdict = json.loads(self.verdicts[case_id])

        community_id = case["community_id"]
        charter = {}
        if community_id in self.charters:
            charter = json.loads(self.charters[community_id])

        charter_text = charter.get("summary", "No charter provided.")
        claimant_text = case.get("claim_summary", "")
        respondent_text = ""
        rj = case.get("response_json", "")
        if rj:
            rd = json.loads(rj)
            respondent_text = rd.get("respondent_statement", "")

        evidence_lines = []
        for item in case.get("evidence_links", []):
            evidence_lines.append(item.get("label", "") + ": " + item.get("summary", ""))
        for item in appeal.get("new_evidence_links", []):
            evidence_lines.append("[APPEAL] " + item.get("label", "") + ": " + item.get("summary", ""))
        evidence_text = "\n".join(evidence_lines) if evidence_lines else "None"

        prev_interp = prev_verdict.get("primary_interpretation", "unknown")
        prev_remedy = prev_verdict.get("recommended_remedy", "unknown")
        prev_reason = prev_verdict.get("short_reason", "unknown")

        prompt = "You are an EchoCourt APPEAL validator re-evaluating a social-context dispute.\n"
        prompt += "A previous verdict was issued and one party has appealed.\n\n"
        prompt += "PREVIOUS VERDICT:\n"
        prompt += "- Interpretation: " + prev_interp + "\n"
        prompt += "- Remedy: " + prev_remedy + "\n"
        prompt += "- Reason: " + prev_reason + "\n\n"
        prompt += "APPEAL BASIS: " + appeal.get("basis", "") + "\n"
        prompt += "APPEAL EXPLANATION: " + appeal.get("explanation", "") + "\n"
        prompt += "REQUESTED CORRECTION: " + appeal.get("requested_correction", "") + "\n\n"
        prompt += "Charter: " + charter_text + "\n"
        prompt += "Claimant: " + claimant_text + "\n"
        prompt += "Respondent: " + respondent_text + "\n"
        prompt += "All Evidence (original + appeal): " + evidence_text + "\n"
        prompt += "Context: " + case.get("context_notes", "") + "\n\n"
        prompt += "Re-evaluate with the appeal arguments and new evidence in mind.\n"
        prompt += "You may UPHOLD, MODIFY, or OVERTURN the previous verdict.\n"
        prompt += "Return ONLY valid JSON. No markdown.\n"
        prompt += 'Return: {"appeal_outcome":"...","primary_interpretation":"...","impact_level":"...","intent_assessment":"...","context_quality":"...","charter_alignment":"...","recommended_remedy":"...","confidence":0,"short_reason":"..."}\n'
        prompt += "appeal_outcome: upheld|modified|overturned\n"
        prompt += "primary_interpretation: no_violation|minor_norm_drift|contextual_misunderstanding|careless_harm|clear_violation|severe_violation|bad_faith_claim|insufficient_context\n"
        prompt += "impact_level: none|low|medium|high|severe|unclear\n"
        prompt += "intent_assessment: likely_benign|careless|reckless|targeted|manipulative|unclear\n"
        prompt += "context_quality: strong_context|partial_context|thin_context|conflicting_context|insufficient_context\n"
        prompt += "charter_alignment: aligned|borderline|misaligned|clearly_violated|not_applicable|unclear\n"
        prompt += "recommended_remedy: no_action|private_clarification|public_clarification|mediation|warning|apology_requested|temporary_restriction|role_review|removal_recommended|dismiss_claim|request_more_context\n"

        def call_llm():
            result = gl.nondet.exec_prompt(prompt)
            result = result.replace("```json", "").replace("```", "").strip()
            return result

        result = gl.eq_principle.prompt_comparative(
            call_llm,
            "The result must have the same appeal_outcome and recommended_remedy.",
        )

        try:
            parsed = json.loads(result)
        except Exception:
            appeal["status"] = "NEEDS_HUMAN_REVIEW"
            self.appeals[case_id] = json.dumps(appeal)
            case["status"] = "APPEAL_NEEDS_HUMAN_REVIEW"
            self.cases[case_id] = json.dumps(case)
            return json.dumps({"error": "Appeal result could not be parsed. Human review required.", "raw": result[:500]})

        verdict_record = json.dumps({
            "case_id": case_id,
            "appeal_outcome": parsed.get("appeal_outcome", ""),
            "primary_interpretation": parsed.get("primary_interpretation", ""),
            "impact_level": parsed.get("impact_level", ""),
            "intent_assessment": parsed.get("intent_assessment", ""),
            "context_quality": parsed.get("context_quality", ""),
            "charter_alignment": parsed.get("charter_alignment", ""),
            "recommended_remedy": parsed.get("recommended_remedy", ""),
            "confidence": parsed.get("confidence", 0),
            "short_reason": parsed.get("short_reason", ""),
            "is_appeal_verdict": True,
            "needs_human_review": False,
        })
        self.verdicts[case_id] = verdict_record
        appeal["status"] = "resolved"
        appeal["outcome"] = parsed.get("appeal_outcome", "")
        self.appeals[case_id] = json.dumps(appeal)
        case["status"] = "APPEAL_DECIDED"
        self.cases[case_id] = json.dumps(case)
        return result

    @gl.public.write
    def flag_for_human_review(self, case_id: str, reason: str) -> str:
        if case_id not in self.cases:
            raise gl.vm.UserError("Case not found")
        case = json.loads(self.cases[case_id])
        caller = gl.message.sender_address.as_hex
        charter = {}
        community_id = case["community_id"]
        if community_id in self.charters:
            charter = json.loads(self.charters[community_id])
        if charter.get("created_by", "") != caller:
            raise gl.vm.UserError("Only the charter creator can flag for human review")
        case["status"] = "NEEDS_HUMAN_REVIEW"
        case["human_review_reason"] = reason
        case["flagged_by"] = caller
        self.cases[case_id] = json.dumps(case)
        return case_id

    @gl.public.view
    def get_case(self, case_id: str) -> str:
        if case_id not in self.cases:
            return "{}"
        return self.cases[case_id]

    @gl.public.view
    def get_verdict(self, case_id: str) -> str:
        if case_id not in self.verdicts:
            return "{}"
        return self.verdicts[case_id]

    @gl.public.view
    def get_charter(self, community_id: str) -> str:
        if community_id not in self.charters:
            return "{}"
        return self.charters[community_id]

    @gl.public.view
    def get_community_cases(self, community_id: str) -> str:
        if community_id not in self.community_cases:
            return "[]"
        ids = json.loads(self.community_cases[community_id])
        records = []
        for cid in ids:
            if cid in self.cases:
                records.append(json.loads(self.cases[cid]))
        return json.dumps(records)

    @gl.public.view
    def get_appeal(self, case_id: str) -> str:
        if case_id not in self.appeals:
            return "{}"
        return self.appeals[case_id]

    @gl.public.view
    def get_stats(self) -> str:
        return json.dumps({"total_cases": str(self.case_count)})
