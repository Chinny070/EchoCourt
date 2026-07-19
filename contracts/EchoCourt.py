# v0.2.16
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

import json

from genlayer import *


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
    def create_charter(self, community_id: str, community_name: str, charter_title: str, charter_summary: str, allowed_norms_json: str, forbidden_behaviours_json: str, tone_expectations: str, remedy_policy: str, appeal_policy: str, bond_amount: str) -> str:
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
            "created_by": caller
        })
        self.charters[community_id] = record
        return community_id

    @gl.public.write
    def submit_case(self, case_id: str, community_id: str, case_title: str, case_type: str, respondent: str, claim_summary: str, requested_outcome: str, evidence_links_json: str, context_notes: str) -> str:
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
            "response_json": ""
        })
        self.cases[case_id] = record
        self.case_count = self.case_count + u256(1)
        if community_id in self.community_cases:
            ids = json.loads(self.community_cases[community_id])
        else:
            ids = []
        ids.append(case_id)
        self.community_cases[community_id] = json.dumps(ids)
        return case_id

    @gl.public.write
    def submit_response(self, case_id: str, respondent_statement: str, counter_evidence_json: str, context_explanation: str, mitigating_factors: str) -> str:
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
            "mitigating_factors": mitigating_factors
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
        fetched_sources = []
        for item in case.get("evidence_links", []):
            line = "- " + item.get("label", "") + ": " + item.get("summary", "")
            evidence_lines.append(line)
            url = item.get("url", "")
            if url and (url.startswith("http://") or url.startswith("https://")):
                try:
                    page_content = gl.get_webpage(url, mode="text")
                    snippet = page_content[:3000]
                    fetched_sources.append("Fetched from " + url + ":\n" + snippet)
                except Exception:
                    fetched_sources.append("Failed to fetch " + url + " — could not be verified on-chain.")
        if evidence_lines:
            evidence_text = "\n".join(evidence_lines)
        else:
            evidence_text = "No evidence provided."

        if fetched_sources:
            verified_text = "\n\n---\n\n".join(fetched_sources)
        else:
            verified_text = "No URLs were provided for on-chain verification."

        context_text = case.get("context_notes", "")

        prompt = (
            "You are an EchoCourt validator interpreting a social-context dispute.\n"
            "You are NOT a lawyer; do NOT give legal advice.\n\n"
            "IMPORTANT: You have been given VERIFIED web content fetched on-chain by the validators.\n"
            "Use the verified content to check whether the parties' claims are supported.\n"
            "If no verified content was fetched, note that evidence is unverified and weigh it accordingly.\n\n"
            "Return ONLY valid JSON with exactly these fields:\n"
            '{"primary_interpretation":"...","impact_level":"...","intent_assessment":"...","context_quality":"...","charter_alignment":"...","recommended_remedy":"...","confidence":0,"short_reason":"..."}\n\n'
            "Where primary_interpretation is no_violation or minor_norm_drift or contextual_misunderstanding or careless_harm or clear_violation or severe_violation or bad_faith_claim or insufficient_context.\n"
            "Where impact_level is none or low or medium or high or severe or unclear.\n"
            "Where intent_assessment is likely_benign or careless or reckless or targeted or manipulative or unclear.\n"
            "Where context_quality is strong_context or partial_context or thin_context or conflicting_context or insufficient_context.\n"
            "Where charter_alignment is aligned or borderline or misaligned or clearly_violated or not_applicable or unclear.\n"
            "Where recommended_remedy is no_action or private_clarification or public_clarification or mediation or warning or apology_requested or temporary_restriction or removal_recommended or dismiss_claim or request_more_context.\n\n"
            "Charter:\n" + charter_text + "\n\n"
            "Claimant statement:\n" + claimant_text + "\n\n"
            "Respondent statement:\n" + respondent_text + "\n\n"
            "Evidence submitted:\n" + evidence_text + "\n\n"
            "Verified web content fetched on-chain:\n" + verified_text + "\n\n"
            "Context:\n" + context_text + "\n\n"
            "Cross-reference the claimed evidence against the verified web content.\n"
            "Evaluate carefully. Return ONLY the JSON object.\n"
            "Do not include markdown formatting. Do not include ```json or ```.\n"
            "Your output must be only JSON without any formatting prefix or suffix."
        )

        def call_llm() -> str:
            result = gl.nondet.exec_prompt(prompt)
            result = result.replace("```json", "").replace("```", "")
            print(result)
            return result

        result = gl.eq_principle.prompt_comparative(
            call_llm,
            "The value of primary_interpretation and recommended_remedy must match"
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
                "raw_result": result[:500]
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
            "needs_human_review": False
        })
        self.verdicts[case_id] = verdict_record
        case["status"] = "DECIDED"
        case["interpretation_requested_by"] = caller
        self.cases[case_id] = json.dumps(case)
        return result

    @gl.public.write
    def appeal_case(self, case_id: str, appeal_basis: str, explanation: str, new_evidence_json: str, requested_correction: str) -> str:
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
            "status": "submitted"
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
        fetched_sources = []
        for item in case.get("evidence_links", []):
            line = "- " + item.get("label", "") + ": " + item.get("summary", "")
            evidence_lines.append(line)
            url = item.get("url", "")
            if url and (url.startswith("http://") or url.startswith("https://")):
                try:
                    page_content = gl.get_webpage(url, mode="text")
                    snippet = page_content[:3000]
                    fetched_sources.append("Fetched from " + url + ":\n" + snippet)
                except Exception:
                    fetched_sources.append("Failed to fetch " + url + " — could not be verified on-chain.")
        for item in appeal.get("new_evidence_links", []):
            line = "- [APPEAL] " + item.get("label", "") + ": " + item.get("summary", "")
            evidence_lines.append(line)
            url = item.get("url", "")
            if url and (url.startswith("http://") or url.startswith("https://")):
                try:
                    page_content = gl.get_webpage(url, mode="text")
                    snippet = page_content[:3000]
                    fetched_sources.append("Fetched from " + url + ":\n" + snippet)
                except Exception:
                    fetched_sources.append("Failed to fetch " + url + " — could not be verified on-chain.")
        if evidence_lines:
            evidence_text = "\n".join(evidence_lines)
        else:
            evidence_text = "No evidence provided."

        if fetched_sources:
            verified_text = "\n\n---\n\n".join(fetched_sources)
        else:
            verified_text = "No URLs were provided for on-chain verification."

        prev_interp = prev_verdict.get("primary_interpretation", "unknown")
        prev_remedy = prev_verdict.get("recommended_remedy", "unknown")
        prev_reason = prev_verdict.get("short_reason", "unknown")

        prompt = (
            "You are an EchoCourt APPEAL validator re-evaluating a social-context dispute.\n"
            "A previous verdict was issued and one party has appealed.\n\n"
            "IMPORTANT: You have been given VERIFIED web content fetched on-chain by the validators.\n"
            "Use the verified content to check whether the parties' claims are supported.\n\n"
            "PREVIOUS VERDICT:\n"
            "- Interpretation: " + prev_interp + "\n"
            "- Remedy: " + prev_remedy + "\n"
            "- Reason: " + prev_reason + "\n\n"
            "APPEAL BASIS: " + appeal.get("basis", "") + "\n"
            "APPEAL EXPLANATION: " + appeal.get("explanation", "") + "\n"
            "REQUESTED CORRECTION: " + appeal.get("requested_correction", "") + "\n\n"
            "Charter:\n" + charter_text + "\n\n"
            "Claimant statement:\n" + claimant_text + "\n\n"
            "Respondent statement:\n" + respondent_text + "\n\n"
            "All Evidence (original + appeal):\n" + evidence_text + "\n\n"
            "Verified web content fetched on-chain:\n" + verified_text + "\n\n"
            "Re-evaluate with the appeal arguments and new evidence in mind.\n"
            "You may UPHOLD, MODIFY, or OVERTURN the previous verdict.\n"
            "Return ONLY valid JSON. No markdown.\n"
            'Return: {"appeal_outcome":"...","primary_interpretation":"...","impact_level":"...","intent_assessment":"...","context_quality":"...","charter_alignment":"...","recommended_remedy":"...","confidence":0,"short_reason":"..."}\n'
            "appeal_outcome: upheld or modified or overturned\n"
            "Do not include markdown formatting. Do not include ```json or ```.\n"
            "Your output must be only JSON without any formatting prefix or suffix."
        )

        def call_llm() -> str:
            result = gl.nondet.exec_prompt(prompt)
            result = result.replace("```json", "").replace("```", "")
            print(result)
            return result

        result = gl.eq_principle.prompt_comparative(
            call_llm,
            "The result must have the same appeal_outcome and recommended_remedy"
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
            "needs_human_review": False
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
