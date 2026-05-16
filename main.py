"""
CIRO — Crisis Intelligence & Response Orchestrator
FastAPI application entry point.

Run with:
    uvicorn main:app --reload --port 8000
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config   import validate_config, get_config_summary, APP_NAME, APP_VERSION
from app.api.routes import router

logger = logging.getLogger(__name__)


# ── Lifespan (startup / shutdown) ─────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Startup ──────────────────────────────────────────────────────────────
    logger.info("=" * 60)
    logger.info("  CIRO v%s starting up", APP_VERSION)
    logger.info("=" * 60)

    # Validate required config
    validate_config()
    cfg = get_config_summary()
    logger.info("  LLM model  : %s", cfg["llm_model"])
    logger.info("  Groq key   : %s", "✓ set" if cfg["groq_key_set"] else "✗ MISSING")
    logger.info("  Supabase   : %s", "enabled" if cfg["supabase_enabled"] else "disabled (in-memory logs)")
    logger.info("=" * 60)

    yield   # ← app runs here

    # ── Shutdown ─────────────────────────────────────────────────────────────
    logger.info("[CIRO] Shutting down.")


# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title=f"{APP_NAME} — Crisis Intelligence & Response Orchestrator",
    description=(
        "Multi-agent AI system for detecting and responding to urban crises "
        "in Pakistani cities (Islamabad, Lahore). "
        "Accepts English, Roman Urdu, and Hinglish input."
    ),
    version=APP_VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # React Native / Expo needs this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(router)


# ── Root health ───────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"], summary="Root health check")
def root():
    return {
        "status":  "ok",
        "system":  APP_NAME,
        "version": APP_VERSION,
        "docs":    "/docs",
        "demo":    "/api/demo",
    }


@app.get("/health", tags=["Health"], summary="Health check with config summary")
def health():
    return {
        "status": "healthy",
        **get_config_summary(),
    }
