"""
Agent 4 — ActionPlannerAgent
Generates a coordinated multi-category response action plan.

Output keys:
  traffic_rerouting, emergency_dispatch, public_alerts,
  resource_allocation, coordination_notes, priority_order
"""

import time
import json
from app.agents.base_agent import BaseAgent
from app.mock.geo_data import get_alternate_routes, get_sector
from app.mock.resources import get_resource_summary

_SYSTEM_PROMPT = """You are ActionPlannerAgent, part of CIRO (Crisis Intelligence & Response Orchestrator) in Pakistan.

You receive a situation report and crisis details. Generate a COMPLETE coordinated response plan.

Return ONLY valid JSON:
{
  "traffic_rerouting": {
    "blocked_areas": ["area1"],
    "alternate_routes": ["route description 1", "route 2"],
    "estimated_delay_mins": <integer>,
    "diversion_points": ["checkpoint 1", "checkpoint 2"]
  },
  "emergency_dispatch": {
    "services": ["Rescue 1122", "NDMA", "CDA Emergency"],
    "deployment_points": ["location 1", "location 2"],
    "response_time_mins": <integer>,
    "command_center": "<location>"
  },
  "public_alerts": {
    "sms_message": "<Pakistani SMS alert text, max 160 chars>",
    "push_notification": "<short app notification>",
    "broadcast_message": "<longer radio/PA system message>",
    "languages": ["English", "Urdu"],
    "affected_zones": ["zone1", "zone2"]
  },
  "resource_allocation": {
    "rescue_teams": ["team names"],
    "water_pumps": ["pump names"],
    "ambulances": ["unit names"],
    "shelters_activated": ["shelter names"],
    "estimated_cost_pkr": <integer>
  },
  "coordination_notes": "<operational notes for incident commander>",
  "priority_order": ["action 1 first", "action 2 second", "action 3 third"],
  "estimated_resolution_hrs": <float>
}

For Pakistani context:
- Emergency number: 1122 (Rescue Punjab) / 1199 (EDHI)
- Islamabad sectors: G-10, I-8, F-7, G-9, I-10, E-11
- WASA = Water and Sanitation Agency (for flooding)
- NDMA = National Disaster Management Authority
- CDA = Capital Development Authority
"""


class ActionPlannerAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="ActionPlannerAgent",
            system_prompt=_SYSTEM_PROMPT,
        )

    async def run(self, input_data: dict) -> dict:
        """
        input_data keys:
          - normalized_signal (dict)
          - crisis_detection (dict)
          - situation_report (dict)

        Returns:
          - action_plan (dict)
          - agent_trace (dict)
        """
        t0            = time.monotonic()
        signal        = input_data.get("normalized_signal", {})
        detection     = input_data.get("crisis_detection", {})
        situation     = input_data.get("situation_report", {})

        location      = detection.get("affected_area") or signal.get("location") or "G-10"
        crisis_type   = detection.get("crisis_type", "unknown")
        severity      = situation.get("severity", "medium")

        # Pre-fetch mock data to include as context hints
        alt_routes    = get_alternate_routes(location)
        resources     = get_resource_summary(crisis_type, severity)
        sector_info   = get_sector(location)

        user_msg = f"""Generate a complete response action plan for this crisis:

CRISIS TYPE: {crisis_type}
SEVERITY: {severity}
AFFECTED AREA: {location} ({sector_info.get('description', '')})
POPULATION AT RISK: {sector_info.get('population', 0):,}

SITUATION SUMMARY:
{situation.get('crisis_summary', 'No summary available.')}

AVAILABLE ALTERNATE ROUTES:
{json.dumps(alt_routes, indent=2)}

AVAILABLE RESOURCES:
{json.dumps(resources, indent=2)}

ESCALATION RISK: {situation.get('escalation_risk', 'medium')}
RECOMMENDED URGENCY: {situation.get('recommended_urgency', 'respond')}

Generate the full coordinated action plan."""

        raw, elapsed = await self._call_llm(user_msg, json_mode=True)
        parsed = self._parse_json(raw)

        # Defaults for required keys
        parsed.setdefault("traffic_rerouting",  {"alternate_routes": alt_routes})
        parsed.setdefault("emergency_dispatch", {"services": list(resources.get("rescue_teams", []))})
        parsed.setdefault("public_alerts",      {"sms_message": f"ALERT: {crisis_type} in {location}. Please avoid the area."})
        parsed.setdefault("resource_allocation",resources)
        parsed.setdefault("coordination_notes", "")
        parsed.setdefault("priority_order",     [])
        parsed.setdefault("estimated_resolution_hrs", 4.0)

        reasoning = f"Action plan generated for {crisis_type} ({severity}) in {location}."
        trace = self._make_trace(input_data, parsed, reasoning, elapsed)

        return {
            "action_plan": parsed,
            "agent_trace": trace,
        }
