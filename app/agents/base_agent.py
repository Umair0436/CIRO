"""
CIRO Base Agent
Custom ADK-style agent pattern — no google-adk dependency.

Every agent is a Python class with:
  - name          : str
  - system_prompt : str
  - run(input)    -> dict   (must be implemented by subclasses)

Shared helpers:
  - _call_llm(user_msg) -> str        (async Gemini/Groq call with JSON mode)
  - _parse_json(raw)    -> dict       (strips fences, parses JSON)
  - _make_trace(...)    -> dict       (creates agent trace record)
"""

import json
import time
import uuid
import logging
import os
from google import genai
from google.genai import types
from groq import AsyncGroq
from app.config import GROQ_API_KEY, GROQ_MODEL, GROQ_TEMPERATURE, GROQ_MAX_TOKENS

logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")


class BaseAgent:
    """
    ADK-style base agent. Subclasses only need to implement `run()`.
    """

    def __init__(self, name: str, system_prompt: str):
        self.name          = name
        self.system_prompt = system_prompt
        self._groq_client  = AsyncGroq(api_key=GROQ_API_KEY)
        self._gemini_model = "gemini-2.0-flash"

    # ── Public interface ──────────────────────────────────────────────────────

    async def run(self, input_data: dict) -> dict:
        """
        Entry point for every agent. Must return a dict that includes:
          - 'agent_trace': dict   (one trace record for this invocation)
          - agent-specific keys
        """
        raise NotImplementedError(f"{self.name}.run() not implemented")

    # ── LLM helpers ───────────────────────────────────────────────────────────

    async def _call_llm(self, user_message: str, json_mode: bool = True):
        return await self._call_groq(user_message, json_mode)

    async def _call_gemini(self, user_message: str, json_mode: bool = True):
        t0 = time.monotonic()
        client = genai.Client(api_key=GEMINI_API_KEY)
        response = await client.aio.models.generate_content(
            model=self._gemini_model,
            contents=self.system_prompt + "\n\n" + user_message,
            config=types.GenerateContentConfig(
                response_mime_type="application/json" if json_mode else "text/plain",
                temperature=GROQ_TEMPERATURE,
            ),
        )
        elapsed = int((time.monotonic() - t0) * 1000)
        content = response.text or ""
        logger.debug("[%s] Gemini LLM call completed in %dms", self.name, elapsed)
        return content.strip(), elapsed

    async def _call_groq(self, user_message: str, json_mode: bool = True):
        kwargs: dict = {
            "model":       GROQ_MODEL,
            "temperature": GROQ_TEMPERATURE,
            "max_tokens":  GROQ_MAX_TOKENS,
            "messages": [
                {"role": "system", "content": self.system_prompt},
                {"role": "user",   "content": user_message},
            ],
        }
        if json_mode:
            kwargs["response_format"] = {"type": "json_object"}

        t0       = time.monotonic()
        response = await self._groq_client.chat.completions.create(**kwargs)
        elapsed  = int((time.monotonic() - t0) * 1000)

        content = response.choices[0].message.content or ""
        logger.debug("[%s] Groq LLM call completed in %dms", self.name, elapsed)
        return content.strip(), elapsed

    # ── JSON parsing ──────────────────────────────────────────────────────────

    def _parse_json(self, raw: str) -> dict:
        """
        Robustly parse LLM output that may contain markdown code fences.
        Falls back to an error dict rather than raising.
        """
        if "```" in raw:
            parts = raw.split("```")
            for part in parts:
                candidate = part.strip()
                if candidate.startswith("json"):
                    candidate = candidate[4:].strip()
                try:
                    return json.loads(candidate)
                except json.JSONDecodeError:
                    continue

        try:
            return json.loads(raw)
        except json.JSONDecodeError as exc:
            logger.warning(
                "[%s] JSON parse failed: %s | raw=%s", self.name, exc, raw[:200]
            )
            return {"parse_error": str(exc), "raw_response": raw[:500]}

    # ── Trace helpers ─────────────────────────────────────────────────────────

    def _make_trace(
        self,
        input_data:  dict,
        output:      dict,
        reasoning:   str = "",
        duration_ms: int = 0,
    ) -> dict:
        """
        Build a structured trace record for this agent invocation.
        Returned as 'agent_trace' key in every agent output.
        """
        return {
            "trace_id":      str(uuid.uuid4()),
            "agent":         self.name,
            "timestamp":     time.time(),
            "timestamp_iso": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "input_summary": self._safe_preview(input_data, 300),
            "reasoning":     reasoning,
            "output_keys":   list(output.keys()),
            "duration_ms":   duration_ms,
        }

    # ── Utilities ─────────────────────────────────────────────────────────────

    @staticmethod
    def _safe_preview(obj, max_chars: int = 300) -> str:
        """Convert dict to a short string preview."""
        try:
            s = json.dumps(obj, ensure_ascii=False)
            return s[:max_chars] + ("..." if len(s) > max_chars else "")
        except Exception:
            return str(obj)[:max_chars]