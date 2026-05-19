# CIRO — Crisis Intelligence & Response Orchestrator
## Multi-Agent AI System for Urban Crisis Detection & Response

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-green)](https://fastapi.tiangolo.com)
[![Groq](https://img.shields.io/badge/LLM-Groq%20llama--3.3--70b-orange)](https://console.groq.com)
[![Python](https://img.shields.io/badge/Python-3.11+-blue)](https://python.org)

---

## What is CIRO?

CIRO is a **5-agent AI orchestration system** that:
1. **Accepts** crisis reports in English, Roman Urdu, or Hinglish
2. **Detects** urban crisis type (flood, heatwave, accident, road blockage, infrastructure failure)
3. **Analyzes** severity and impact using real-time weather + traffic data
4. **Plans** coordinated responses: traffic rerouting, emergency dispatch, public alerts, resource allocation
5. **Simulates** execution outcomes with before/after state comparison

## 🚀 Live Deployment
- **Backend API**: https://ciro-backend-658608522807.us-central1.run.app
- **API Docs**: https://ciro-backend-658608522807.us-central1.run.app/docs  
- **Web Dashboard**: https://ciroproject.netlify.app/
- **Mobile App**: APK link coming soon

---

## Quick Start

### 1. Clone & Setup
```bash
cd d:\CIRO
python -m venv venv
venv\Scripts\activate       # Windows
pip install -r requirements.txt
```

### 2. Configure Environment
```bash
copy .env.example .env
# Edit .env and set your GROQ_API_KEY
```

Get a free Groq API key at: https://console.groq.com

### 3. Run the Server
```bash
uvicorn main:app --reload --port 8000
```

### 4. Open API Docs
Navigate to: http://localhost:8000/docs

### 5. Run Demo (zero config)
```bash
curl http://localhost:8000/api/demo
```

---

## API Reference

### POST /api/ingest
Run Agents 1-2 (signal normalization + crisis detection).

```bash
curl -X POST http://localhost:8000/api/ingest \
  -H "Content-Type: application/json" \
  -d '{"text": "G-10 mein pani bhar gaya hai, gaariyan phans gayi hain"}'
```

**Response** (abbreviated):
```json
{
  "session_id": "3f7a8b2c-...",
  "normalized_signal": {
    "location": "G-10",
    "crisis_type_hint": "flood",
    "urgency": "high",
    "confidence": 0.91
  },
  "crisis_detection": {
    "crisis_type": "flood",
    "confidence_score": 0.94,
    "affected_area": "G-10, Islamabad",
    "affected_population": 85000
  },
  "agent_traces": [...]
}
```

---

### POST /api/analyze
Run Agents 3-4-5 (situation analysis + action planning + simulation).

```bash
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"session_id": "3f7a8b2c-..."}'
```

**Response** (abbreviated):
```json
{
  "crisis_type": "flood",
  "severity": "high",
  "severity_score": 8,
  "crisis_summary": "Severe urban flooding in G-10 sector...",
  "action_plan": {
    "traffic_rerouting": {
      "alternate_routes": ["Via G-9 Karachi Company → Kashmir Highway", "..."]
    },
    "emergency_dispatch": {
      "services": ["Rescue 1122 Alpha", "NDMA Rapid Response"]
    },
    "public_alerts": {
      "sms_message": "⚠️ FLOOD ALERT: G-10 flooded. Avoid area. Rescue en route."
    },
    "resource_allocation": {
      "rescue_teams": ["Rescue 1122 Alpha", "NDMA Rapid Response"],
      "water_pumps": ["WASA Dewatering Pump A", "NDMA Heavy Pump 1"]
    }
  },
  "simulation": {
    "simulation_id": "SIM-20240516-A3F7B2",
    "before_state": {"road_passability": 10, "trapped_vehicles": 23},
    "after_state":  {"road_passability": 75, "trapped_vehicles": 0},
    "mock_tickets": [...5 tickets...],
    "metrics": {
      "response_time_mins": 18,
      "estimated_lives_protected": 320
    }
  },
  "agent_traces": [...5 traces...],
  "total_elapsed_ms": 4821
}
```

---

### GET /api/demo
Full pipeline with hardcoded G-10 flood scenario. No input required.
```bash
curl http://localhost:8000/api/demo
```

---

### GET /api/logs
Recent pipeline execution logs (newest first).
```bash
curl "http://localhost:8000/api/logs?limit=10"
```

---

### GET /api/status/{session_id}
Check session state between ingest and analyze calls.
```bash
curl http://localhost:8000/api/status/3f7a8b2c-...
```

---

## Test Inputs

| Input | Expected Crisis | Language |
|---|---|---|
| `G-10 mein pani bhar gaya hai` | flood | Roman Urdu |
| `Cars stuck on I-8 after heavy rain` | flood | English |
| `G-9 par haadsa hua hai, ambulance chahiye` | accident | Roman Urdu |
| `F-7 mein bijli gul hai` | infrastructure_failure | Roman Urdu |
| `Road blocked in E-11 due to protest` | road_blockage | English |
| `Extreme heat in Islamabad, 45 degrees` | heatwave | English |

---

## Project Structure

```
CIRO/
├── main.py                          ← FastAPI app (lifespan pattern)
├── requirements.txt
├── .env                             ← Your secrets (gitignored)
├── .env.example                     ← Template
├── DESIGN_SPEC.md                   ← Full architecture spec
├── README.md                        ← This file
│
├── app/
│   ├── config.py                    ← Env vars, validation
│   │
│   ├── agents/                      ← 5 ADK-style agents
│   │   ├── base_agent.py            ← BaseAgent with Gemini (primary) + Groq fallback + API key rotation + trace
│   │   ├── signal_normalizer.py     ← Agent 1
│   │   ├── crisis_detector.py       ← Agent 2
│   │   ├── situation_analyst.py     ← Agent 3
│   │   ├── action_planner.py        ← Agent 4
│   │   ├── simulation_agent.py      ← Agent 5
│   │   └── orchestrator.py          ← Sequences all agents
│   │
│   ├── api/
│   │   ├── routes.py                ← FastAPI router
│   │   ├── models.py                ← Pydantic v2 schemas
│   │   └── log_store.py             ← In-memory log store
│   │
│   ├── mock/                        ← Simulated data (no real APIs)
│   │   ├── geo_data.py              ← Islamabad sector map
│   │   ├── weather_data.py          ← PMD-simulated weather
│   │   ├── traffic_data.py          ← NHA-simulated traffic
│   │   └── resources.py             ← Emergency resource registry
│   │
│   └── pipeline/
│       └── runner.py                ← Async pipeline orchestration
│
└── mobile/                          ← React Native Expo app
    ├── App.js
    ├── screens/
    │   ├── HomeScreen.js
    │   └── ResultScreen.js
    ├── package.json
    └── app.json
```

---

## Mobile App

```bash
cd mobile
npm install
npx expo start
```

Scan QR code with Expo Go app (iOS/Android).
Update `API_URL` in `mobile/App.js` if your server IP differs from `localhost`.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY_1` | ✅ Yes | Primary Gemini key |
| `GEMINI_API_KEY_2` | No | Rotation fallback key |
| `GROQ_API_KEY_1` | No | Groq rotation key 1 |
| `GROQ_API_KEY_2` | No | Groq rotation key 2 |
| `GROQ_API_KEY` | ✅ Yes | Groq API key (free at console.groq.com) |
| `GROQ_MODEL` | No | Default: `llama-3.3-70b-versatile` |
| `GROQ_TEMPERATURE` | No | Default: `0.1` |
| `GROQ_MAX_TOKENS` | No | Default: `2048` |
| `SUPABASE_URL` | No | Optional log persistence |
| `SUPABASE_KEY` | No | Optional log persistence |
| `LOG_LEVEL` | No | Default: `INFO` |

---

## 🛠️ Tech Stack
- **Backend**: FastAPI, Python 3.14
- **LLM**: Google Gemini 2.0 Flash (primary), Groq LLaMA (fallback)
- **Mobile**: React Native, Expo
- **Web**: HTML, CSS, JavaScript, Leaflet.js
- **Deployment**: Google Cloud Run
- **Maps**: Google Maps API

---

## 🤖 Google Antigravity Usage
CIRO was built using Google Antigravity for:
- Multi-agent workflow orchestration
- Agent design and implementation
- Bug fixing and optimization
- LLM integration (Gemini 2.0 Flash)

---

## Built For

**CIRO** was developed as a hackathon project demonstrating:
- Multi-agent AI orchestration without heavy frameworks
- Multilingual NLP for Pakistani language variants
- Real-time crisis intelligence for urban environments
- End-to-end simulation of emergency response systems
