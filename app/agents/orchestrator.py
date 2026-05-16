"""
CIRO Orchestrator
Coordinates all 5 agents in sequence: 1→2→3→4→5
Manages shared CrisisState and aggregated agent_trace log.
"""

import time
import uuid
import logging
from datetime import datetime, timezone

from app.agents.signal_normalizer  import SignalNormalizerAgent
from app.agents.crisis_detector    import CrisisDetectorAgent
from app.agents.situation_analyst  import SituationAnalystAgent
from app.agents.action_planner     import ActionPlannerAgent
from app.agents.simulation_agent   import SimulationAgent

logger = logging.getLogger(__name__)


class CIROOrchestrator:
    """
    ADK-style root orchestrator.
    Sequences 5 specialized agents and aggregates their trace logs.
    """

    def __init__(self):
        self.agent1 = SignalNormalizerAgent()
        self.agent2 = CrisisDetectorAgent()
        self.agent3 = SituationAnalystAgent()
        self.agent4 = ActionPlannerAgent()
        self.agent5 = SimulationAgent()

    async def run_ingest(self, text: str) -> dict:
        """
        Run Agents 1 & 2 only (fast ingest path).
        Returns: session_id, normalized_signal, crisis_detection, agent_traces
        """
        session_id  = str(uuid.uuid4())
        agent_traces = []
        state: dict  = {"text": text}

        logger.info("[Orchestrator] Ingest session %s started", session_id)
        t_start = time.monotonic()

        # Agent 1 — SignalNormalizer
        result1 = await self.agent1.run(state)
        state.update(result1)
        agent_traces.append(result1["agent_trace"])
        logger.info("[Orchestrator] Agent 1 done — location=%s, hint=%s",
                    result1["normalized_signal"].get("location"),
                    result1["normalized_signal"].get("crisis_type_hint"))

        # Agent 2 — CrisisDetector
        result2 = await self.agent2.run(state)
        state.update(result2)
        agent_traces.append(result2["agent_trace"])
        logger.info("[Orchestrator] Agent 2 done — crisis=%s, confidence=%.2f",
                    result2["crisis_detection"].get("crisis_type"),
                    result2["crisis_detection"].get("confidence_score", 0))

        elapsed_ms = int((time.monotonic() - t_start) * 1000)

        return {
            "session_id":        session_id,
            "normalized_signal": state["normalized_signal"],
            "crisis_detection":  state["crisis_detection"],
            "agent_traces":      agent_traces,
            "pipeline_stage":    "ingest_complete",
            "elapsed_ms":        elapsed_ms,
            "timestamp":         datetime.now(timezone.utc).isoformat(),
            # Persist session state for /api/analyze to pick up
            "_session_state":    state,
        }

    async def run_analyze(self, session_state: dict) -> dict:
        """
        Run Agents 3, 4 & 5 (analysis + planning + simulation).
        Expects session_state from run_ingest().
        """
        agent_traces = []
        state        = dict(session_state)

        logger.info("[Orchestrator] Analyze phase started")
        t_start = time.monotonic()

        # Agent 3 — SituationAnalyst
        result3 = await self.agent3.run(state)
        state.update(result3)
        agent_traces.append(result3["agent_trace"])
        logger.info("[Orchestrator] Agent 3 done — severity=%s",
                    result3["situation_report"].get("severity"))

        # Agent 4 — ActionPlanner
        result4 = await self.agent4.run(state)
        state.update(result4)
        agent_traces.append(result4["agent_trace"])
        logger.info("[Orchestrator] Agent 4 done — urgency=%s",
                    state["situation_report"].get("recommended_urgency"))

        # Agent 5 — SimulationAgent
        result5 = await self.agent5.run(state)
        state.update(result5)
        agent_traces.append(result5["agent_trace"])
        logger.info("[Orchestrator] Agent 5 done — sim_id=%s",
                    result5["simulation"].get("simulation_id"))

        elapsed_ms = int((time.monotonic() - t_start) * 1000)

        return {
            "situation_report": state["situation_report"],
            "action_plan":      state["action_plan"],
            "simulation":       state["simulation"],
            "agent_traces":     agent_traces,
            "pipeline_stage":   "analyze_complete",
            "total_elapsed_ms": elapsed_ms,
            "timestamp":        datetime.now(timezone.utc).isoformat(),
        }

    async def run_full_pipeline(self, text: str) -> dict:
        """
        Run all 5 agents end-to-end (used by /api/demo and combined ingest+analyze).
        Returns full CIRO response with all 5 agent traces.
        """
        session_id   = str(uuid.uuid4())
        agent_traces = []
        state: dict  = {"text": text}

        logger.info("[Orchestrator] Full pipeline session %s started", session_id)
        t_start = time.monotonic()

        for i, (agent, key) in enumerate([
            (self.agent1, "normalized_signal"),
            (self.agent2, "crisis_detection"),
            (self.agent3, "situation_report"),
            (self.agent4, "action_plan"),
            (self.agent5, "simulation"),
        ], start=1):
            result = await agent.run(state)
            state.update(result)
            agent_traces.append(result["agent_trace"])
            logger.info("[Orchestrator] Agent %d (%s) completed", i, agent.name)

        elapsed_ms = int((time.monotonic() - t_start) * 1000)

        # Build clean top-level response
        detection = state.get("crisis_detection", {})
        situation = state.get("situation_report", {})

        return {
            "session_id":        session_id,
            "crisis_type":       detection.get("crisis_type", "unknown"),
            "confidence_score":  detection.get("confidence_score", 0.0),
            "affected_area":     detection.get("affected_area", "unknown"),
            "severity":          situation.get("severity", "medium"),
            "severity_score":    situation.get("severity_score", 5),
            "crisis_summary":    situation.get("crisis_summary", ""),
            "normalized_signal": state.get("normalized_signal", {}),
            "crisis_detection":  detection,
            "situation_report":  situation,
            "action_plan":       state.get("action_plan", {}),
            "simulation":        state.get("simulation", {}),
            "agent_traces":      agent_traces,
            "pipeline_stage":    "full_pipeline_complete",
            "total_elapsed_ms":  elapsed_ms,
            "timestamp":         datetime.now(timezone.utc).isoformat(),
        }
