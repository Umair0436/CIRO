"""
CIRO Pydantic Models (v2 compatible)
All request/response schemas for the API layer.
"""

from __future__ import annotations
from typing import Any, Optional
from pydantic import BaseModel, Field, ConfigDict


# ── Shared / nested models ────────────────────────────────────────────────────

class AgentTrace(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    trace_id:      str
    agent:         str
    timestamp:     float
    timestamp_iso: str
    input_summary: str
    reasoning:     str
    output_keys:   list[str]
    duration_ms:   int


class ImpactAssessment(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    immediate_threats:          list[str] = []
    at_risk_groups:             list[str] = []
    infrastructure_at_risk:     list[str] = []
    estimated_affected_people:  int       = 0


class TimelineEstimate(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    onset:      Optional[str] = None
    peak:       Optional[str] = None
    resolution: Optional[str] = None


class SituationReport(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    severity:            str
    severity_score:      int
    crisis_summary:      str
    impact_assessment:   dict[str, Any] = {}
    timeline_estimate:   dict[str, Any] = {}
    escalation_risk:     str = "medium"
    escalation_factors:  list[str] = []
    recommended_urgency: str = "respond"
    reasoning:           str = ""


class TrafficRerouting(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    blocked_areas:         list[str] = []
    alternate_routes:      list[str] = []
    estimated_delay_mins:  int       = 0
    diversion_points:      list[str] = []


class EmergencyDispatch(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    services:          list[str] = []
    deployment_points: list[str] = []
    response_time_mins: int      = 0
    command_center:    str       = ""


class PublicAlerts(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    sms_message:        str       = ""
    push_notification:  str       = ""
    broadcast_message:  str       = ""
    languages:          list[str] = ["English", "Urdu"]
    affected_zones:     list[str] = []


class ActionPlan(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    traffic_rerouting:        dict[str, Any] = {}
    emergency_dispatch:       dict[str, Any] = {}
    public_alerts:            dict[str, Any] = {}
    resource_allocation:      dict[str, Any] = {}
    coordination_notes:       str            = ""
    priority_order:           list[str]      = []
    estimated_resolution_hrs: float          = 4.0


class MockTicket(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    ticket_id:   str
    type:        str
    status:      str
    assigned_to: str
    location:    str
    created_at:  str
    eta_mins:    int = 0


class AlertLog(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    log_id:     str
    channel:    str
    message:    str
    recipients: int = 0
    sent_at:    str
    status:     str = "delivered"


class RouteUpdate(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    update_id:      str
    action:         str
    road:           str
    alternate:      str = ""
    effective_from: str
    authority:      str = "CDA Traffic"


class SimulationMetrics(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    response_time_mins:           int = 0
    resources_deployed:           int = 0
    estimated_lives_protected:    int = 0
    estimated_property_saved_pkr: int = 0


class SimulationResult(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    simulation_id:      str
    before_state:       dict[str, Any] = {}
    after_state:        dict[str, Any] = {}
    improvement_summary: str           = ""
    mock_tickets:       list[Any]      = []
    alert_dispatch_log: list[Any]      = []
    route_updates:      list[Any]      = []
    metrics:            dict[str, Any] = {}


# ── Request models ────────────────────────────────────────────────────────────

class IngestRequest(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    text: str = Field(..., min_length=3, description="Raw crisis report text (English/Roman Urdu/Hinglish)")


class AnalyzeRequest(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    session_id: str = Field(..., description="Session ID from /api/ingest response")


# ── Response models ───────────────────────────────────────────────────────────

class IngestResponse(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    session_id:        str
    normalized_signal: dict[str, Any]
    crisis_detection:  dict[str, Any]
    agent_traces:      list[dict[str, Any]]
    pipeline_stage:    str
    elapsed_ms:        int
    timestamp:         str


class AnalyzeResponse(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    session_id:        str
    crisis_type:       str
    confidence_score:  float
    affected_area:     str
    severity:          str
    severity_score:    int
    crisis_summary:    str
    normalized_signal: dict[str, Any]
    crisis_detection:  dict[str, Any]
    situation_report:  dict[str, Any]
    action_plan:       dict[str, Any]
    simulation:        dict[str, Any]
    agent_traces:      list[dict[str, Any]]
    pipeline_stage:    str
    total_elapsed_ms:  int
    timestamp:         str


class LogEntry(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    session_id:    str
    pipeline_stage: str
    crisis_type:   Optional[str] = None
    severity:      Optional[str] = None
    affected_area: Optional[str] = None
    agent_count:   int
    elapsed_ms:    int
    timestamp:     str


class LogsResponse(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    total:   int
    entries: list[LogEntry]


class HealthResponse(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    status:  str
    system:  str
    version: str
    config:  dict[str, Any]
