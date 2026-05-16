"""
Mock Geo Data — Islamabad Sectors
Provides sector metadata, coordinates, and adjacency maps for routing.
"""

# ── Sector registry ───────────────────────────────────────────────────────────
# Each sector has a centroid lat/lon, display name, and area type.

SECTORS: dict[str, dict] = {
    "G-10": {
        "name":        "G-10 Markaz",
        "lat":         33.6844,
        "lon":         73.0479,
        "area_type":   "residential_commercial",
        "population":  85_000,
        "description": "Dense residential sector with busy Markaz commercial hub",
    },
    "G-9": {
        "name":        "G-9 Karachi Company",
        "lat":         33.6938,
        "lon":         73.0551,
        "area_type":   "residential_commercial",
        "population":  78_000,
        "description": "Major transport hub and commercial centre",
    },
    "I-8": {
        "name":        "I-8 Markaz",
        "lat":         33.6715,
        "lon":         73.0847,
        "area_type":   "residential_industrial",
        "population":  92_000,
        "description": "Residential sector adjacent to industrial zone",
    },
    "I-10": {
        "name":        "I-10 Sector",
        "lat":         33.6574,
        "lon":         73.0921,
        "area_type":   "industrial_residential",
        "population":  110_000,
        "description": "Pakistan's largest industrial zone with dense housing",
    },
    "F-7": {
        "name":        "F-7 Jinnah Super",
        "lat":         33.7215,
        "lon":         73.0636,
        "area_type":   "upscale_commercial",
        "population":  55_000,
        "description": "Upscale residential and commercial sector",
    },
    "E-11": {
        "name":        "E-11 Multi Gardens",
        "lat":         33.7383,
        "lon":         73.0284,
        "area_type":   "residential",
        "population":  65_000,
        "description": "Residential sector in northern Islamabad",
    },
    "F-10": {
        "name":        "F-10 Markaz",
        "lat":         33.7105,
        "lon":         73.0367,
        "area_type":   "residential_commercial",
        "population":  72_000,
        "description": "Residential sector with busy F-10 Markaz",
    },
    "G-11": {
        "name":        "G-11 Sector",
        "lat":         33.6751,
        "lon":         73.0357,
        "area_type":   "residential",
        "population":  68_000,
        "description": "Mid-range residential sector",
    },
}

# ── Adjacency map — which sectors border each other ───────────────────────────
ADJACENT_SECTORS: dict[str, list[str]] = {
    "G-10": ["G-9", "G-11", "I-8", "F-10"],
    "G-9":  ["G-10", "G-11", "I-8", "F-7"],
    "I-8":  ["G-10", "G-9",  "I-10"],
    "I-10": ["I-8"],
    "F-7":  ["G-9", "F-10", "E-11"],
    "E-11": ["F-7", "F-10"],
    "F-10": ["F-7", "G-10", "G-11", "E-11"],
    "G-11": ["G-10", "G-9", "F-10"],
}

# ── Alternate route suggestions by affected sector ────────────────────────────
# Maps flooded/blocked sector → list of suggested alternate corridors
ALTERNATE_ROUTES: dict[str, list[str]] = {
    "G-10": [
        "Via G-9 Karachi Company to Kashmir Highway",
        "Via G-11 to Margalla Road to F-10",
        "Via I-8 Murree Road, bypass G-10 Markaz",
        "Srinagar Highway westbound bypass",
    ],
    "I-8": [
        "Via G-10 to Islamabad Expressway",
        "Via I-10 Industrial Zone to GT Road",
        "Murree Road northbound diversion",
    ],
    "G-9": [
        "Via G-10 Markaz internal roads",
        "Via F-7 to Jinnah Avenue",
        "Karachi Company bypass via I-8 Link Road",
    ],
    "F-7": [
        "Via F-10 Markaz to Kashmir Highway",
        "Via G-9 to Islamabad Expressway",
    ],
    "E-11": [
        "Via F-10 to Margalla Road",
        "Via F-7 to Ataturk Avenue",
    ],
    "I-10": [
        "Via I-8 to G-10 to Expressway",
        "GT Road northern bypass",
    ],
    "F-10": [
        "Via F-7 to Jinnah Avenue",
        "Via G-11 to Kashmir Highway",
    ],
    "G-11": [
        "Via G-10 to G-9 alternate",
        "Via F-10 to Margalla Avenue",
    ],
}

# ── Hospitals and rescue points ───────────────────────────────────────────────
HOSPITALS: list[dict] = [
    {"name": "PIMS Hospital",         "sector": "G-8",  "lat": 33.7050, "lon": 73.0680, "capacity": 500},
    {"name": "Shifa International",   "sector": "H-8",  "lat": 33.6997, "lon": 73.0416, "capacity": 300},
    {"name": "Poly Clinic Hospital",  "sector": "G-6",  "lat": 33.7196, "lon": 73.0760, "capacity": 350},
    {"name": "CDA Hospital I-8",      "sector": "I-8",  "lat": 33.6720, "lon": 73.0840, "capacity": 200},
]


def get_sector(name: str) -> dict:
    """Return sector data, normalising common short-forms."""
    key = name.strip().upper()
    return SECTORS.get(key, {
        "name": name,
        "lat": 33.7,
        "lon": 73.06,
        "area_type": "unknown",
        "population": 0,
        "description": "Unknown sector",
    })


def get_alternate_routes(sector: str) -> list[str]:
    """Return alternate route suggestions for a given sector."""
    key = sector.strip().upper()
    return ALTERNATE_ROUTES.get(key, [
        "Use main Islamabad Expressway",
        "Follow CDA traffic management signs",
    ])


def get_adjacent(sector: str) -> list[str]:
    """Return list of sectors adjacent to the given sector."""
    key = sector.strip().upper()
    return ADJACENT_SECTORS.get(key, [])
