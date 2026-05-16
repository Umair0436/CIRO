"""
Agent 3 — SituationAnalystAgent
Combines normalized signal + crisis detection → structured crisis report with severity.

Output keys:
  severity, severity_score, crisis_summary, impact_assessment,
  timeline_estimate, escalation_risk, recommended_urgency, reasoning
"""

import time
import json
from app.agents.base_agent import BaseAgent

_SYSTEM_PROMPT = """You are SituationAnalystAgent, part of CIRO (Crisis Intelligence & Response Orchestrator).

You receive a normalized signal and crisis detection result. Your job is to:
1. Assess the overall severity (low/medium/high/critical)
2. Write a professional crisis summary for emergency coordinators
3. Estimate impact and escalation risk

Return ONLY valid JSON:
{
  "severity": "low" | "medium" | "high" | "critical",
  "severity_score": <integer 1-10>,
  "crisis_summary": "<2-3 sentence professional summary for emergency coordinators>",
  "impact_assessment": {
    "immediate_threats": ["threat1", "threat2"],
    "at_risk_groups": ["group1", "group2"],
    "infrastructure_at_risk": ["item1", "item2"],
    "estimated_affected_people": <integer>
  },
  "timeline_estimate": {
    "onset": "<when did/will crisis start>",
    "peak": "<estimated time to peak severity>",
    "resolution": "<estimated time to resolve with intervention>"
  },
  "escalation_risk": "low" | "medium" | "high",
  "escalation_factors": ["factor1"],
  "recommended_urgency": "monitor" | "respond" | "urgent" | "emergency",
  "reasoning": "<3-4 sentence analytical reasoning>"
}

Severity guidelines:
- critical: immediate life threat, 10,000+ affected, infrastructure failure
- high: significant disruption, 1,000-10,000 affected, injuries possible
- medium: moderate disruption, 100-1,000 affected, property damage
- low: minor incident, <100 affected, minimal disruption
"""


class SituationAnalystAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="SituationAnalystAgent",
            system_prompt=_SYSTEM_PROMPT,
        )

    async def run(self, input_data: dict) -> dict:
        """
        input_data keys:
          - normalized_signal (dict)
          - crisis_detection (dict)

        Returns:
          - situation_report (dict)
          - agent_trace (dict)
        """
        t0        = time.monotonic()
        signal    = input_data.get("normalized_signal", {})
        detection = input_data.get("crisis_detection", {})

        user_msg = f"""Analyze the situation and produce a severity assessment:

NORMALIZED SIGNAL:
{json.dumps(signal, indent=2)}

CRISIS DETECTION RESULT:
{json.dumps({k: v for k, v in detection.items() if not k.startswith("_")}, indent=2)}

Produce the full situation report."""

        raw, elapsed = await self._call_llm(user_msg, json_mode=True)
        parsed = self._parse_json(raw)

        # Defaults
        parsed.setdefault("severity",       "medium")
        parsed.setdefault("severity_score", 5)
        parsed.setdefault("crisis_summary", "Crisis detected — assessment in progress.")
        parsed.setdefault("impact_assessment", {
            "immediate_threats": [],
            "at_risk_groups": [],
            "infrastructure_at_risk": [],
            "estimated_affected_people": 0,
        })
        parsed.setdefault("timeline_estimate", {})
        parsed.setdefault("escalation_risk",    "medium")
        parsed.setdefault("escalation_factors", [])
        parsed.setdefault("recommended_urgency","respond")
        parsed.setdefault("reasoning",          "")

        reasoning = parsed.get("reasoning", "")
        trace = self._make_trace(input_data, parsed, reasoning, elapsed)

        return {
            "situation_report": parsed,
            "agent_trace":      trace,
        }
