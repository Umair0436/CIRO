"""
CIRO Configuration
Centralizes all env vars, model settings, and feature flags.
"""

import os
import logging
from dotenv import load_dotenv

load_dotenv()

# ── Logging ───────────────────────────────────────────────────────────────────
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL, logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)

# ── Groq LLM ──────────────────────────────────────────────────────────────────
GROQ_API_KEY    = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL      = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
GROQ_TEMPERATURE = float(os.getenv("GROQ_TEMPERATURE", "0.1"))
GROQ_MAX_TOKENS  = int(os.getenv("GROQ_MAX_TOKENS", "2048"))

# ── Supabase (optional — log persistence) ────────────────────────────────────
SUPABASE_URL    = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY    = os.getenv("SUPABASE_KEY", "")
ENABLE_SUPABASE = bool(SUPABASE_URL and SUPABASE_KEY)

# ── External APIs ────────────────────────────────────────────────────────────
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "")
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY", "")

# ── Application ───────────────────────────────────────────────────────────────
APP_VERSION     = "2.0.0"
APP_NAME        = "CIRO"
SESSION_TTL_S   = int(os.getenv("SESSION_TTL_S", "3600"))
MAX_LOG_ENTRIES = int(os.getenv("MAX_LOG_ENTRIES", "200"))


def validate_config() -> None:
    """Raise EnvironmentError if critical vars are missing."""
    if not GROQ_API_KEY:
        raise EnvironmentError(
            "[CIRO] GROQ_API_KEY is not set. "
            "Please add it to your .env file. "
            "Get a free key at https://console.groq.com"
        )


def get_config_summary() -> dict:
    """Return a sanitised (no secrets) config summary for health endpoints."""
    return {
        "app":             APP_NAME,
        "version":         APP_VERSION,
        "llm_model":       GROQ_MODEL,
        "groq_key_set":    bool(GROQ_API_KEY),
        "supabase_enabled": ENABLE_SUPABASE,
        "log_level":       LOG_LEVEL,
    }
