"""
Mock Emergency Resources — Islamabad
Simulates available emergency services, equipment, and personnel.
"""

# ── Emergency services ────────────────────────────────────────────────────────
RESCUE_TEAMS: list[dict] = [
    {"id": "RT-001", "name": "Rescue 1122 Alpha",     "sector": "G-9",  "status": "available", "capacity": 12, "equipment": ["rescue_boat", "pumps", "ropes"]},
    {"id": "RT-002", "name": "Rescue 1122 Bravo",     "sector": "I-8",  "status": "available", "capacity": 10, "equipment": ["rescue_boat", "first_aid"]},
    {"id": "RT-003", "name": "NDMA Rapid Response",   "sector": "G-11", "status": "available", "capacity": 20, "equipment": ["heavy_equipment", "water_pumps", "generators"]},
    {"id": "RT-004", "name": "CDA Emergency Team",    "sector": "F-7",  "status": "available", "capacity": 8,  "equipment": ["drainage_tools", "sandbags"]},
    {"id": "RT-005", "name": "Civil Defence Unit A",  "sector": "E-11", "status": "standby",   "capacity": 15, "equipment": ["search_rescue", "first_aid"]},
]

AMBULANCES: list[dict] = [
    {"id": "AMB-001", "name": "PIMS Ambulance 1",    "sector": "G-8",  "status": "available"},
    {"id": "AMB-002", "name": "PIMS Ambulance 2",    "sector": "G-8",  "status": "available"},
    {"id": "AMB-003", "name": "Shifa Ambulance 1",   "sector": "H-8",  "status": "available"},
    {"id": "AMB-004", "name": "Rescue 1122 Paramedic","sector": "G-9", "status": "available"},
    {"id": "AMB-005", "name": "Edhi Foundation Van", "sector": "I-10", "status": "available"},
]

WATER_PUMPS: list[dict] = [
    {"id": "WP-001", "name": "WASA Dewatering Pump A", "flow_lpm": 5000, "sector": "G-9",  "status": "available"},
    {"id": "WP-002", "name": "WASA Dewatering Pump B", "flow_lpm": 5000, "sector": "I-8",  "status": "available"},
    {"id": "WP-003", "name": "NDMA Heavy Pump 1",      "flow_lpm": 12000,"sector": "G-11", "status": "available"},
    {"id": "WP-004", "name": "NDMA Heavy Pump 2",      "flow_lpm": 12000,"sector": "F-10", "status": "available"},
]

HELICOPTERS: list[dict] = [
    {"id": "HEL-001", "name": "PAF Rescue Chopper 1", "base": "Chaklala Airbase", "status": "available"},
    {"id": "HEL-002", "name": "Army Aviation Huey",   "base": "Rawalpindi",       "status": "standby"},
]

EMERGENCY_SHELTERS: list[dict] = [
    {"id": "SH-001", "name": "G-9 Community Centre",       "sector": "G-9",  "capacity": 500, "status": "ready"},
    {"id": "SH-002", "name": "I-8 Polytechnic Gymnasium",  "sector": "I-8",  "capacity": 800, "status": "ready"},
    {"id": "SH-003", "name": "F-10 Sports Complex",        "sector": "F-10", "capacity": 600, "status": "ready"},
    {"id": "SH-004", "name": "Jinnah Convention Centre",   "sector": "G-5",  "capacity": 2000,"status": "ready"},
]


def get_available_resources(crisis_type: str, severity: str) -> dict:
    """
    Return recommended resources based on crisis type and severity.
    Returns dict with resource lists sized to the situation.
    """
    resources: dict = {}

    if crisis_type in ("flood", "infrastructure_failure"):
        n_rescue = 3 if severity == "critical" else 2 if severity == "high" else 1
        n_pumps  = 3 if severity in ("critical", "high") else 1
        resources["rescue_teams"]   = RESCUE_TEAMS[:n_rescue]
        resources["water_pumps"]    = WATER_PUMPS[:n_pumps]
        resources["ambulances"]     = AMBULANCES[:2]
        resources["shelters"]       = EMERGENCY_SHELTERS[:2]
        resources["helicopters"]    = HELICOPTERS[:1] if severity == "critical" else []

    elif crisis_type == "heatwave":
        resources["ambulances"]     = AMBULANCES[:3]
        resources["shelters"]       = EMERGENCY_SHELTERS[:3]
        resources["rescue_teams"]   = RESCUE_TEAMS[:1]

    elif crisis_type == "accident":
        resources["ambulances"]     = AMBULANCES[:3]
        resources["rescue_teams"]   = RESCUE_TEAMS[:2]
        resources["helicopters"]    = HELICOPTERS[:1] if severity in ("critical", "high") else []

    elif crisis_type == "road_blockage":
        resources["rescue_teams"]   = [RESCUE_TEAMS[3]]   # CDA team
        resources["ambulances"]     = AMBULANCES[:1]

    else:
        resources["rescue_teams"]   = RESCUE_TEAMS[:1]
        resources["ambulances"]     = AMBULANCES[:1]

    return resources


def get_resource_summary(crisis_type: str, severity: str) -> dict:
    """Return a plain summary of resources to deploy (counts + names)."""
    res = get_available_resources(crisis_type, severity)
    return {
        k: [r["name"] for r in v]
        for k, v in res.items()
    }
