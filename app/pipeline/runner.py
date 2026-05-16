"""
CIRO Pipeline Runner
Async orchestration functions called by the API routes.
Manages session state lifecycle.
"""

import logging
from app.agents.orchestrator import CIROOrchestrator
from app.api.log_store       import log_store

logger = logging.getLogger(__name__)

# Single orchestrator instance (stateless agents, safe to reuse)
_orchestrator = CIROOrchestrator()


async def run_ingest_pipeline(text: str) -> dict:
    """
    Run Agents 1 & 2 (signal normalization + crisis detection).
    Saves session state to log_store for the analyze step.

    Returns full ingest result dict including session_id.
    """
    result = await _orchestrator.run_ingest(text)

    # Persist session state for /api/analyze
    session_id    = result["session_id"]
    session_state = result.pop("_session_state", {})
    log_store.save_session(session_id, session_state)

    logger.info("[Runner] Ingest saved — session_id=%s", session_id)
    return result


async def run_analyze_pipeline(session_id: str, session_state: dict) -> dict:
    """
    Run Agents 3, 4 & 5 (situation analysis + action planning + simulation).
    Uses session_state returned from log_store.

    Returns full analyze result dict.
    """
    result = await _orchestrator.run_analyze(session_state)

    # Add the session_id to the result for the response model
    detection = session_state.get("crisis_detection", {})
    signal    = session_state.get("normalized_signal", {})

    result["session_id"]       = session_id
    result["crisis_type"]      = detection.get("crisis_type", "unknown")
    result["confidence_score"] = detection.get("confidence_score", 0.0)
    result["affected_area"]    = detection.get("affected_area", "unknown")
    result["severity"]         = result.get("situation_report", {}).get("severity", "medium")
    result["severity_score"]   = result.get("situation_report", {}).get("severity_score", 5)
    result["crisis_summary"]   = result.get("situation_report", {}).get("crisis_summary", "")
    result["normalized_signal"] = signal
    result["crisis_detection"]  = detection

    # Cleanup session after analyze (optional — keep for re-analysis)
    # log_store.delete_session(session_id)

    logger.info("[Runner] Analyze complete — session_id=%s", session_id)
    return result


async def run_full_pipeline(text: str) -> dict:
    """
    Run all 5 agents in one shot (used by /api/demo).
    Does NOT require a prior ingest call.
    """
    result = await _orchestrator.run_full_pipeline(text)
    logger.info(
        "[Runner] Full pipeline complete — crisis=%s, severity=%s, elapsed=%dms",
        result.get("crisis_type"),
        result.get("severity"),
        result.get("total_elapsed_ms", 0),
    )
    return result
