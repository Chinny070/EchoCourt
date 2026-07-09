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
        response_data = json.dumps({
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
            label = item.get("label", "")
            url = item.get("url", "")
            summary = item.get("summary", "")
            evidence_lines.append(label + ": " + summary)
            if url and (url.startswith("http://") or url.startswith("https://")):
                page_content = gl.get_webpage(url, mode="text")
                fetched_sources.append("Fetched from " + url + ":\n" + page_content[:2000])
        evidence_text = "\n".join(evidence_lines) if evidence_lines else "None"

        if fetched_sources:
            verified_text = "\n\n---\n\n".join(fetched_sources)
        else:
            verified_text = "No URLs were provided for on-chain verification."

        prompt = "You are an EchoCourt validator interpreting a social-context dispute.\n"
        prompt += "Charter: " + charter_text + "\n"
        prompt += "Claimant: " + claimant_text + "\n"
        prompt += "Respondent: " + respondent_text + "\n"
        prompt += "Evidence: " + evidence_text + "\n"
        prompt += "Verified web content fetched on-chain:\n" + verified_text + "\n"
        prompt += "Context: " + case.get("context_notes", "") + "\n\n"
        prompt += "IMPORTANT: Cross-reference claims against the verified web content. If no URLs were verified, lower confidence.\n"
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

        parsed = json.loads(result)
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
        })
        self.verdicts[case_id] = verdict_record
        case["status"] = "DECIDED"
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
        if case["status"] != "DECIDED":
            raise gl.vm.UserError("Case must be decided before appeal")

        appeal_record = json.dumps({
            "case_id": case_id,
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
