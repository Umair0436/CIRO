"""
Agent 1 — SignalNormalizerAgent
Accepts raw text (English, Roman Urdu, Hinglish) and extracts structured signal.

Output keys:
  original_text, translated_text, detected_language,
  location, crisis_type_hint, severity_keywords, urgency, confidence
"""

import time
from app.agents.base_agent import BaseAgent

_SYSTEM_PROMPT = """You are SignalNormalizerAgent, part of CIRO (Crisis Intelligence & Response Orchestrator) in Pakistan.

Your job: read a raw social media post or citizen report (may be Roman Urdu, Urdu, Hinglish, or English) and extract a structured signal.

Return ONLY valid JSON with exactly these keys:
{
  "original_text": "<the input text exactly>",
  "translated_text": "<English translation>",
  "detected_language": "roman_urdu" | "urdu" | "english" | "hinglish",
  "location": "<specific location/sector name or null>",
  "crisis_type_hint": "flood" | "heatwave" | "accident" | "road_blockage" | "infrastructure_failure" | "unknown",
  "severity_keywords": ["list", "of", "key", "phrases"],
  "urgency": "low" | "medium" | "high" | "critical",
  "confidence": <float 0.0-1.0>,
  "reasoning": "<1-2 sentence explanation of your extraction logic>"
}

Common Roman Urdu crisis terms:
- pani bhar gaya = water filled / flooded
- gaariyan phans gayi = cars got stuck
- raasta band = road blocked
- aag lag gayi = fire broke out
- haadsa = accident
- garam = hot / heatwave
- bijli gul = power outage
- imaarat giri = building collapsed
- madad chahiye = need help

Be precise about location names. Pakistani sector codes like G-10, I-8, F-7, G-9, I-10, E-11 refer to Islamabad sectors.
"""


class SignalNormalizerAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="SignalNormalizerAgent",
            system_prompt=_SYSTEM_PROMPT,
        )

    async def run(self, input_data: dict) -> dict:
        """
        input_data keys:
          - text (str): raw social media post or citizen report

        Returns:
          - normalized_signal (dict): extracted signal fields
          - agent_trace (dict): reasoning trace record
        """
        t0   = time.monotonic()
        text = input_data.get("text", "").strip()

        if not text:
            return {
                "normalized_signal": {
                    "original_text":    "",
                    "translated_text":  "",
                    "detected_language": "unknown",
                    "location":         None,
                    "crisis_type_hint": "unknown",
                    "severity_keywords": [],
                    "urgency":          "low",
                    "confidence":       0.0,
                    "reasoning":        "Empty input provided.",
                },
                "agent_trace": self._make_trace(input_data, {}, "Empty input — skipping LLM call.", 0),
            }

        user_msg = f"Extract crisis signal from this report:\n\n\"{text}\""
        raw, elapsed = await self._call_llm(user_msg, json_mode=True)
        parsed = self._parse_json(raw)

        # Ensure required keys exist with defaults
        parsed.setdefault("original_text",    text)
        parsed.setdefault("translated_text",  text)
        parsed.setdefault("detected_language","english")
        parsed.setdefault("location",         None)
        parsed.setdefault("crisis_type_hint", "unknown")
        parsed.setdefault("severity_keywords",[])
        parsed.setdefault("urgency",          "medium")
        parsed.setdefault("confidence",       0.5)
        parsed.setdefault("reasoning",        "")

        reasoning = parsed.get("reasoning", "")
        trace = self._make_trace(input_data, parsed, reasoning, elapsed)

        return {
            "normalized_signal": parsed,
            "agent_trace":       trace,
        }
