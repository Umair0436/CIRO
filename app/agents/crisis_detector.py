"""
Agent 2 — CrisisDetectorAgent
Takes a normalized signal + weather/traffic context and classifies the crisis.

Output keys:
  crisis_type, confidence_score, affected_area, affected_population,
  contributing_factors, reasoning
"""

import time
import json
from app.agents.base_agent import BaseAgent
from app.mock.weather_data import get_weather
from app.mock.traffic_data import get_traffic

_SYSTEM_PROMPT = """You are CrisisDetectorAgent, part of CIRO (Crisis Intelligence & Response Orchestrator) in Pakistan.

You receive a normalized signal dict plus real-time weather and traffic data. Your job is to classify the crisis precisely.

Crisis types:
- flood: water logging, inundation, drainage overflow
- heatwave: extreme heat, temperature above 40°C, heat stroke risk
- accident: road accident, vehicle crash, collision, fire
- road_blockage: roads blocked, protest, fallen tree, construction collapse
- infrastructure_failure: power outage, bridge damage, building collapse, water supply failure

Return ONLY valid JSON:
{
  "crisis_type": "<one of the 5 types above>",
  "confidence_score": <float 0.0-1.0>,
  "affected_area": "<sector or area name>",
  "affected_population": <estimated integer>,
  "contributing_factors": ["factor1", "factor2"],
  "data_sources_used": ["social_signal", "weather_data", "traffic_data"],
  "reasoning": "<2-3 sentence explanation justifying crisis_type and confidence_score>"
}

Use ALL three data sources to arrive at confidence_score:
- Social signal alone: max confidence 0.7
- Social + corroborating weather: up to 0.85
- Social + weather + traffic: up to 0.97

Be evidence-based. High rainfall + gridlock + social flood reports = very high confidence flood.
"""


class CrisisDetectorAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="CrisisDetectorAgent",
            system_prompt=_SYSTEM_PROMPT,
        )

    async def run(self, input_data: dict) -> dict:
        """
        input_data keys:
          - normalized_signal (dict): from SignalNormalizerAgent

        Returns:
          - crisis_detection (dict): crisis_type, confidence_score, affected_area, etc.
          - agent_trace (dict)
        """
        t0     = time.monotonic()
        signal = input_data.get("normalized_signal", {})
        location = signal.get("location") or "G-10"

        # Pull in contextual mock data
        weather = get_weather(location)
        traffic = get_traffic(location)

        user_msg = f"""Classify the crisis from these data sources:

SOCIAL SIGNAL:
{json.dumps(signal, indent=2)}

WEATHER DATA (sector: {location}):
{json.dumps(weather, indent=2)}

TRAFFIC DATA (sector: {location}):
{json.dumps(traffic, indent=2)}

Classify the crisis type and provide confidence score."""

        raw, elapsed = await self._call_llm(user_msg, json_mode=True)
        parsed = self._parse_json(raw)

        # Ensure required keys
        parsed.setdefault("crisis_type",        signal.get("crisis_type_hint", "unknown"))
        parsed.setdefault("confidence_score",   0.5)
        parsed.setdefault("affected_area",      location)
        parsed.setdefault("affected_population",0)
        parsed.setdefault("contributing_factors",[])
        parsed.setdefault("data_sources_used",  ["social_signal", "weather_data", "traffic_data"])
        parsed.setdefault("reasoning",          "")

        # Attach context data used for downstream agents
        parsed["_weather_context"] = weather
        parsed["_traffic_context"] = traffic

        reasoning = parsed.get("reasoning", "")
        trace = self._make_trace(input_data, parsed, reasoning, elapsed)

        return {
            "crisis_detection": parsed,
            "agent_trace":      trace,
        }
