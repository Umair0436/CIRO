"""
Agent 5 — SimulationAgent
Simulates execution of all action plan items.
Creates mock emergency tickets, route updates, alert logs.
Returns before_state vs after_state comparison.
"""

import time
import uuid
import json
import random
from datetime import datetime, timezone
from app.agents.base_agent import BaseAgent

_SYSTEM_PROMPT = """You are SimulationAgent, part of CIRO (Crisis Intelligence & Response Orchestrator).

You receive the full crisis context and action plan. Simulate the execution of every action.
Generate realistic mock outcomes as if the actions were actually carried out.

Return ONLY valid JSON:
{
  "simulation_id": "<provided>",
  "before_state": {
    "situation": "<description of situation BEFORE response>",
    "casualties_risk": "high" | "medium" | "low",
    "road_passability": <0-100 integer>,
    "flood_water_level_cm": <integer or null>,
    "trapped_vehicles": <integer>,
    "stranded_people": <integer>,
    "power_status": "normal" | "partial_outage" | "full_outage",
    "emergency_response_active": false
  },
  "after_state": {
    "situation": "<description AFTER full response>",
    "casualties_risk": "low",
    "road_passability": <0-100 higher than before>,
    "flood_water_level_cm": <lower or null>,
    "trapped_vehicles": 0,
    "stranded_people": 0,
    "power_status": "normal",
    "emergency_response_active": true
  },
  "improvement_summary": "<1-2 sentence summary of improvements achieved>",
  "mock_tickets": [
    {
      "ticket_id": "<TKT-XXXX>",
      "type": "rescue" | "medical" | "drainage" | "traffic",
      "status": "dispatched" | "en_route" | "on_scene" | "resolved",
      "assigned_to": "<team/unit name>",
      "location": "<specific location>",
      "created_at": "<ISO timestamp>",
      "eta_mins": <integer>
    }
  ],
  "alert_dispatch_log": [
    {
      "log_id": "<LOG-XXXX>",
      "channel": "sms" | "push" | "pa_system" | "radio" | "social_media",
      "message": "<message sent>",
      "recipients": <integer>,
      "sent_at": "<ISO timestamp>",
      "status": "delivered"
    }
  ],
  "route_updates": [
    {
      "update_id": "<RU-XXXX>",
      "action": "close" | "divert" | "open",
      "road": "<road name>",
      "alternate": "<alternate route>",
      "effective_from": "<ISO timestamp>",
      "authority": "CDA Traffic" | "NHMP"
    }
  ],
  "metrics": {
    "response_time_mins": <integer>,
    "resources_deployed": <integer>,
    "estimated_lives_protected": <integer>,
    "estimated_property_saved_pkr": <integer>
  }
}

Generate 3-5 mock_tickets, 3-4 alert_dispatch_log entries, 2-3 route_updates.
Make ticket IDs like TKT-2024-XXXX. Use realistic Pakistani emergency context.
"""


class SimulationAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="SimulationAgent",
            system_prompt=_SYSTEM_PROMPT,
        )

    async def run(self, input_data: dict) -> dict:
        """
        input_data keys:
          - normalized_signal (dict)
          - crisis_detection (dict)
          - situation_report (dict)
          - action_plan (dict)

        Returns:
          - simulation (dict): before/after states + tickets + logs
          - agent_trace (dict)
        """
        t0          = time.monotonic()
        detection   = input_data.get("crisis_detection", {})
        situation   = input_data.get("situation_report", {})
        action_plan = input_data.get("action_plan", {})

        sim_id  = f"SIM-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{str(uuid.uuid4())[:6].upper()}"
        now_iso = datetime.now(timezone.utc).isoformat()

        user_msg = f"""Simulate execution of this crisis response:

SIMULATION ID: {sim_id}
CRISIS TYPE: {detection.get('crisis_type', 'unknown')}
SEVERITY: {situation.get('severity', 'medium')}
AFFECTED AREA: {detection.get('affected_area', 'G-10')}
AFFECTED POPULATION: {detection.get('affected_population', 0)}

SITUATION BEFORE RESPONSE:
{situation.get('crisis_summary', 'Crisis in progress.')}

ACTION PLAN BEING EXECUTED:
Traffic Rerouting: {json.dumps(action_plan.get('traffic_rerouting', {}), indent=2)}
Emergency Dispatch: {json.dumps(action_plan.get('emergency_dispatch', {}), indent=2)}
Public Alerts: {json.dumps(action_plan.get('public_alerts', {}), indent=2)}
Resource Allocation: {json.dumps(action_plan.get('resource_allocation', {}), indent=2)}

CURRENT TIMESTAMP: {now_iso}

Simulate realistic execution outcomes, tickets, alert logs, and route updates."""

        raw, elapsed = await self._call_llm(user_msg, json_mode=True)
        parsed = self._parse_json(raw)

        # Inject the simulation ID we generated
        parsed["simulation_id"] = sim_id

        # Guarantee before/after structure exists
        parsed.setdefault("before_state", {
            "situation": "Crisis active — roads flooded, people stranded.",
            "casualties_risk": "high",
            "road_passability": 10,
            "emergency_response_active": False,
        })
        parsed.setdefault("after_state", {
            "situation": "Response deployed — roads clearing, people evacuated.",
            "casualties_risk": "low",
            "road_passability": 75,
            "emergency_response_active": True,
        })
        parsed.setdefault("mock_tickets",       [])
        parsed.setdefault("alert_dispatch_log", [])
        parsed.setdefault("route_updates",      [])
        parsed.setdefault("improvement_summary","Response deployed successfully.")
        parsed.setdefault("metrics", {
            "response_time_mins":         18,
            "resources_deployed":         random.randint(8, 20),
            "estimated_lives_protected":  random.randint(50, 500),
            "estimated_property_saved_pkr": random.randint(5_000_000, 50_000_000),
        })

        reasoning = (
            f"Simulated {len(parsed.get('mock_tickets', []))} emergency tickets, "
            f"{len(parsed.get('alert_dispatch_log', []))} alert dispatches, "
            f"{len(parsed.get('route_updates', []))} route updates. "
            f"Road passability improved from "
            f"{parsed['before_state'].get('road_passability', '?')}% to "
            f"{parsed['after_state'].get('road_passability', '?')}%."
        )
        trace = self._make_trace(input_data, parsed, reasoning, elapsed)

        return {
            "simulation": parsed,
            "agent_trace": trace,
        }
