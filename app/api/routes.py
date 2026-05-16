"""
CIRO API Routes
FastAPI router with all CIRO endpoints.

Endpoints:
  POST /api/ingest   — run Agents 1-2, return session_id + detection
  POST /api/analyze  — run Agents 3-4-5 using session from ingest
  GET  /api/logs     — return recent agent trace logs
  GET  /api/demo     — full pipeline run with hardcoded G-10 flood input
  GET  /api/status/{session_id} — check session state
"""

import logging
from fastapi import APIRouter, HTTPException, Query

from app.api.models   import (
    IngestRequest, IngestResponse,
    AnalyzeRequest, AnalyzeResponse,
    LogsResponse, LogEntry,
)
from app.api.log_store       import log_store
from app.pipeline.runner     import run_ingest_pipeline, run_analyze_pipeline, run_full_pipeline

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["CIRO"])


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/ingest
# ─────────────────────────────────────────────────────────────────────────────
@router.post(
    "/ingest",
    response_model=IngestResponse,
    summary="Ingest crisis signal (Agents 1-2)",
    description=(
        "Accepts raw text in English, Roman Urdu, or Hinglish. "
        "Runs SignalNormalizerAgent and CrisisDetectorAgent. "
        "Returns a session_id to pass to /api/analyze."
    ),
)
async def ingest(request: IngestRequest) -> IngestResponse:
    logger.info("[/api/ingest] text=%s", request.text[:80])
    try:
        result = await run_ingest_pipeline(request.text)
    except Exception as exc:
        import traceback
        tb = traceback.format_exc()
        raise HTTPException(status_code=500, detail=tb)

    # Log to store
    log_store.append({
        "session_id":    result["session_id"],
        "pipeline_stage": "ingest_complete",
        "crisis_type":   result["crisis_detection"].get("crisis_type"),
        "affected_area": result["crisis_detection"].get("affected_area"),
        "agent_count":   len(result["agent_traces"]),
        "elapsed_ms":    result["elapsed_ms"],
        "timestamp":     result["timestamp"],
    })

    return IngestResponse(**result)


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/analyze
# ─────────────────────────────────────────────────────────────────────────────
@router.post(
    "/analyze",
    response_model=AnalyzeResponse,
    summary="Full crisis analysis (Agents 3-4-5)",
    description=(
        "Takes a session_id from /api/ingest. "
        "Runs SituationAnalystAgent, ActionPlannerAgent, SimulationAgent. "
        "Returns the complete CIRO crisis response."
    ),
)
async def analyze(request: AnalyzeRequest) -> AnalyzeResponse:
    logger.info("[/api/analyze] session_id=%s", request.session_id)

    session = log_store.get_session(request.session_id)
    if not session:
        raise HTTPException(
            status_code=404,
            detail=(
                f"Session '{request.session_id}' not found. "
                "Please call POST /api/ingest first to create a session."
            ),
        )

    try:
        result = await run_analyze_pipeline(request.session_id, session)
    except Exception as exc:
        logger.exception("[/api/analyze] Pipeline error")
        raise HTTPException(status_code=500, detail=f"Analyze pipeline error: {exc}")

    # Log to store
    log_store.append({
        "session_id":    request.session_id,
        "pipeline_stage": "analyze_complete",
        "crisis_type":   result.get("crisis_type"),
        "severity":      result.get("severity"),
        "affected_area": result.get("affected_area"),
        "agent_count":   len(result["agent_traces"]),
        "elapsed_ms":    result.get("total_elapsed_ms", 0),
        "timestamp":     result["timestamp"],
    })

    return AnalyzeResponse(**result)


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/logs
# ─────────────────────────────────────────────────────────────────────────────
@router.get(
    "/logs",
    response_model=LogsResponse,
    summary="Agent trace logs",
    description="Returns recent CIRO pipeline execution logs (newest first).",
)
async def get_logs(limit: int = Query(default=20, ge=1, le=200)) -> LogsResponse:
    entries_raw = log_store.get_all(limit=limit)
    entries = []
    for e in entries_raw:
        try:
            entries.append(LogEntry(**e))
        except Exception:
            pass   # skip malformed entries
    return LogsResponse(total=log_store.count, entries=entries)


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/demo
# ─────────────────────────────────────────────────────────────────────────────
_DEMO_INPUT = "G-10 mein pani bhar gaya hai, gaariyan phans gayi hain"

@router.get(
    "/demo",
    summary="Demo — G-10 flood scenario (no input required)",
    description=(
        "Runs the full 5-agent pipeline with a hardcoded G-10 Islamabad flood input. "
        "Ideal for quick demos and mobile app testing."
    ),
)
async def demo() -> dict:
    logger.info("[/api/demo] Running demo pipeline: '%s'", _DEMO_INPUT)
    try:
        result = await run_full_pipeline(_DEMO_INPUT)
    except Exception as exc:
        logger.exception("[/api/demo] Pipeline error")
        raise HTTPException(status_code=500, detail=f"Demo pipeline error: {exc}")

    log_store.append({
        "session_id":    result.get("session_id", "demo"),
        "pipeline_stage": "full_pipeline_complete",
        "crisis_type":   result.get("crisis_type"),
        "severity":      result.get("severity"),
        "affected_area": result.get("affected_area"),
        "agent_count":   len(result.get("agent_traces", [])),
        "elapsed_ms":    result.get("total_elapsed_ms", 0),
        "timestamp":     result.get("timestamp", ""),
    })
    return result


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/status/{session_id}
# ─────────────────────────────────────────────────────────────────────────────
@router.get(
    "/status/{session_id}",
    summary="Session status",
    description="Check whether a session exists and its current pipeline stage.",
)
async def session_status(session_id: str) -> dict:
    session = log_store.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found.")
    return {
        "session_id": session_id,
        "exists":     True,
        "stage":      session.get("pipeline_stage", "ingest_complete"),
        "crisis_type": session.get("crisis_detection", {}).get("crisis_type"),
        "location":    session.get("normalized_signal", {}).get("location"),
    }
