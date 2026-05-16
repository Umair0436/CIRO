# CIRO — Design Specification
## Crisis Intelligence & Response Orchestrator
### Multi-Agent Architecture v2.0

---

## 1. System Overview

CIRO is a multi-agent AI system designed to detect, analyze, and coordinate responses to urban crises in Pakistani cities — starting with Islamabad. It accepts multilingual input (English, Roman Urdu, Hinglish) and orchestrates five specialized AI agents in a sequential pipeline, producing structured crisis intelligence and coordinated response plans.

```
┌─────────────────────────────────────────────────────────────────┐
│                        User / Mobile App                        │
│          POST /api/ingest  ·  POST /api/analyze                 │
│          GET  /api/logs    ·  GET  /api/demo                    │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FastAPI Application                          │
│                  CORS · Lifespan · Router                       │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Pipeline Runner                              │
│        run_ingest_pipeline / run_analyze_pipeline               │
│        run_full_pipeline (demo)                                 │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   CIROOrchestrator                              │
│           Sequences agents, manages shared state                │
└──┬──────────┬──────────┬──────────┬──────────┬─────────────────┘
   │          │          │          │          │
   ▼          ▼          ▼          ▼          ▼
Agent 1    Agent 2    Agent 3    Agent 4    Agent 5
Signal     Crisis     Situation  Action     Simulation
Normalizer Detector   Analyst    Planner    Agent
   │          │          │          │          │
   └──────────┴──────────┴──────────┴──────────┘
                         │
              ┌──────────┴──────────┐
              │    Mock Data Layer  │
              │  geo · weather      │
              │  traffic · resources│
              └─────────────────────┘
```

---

## 2. Agent Architecture

### Agent Design Pattern (Custom ADK-Style)

Each agent is a Python class with:
- `name: str` — unique agent identifier
- `system_prompt: str` — LLM persona and output format specification
- `run(input_data: dict) -> dict` — async method returning structured output + trace

All agents use:
- **Groq API** (llama-3.3-70b-versatile) as the LLM backend
- **JSON mode** (`response_format={"type": "json_object"}`) for guaranteed structured output
- **Shared trace format** — every run produces an `agent_trace` dict for full observability

### Agent 1 — SignalNormalizerAgent

**Purpose**: Normalize multilingual crisis reports into structured signals.

**Input**: Raw text (English / Roman Urdu / Hinglish / Urdu)

**Output**:
```json
{
  "original_text": "G-10 mein pani bhar gaya hai",
  "translated_text": "Water has filled in G-10",
  "detected_language": "roman_urdu",
  "location": "G-10",
  "crisis_type_hint": "flood",
  "severity_keywords": ["pani bhar gaya", "gaariyan phans gayi"],
  "urgency": "high",
  "confidence": 0.91,
  "reasoning": "Roman Urdu text describing water logging and vehicle entrapment."
}
```

**Roman Urdu lexicon handled**:
| Roman Urdu | English |
|---|---|
| pani bhar gaya | water filled / flooded |
| gaariyan phans gayi | cars got stuck |
| raasta band | road blocked |
| aag lag gayi | fire broke out |
| haadsa | accident |
| bijli gul | power outage |
| imaarat giri | building collapsed |

---

### Agent 2 — CrisisDetectorAgent

**Purpose**: Classify crisis type with confidence score using multi-source data fusion.

**Input**: Normalized signal + real-time weather + traffic context

**Crisis Types**:
| Type | Description |
|---|---|
| `flood` | Water logging, inundation, drainage overflow |
| `heatwave` | Temperature > 40°C, heat stroke risk |
| `accident` | Road/vehicle accident, fire |
| `road_blockage` | Protest, debris, fallen structure |
| `infrastructure_failure` | Power outage, bridge/building collapse |

**Confidence Scoring**:
- Social signal only → max 0.70
- Social + corroborating weather → max 0.85
- All three sources aligned → max 0.97

---

### Agent 3 — SituationAnalystAgent

**Purpose**: Synthesize multi-source intelligence into a professional crisis report.

**Severity Levels**:
| Level | Score | Threshold |
|---|---|---|
| `low` | 1-3 | < 100 affected, minimal disruption |
| `medium` | 4-6 | 100-1,000 affected, property damage |
| `high` | 7-8 | 1,000-10,000 affected, injuries possible |
| `critical` | 9-10 | > 10,000 affected, life threat, infrastructure failure |

---

### Agent 4 — ActionPlannerAgent

**Purpose**: Generate a coordinated 4-category response plan.

**Output Categories**:
1. **traffic_rerouting** — alternate routes, diversion checkpoints, estimated delays
2. **emergency_dispatch** — services (Rescue 1122, NDMA, CDA), deployment points, ETA
3. **public_alerts** — SMS (160 char), push notification, radio broadcast in English & Urdu
4. **resource_allocation** — rescue teams, water pumps, ambulances, emergency shelters

---

### Agent 5 — SimulationAgent

**Purpose**: Simulate execution of all action plan items and quantify impact.

**Output**:
- `before_state` — conditions before response (road passability, flood level, trapped persons)
- `after_state` — conditions after full response deployment
- `mock_tickets` — 3-5 emergency dispatch tickets with IDs (TKT-YYYYMMDD-XXXXXX)
- `alert_dispatch_log` — 3-4 alert records per channel (SMS, push, PA, radio)
- `route_updates` — 2-3 CDA/NHMP route modification records
- `metrics` — response time, resources deployed, lives protected, property saved

---

## 3. Data Flow

```
POST /api/ingest
  ├── text: "G-10 mein pani bhar gaya hai..."
  │
  ├─► Agent 1: SignalNormalizerAgent
  │     └── normalized_signal (location, crisis_type_hint, urgency)
  │
  ├─► Agent 2: CrisisDetectorAgent
  │     ├── Injects: weather_data[G-10] + traffic_data[G-10]
  │     └── crisis_detection (crisis_type, confidence_score, affected_area)
  │
  └── Returns: {session_id, normalized_signal, crisis_detection, agent_traces}

POST /api/analyze {session_id}
  ├── Loads session state from log_store
  │
  ├─► Agent 3: SituationAnalystAgent
  │     └── situation_report (severity, crisis_summary, impact_assessment)
  │
  ├─► Agent 4: ActionPlannerAgent
  │     ├── Injects: geo_data[G-10] alternate routes
  │     ├── Injects: resource_summary(flood, high)
  │     └── action_plan (traffic, dispatch, alerts, resources)
  │
  ├─► Agent 5: SimulationAgent
  │     └── simulation (before_state, after_state, tickets, logs, metrics)
  │
  └── Returns: full CIRO response with 3 agent_traces
```

---

## 4. Mock Data Sources

| Source | Description | Sectors |
|---|---|---|
| `geo_data.py` | Sector coordinates, populations, adjacency, alternate routes | G-10, G-9, I-8, I-10, F-7, E-11, F-10, G-11 |
| `weather_data.py` | PMD-simulated rainfall, temperature, flood risk | All sectors |
| `traffic_data.py` | NHA-simulated congestion %, blocked roads, average speed | All sectors |
| `resources.py` | Emergency teams, ambulances, water pumps, helicopters, shelters | Islamabad-wide |

---

## 5. API Contract

### POST /api/ingest
```
Request:  { "text": "crisis report string" }
Response: {
  "session_id": "uuid",
  "normalized_signal": {...},
  "crisis_detection": {...},
  "agent_traces": [...],
  "pipeline_stage": "ingest_complete",
  "elapsed_ms": 1234,
  "timestamp": "ISO8601"
}
```

### POST /api/analyze
```
Request:  { "session_id": "uuid" }
Response: {
  "session_id": "uuid",
  "crisis_type": "flood",
  "confidence_score": 0.94,
  "affected_area": "G-10",
  "severity": "high",
  "severity_score": 8,
  "crisis_summary": "...",
  "normalized_signal": {...},
  "crisis_detection": {...},
  "situation_report": {...},
  "action_plan": {
    "traffic_rerouting": {...},
    "emergency_dispatch": {...},
    "public_alerts": {...},
    "resource_allocation": {...}
  },
  "simulation": {
    "simulation_id": "SIM-20240516-ABC123",
    "before_state": {...},
    "after_state": {...},
    "mock_tickets": [...],
    "alert_dispatch_log": [...],
    "route_updates": [...],
    "metrics": {...}
  },
  "agent_traces": [...5 traces...],
  "total_elapsed_ms": 4567,
  "timestamp": "ISO8601"
}
```

### GET /api/demo
Zero-input endpoint. Runs full pipeline with:
> "G-10 mein pani bhar gaya hai, gaariyan phans gayi hain"

### GET /api/logs?limit=20
Returns recent pipeline execution logs (newest first).

---

## 6. Technology Stack

| Layer | Technology |
|---|---|
| Backend framework | FastAPI 0.111 |
| LLM | Groq API — llama-3.3-70b-versatile |
| Agent pattern | Custom ADK-style (no external orchestration library) |
| Data validation | Pydantic v2 |
| Mobile frontend | React Native Expo |
| Log storage | In-memory deque (+ optional Supabase) |
| Python | 3.11+ |

---

## 7. Security & Deployment Notes

- All secrets stored in `.env` (never committed)
- CORS configured to allow all origins (mobile app requirement)
- Supabase integration is optional — system works fully without it
- Session state stored in-memory; expires on server restart
- Rate limiting not implemented (hackathon scope)
