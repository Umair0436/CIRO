"""
Agent 1 - Signal Collector
Responsibility: Accept raw inputs (social post, weather alert, traffic data)
and normalize them into a clean, unified signal dictionary.
Uses Groq LLM to translate/parse social posts in Roman Urdu, Urdu, or English.
"""

from langchain_groq import ChatGroq
from langchain.schema import HumanMessage, SystemMessage
from app.config import GROQ_API_KEY, GROQ_MODEL
import json

# Initialize Groq LLM
llm = ChatGroq(api_key=GROQ_API_KEY, model_name=GROQ_MODEL, temperature=0)


SYSTEM_PROMPT = """You are a signal normalization assistant for CIRO, a crisis response system in Pakistan.

Your job is to read a social media post (which may be in Roman Urdu, Urdu, or English) and extract structured information.

Return ONLY valid JSON in this exact format:
{
  "original_text": "<the original post>",
  "translated_text": "<English translation>",
  "detected_language": "roman_urdu" | "urdu" | "english",
  "location_mentioned": "<location name or null>",
  "crisis_hint": "<brief description of what the post suggests, e.g. flooding, accident, heatwave, or unknown>",
  "urgency": "low" | "medium" | "high"
}

Do not add any explanation. Return only the JSON object."""


def normalize_social_post(post: str) -> dict:
    """Use Groq LLM to parse and normalize a social media post."""
    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=f"Social post: {post}"),
    ]
    response = llm.invoke(messages)
    raw = response.content.strip()

    # Strip markdown code fences if present
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    return json.loads(raw)


def run_signal_collector(state: dict) -> dict:
    """
    Agent 1 entry point.
    
    Expects state keys:
        - social_post (str): raw social media post
        - weather_alert (dict): e.g. {"location": "G-10", "condition": "Heavy Rainfall", "intensity": "high"}
        - traffic_data (dict): e.g. {"location": "G-10", "congestion_pct": 95, "blocked_roads": 3}
    
    Adds to state:
        - normalized_signals (dict): clean unified signal package
    """
    social_post = state.get("social_post", "")
    weather_alert = state.get("weather_alert", {})
    traffic_data = state.get("traffic_data", {})

    # Normalize social post via LLM
    social_normalized = {}
    if social_post:
        social_normalized = normalize_social_post(social_post)

    # Build unified signal package
    normalized_signals = {
        "social": social_normalized,
        "weather": {
            "location": weather_alert.get("location", "unknown"),
            "condition": weather_alert.get("condition", "none"),
            "intensity": weather_alert.get("intensity", "low"),
        },
        "traffic": {
            "location": traffic_data.get("location", "unknown"),
            "congestion_pct": traffic_data.get("congestion_pct", 0),
            "blocked_roads": traffic_data.get("blocked_roads", 0),
        },
    }

    print(f"[Agent 1 - Signal Collector] Normalized signals: {normalized_signals}")

    return {**state, "normalized_signals": normalized_signals}
