"""
Mock Traffic Data — Islamabad Sectors
Simulates real-time road congestion and blockage data.
"""

import random
from datetime import datetime

_BASE_TRAFFIC: dict[str, dict] = {
    "G-10": {
        "congestion_pct": 95, "blocked_roads": 4, "avg_speed_kmh": 3,
        "incident_count": 6, "road_condition": "flooded",
        "major_blockages": ["G-10 Markaz main road", "Service Road West",
                            "Srinagar Hwy on-ramp", "G-10/3 underpass"],
        "last_update": "2 minutes ago",
    },
    "G-9": {
        "congestion_pct": 72, "blocked_roads": 2, "avg_speed_kmh": 12,
        "incident_count": 3, "road_condition": "heavy_congestion",
        "major_blockages": ["Karachi Company chowk", "G-9 Markaz flyover"],
        "last_update": "5 minutes ago",
    },
    "I-8": {
        "congestion_pct": 45, "blocked_roads": 1, "avg_speed_kmh": 25,
        "incident_count": 1, "road_condition": "moderate",
        "major_blockages": ["I-8/2 internal road"],
        "last_update": "8 minutes ago",
    },
    "I-10": {
        "congestion_pct": 58, "blocked_roads": 1, "avg_speed_kmh": 18,
        "incident_count": 2, "road_condition": "moderate",
        "major_blockages": ["I-10 industrial zone entrance"],
        "last_update": "10 minutes ago",
    },
    "F-7": {
        "congestion_pct": 35, "blocked_roads": 0, "avg_speed_kmh": 35,
        "incident_count": 0, "road_condition": "normal",
        "major_blockages": [], "last_update": "12 minutes ago",
    },
    "E-11": {
        "congestion_pct": 20, "blocked_roads": 0, "avg_speed_kmh": 50,
        "incident_count": 0, "road_condition": "clear",
        "major_blockages": [], "last_update": "15 minutes ago",
    },
    "F-10": {
        "congestion_pct": 40, "blocked_roads": 0, "avg_speed_kmh": 30,
        "incident_count": 1, "road_condition": "light_congestion",
        "major_blockages": [], "last_update": "7 minutes ago",
    },
    "G-11": {
        "congestion_pct": 55, "blocked_roads": 1, "avg_speed_kmh": 20,
        "incident_count": 2, "road_condition": "moderate",
        "major_blockages": ["G-11 Markaz roundabout"],
        "last_update": "6 minutes ago",
    },
}

_DEFAULT_TRAFFIC: dict = {
    "congestion_pct": 30, "blocked_roads": 0, "avg_speed_kmh": 40,
    "incident_count": 0, "road_condition": "normal",
    "major_blockages": [], "last_update": "unknown",
}


def get_traffic(sector: str, add_noise: bool = True) -> dict:
    """Return simulated traffic snapshot for a sector."""
    key  = sector.strip().upper()
    base = dict(_BASE_TRAFFIC.get(key, _DEFAULT_TRAFFIC))
    if add_noise:
        base["congestion_pct"] = min(100, max(0, base["congestion_pct"] + random.randint(-5, 5)))
        base["avg_speed_kmh"]  = max(1, base["avg_speed_kmh"] + random.randint(-3, 3))
    base["sector"]     = sector
    base["queried_at"] = datetime.utcnow().isoformat() + "Z"
    base["data_source"] = "NHA-Mock"
    return base


def get_congestion_level(sector: str) -> str:
    """Return human-readable congestion label."""
    pct = get_traffic(sector, add_noise=False)["congestion_pct"]
    if pct >= 90: return "gridlock"
    if pct >= 70: return "severe"
    if pct >= 50: return "heavy"
    if pct >= 30: return "moderate"
    return "light"
