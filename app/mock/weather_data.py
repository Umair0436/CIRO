"""
OpenWeatherMap Integration for CIRO
"""
import os
import aiohttp
import asyncio
import threading
from datetime import datetime

_COORDS = {
    "G-10": {"lat": 33.6844, "lon": 73.0479},
    "G-9":  {"lat": 33.6938, "lon": 73.0551},
    "F-7":  {"lat": 33.7215, "lon": 73.0433},
    "I-8":  {"lat": 33.6645, "lon": 73.0822},
    "Lahore": {"lat": 31.5204, "lon": 74.3587},
    "Karachi": {"lat": 24.8607, "lon": 67.0011},
}

_DEFAULT_WEATHER = {
    "condition":      "Partly Cloudy",
    "intensity":      "low",
    "rainfall_mm_hr": 0.0,
    "temperature_c":  30.0,
    "humidity_pct":   70,
    "wind_kmh":       12,
    "visibility_km":  5.0,
    "flood_risk":     "low",
    "sector":         "Unknown",
    "recorded_at":    "",
    "data_source":    "PMD-Mock"
}

async def _fetch_weather_async(location: str) -> dict:
    key = os.getenv("OPENWEATHER_API_KEY", "")
    coords = _COORDS.get(location)
    
    if not key or not coords:
        return _get_mock_fallback(location)

    url = f"https://api.openweathermap.org/data/2.5/weather?lat={coords['lat']}&lon={coords['lon']}&appid={key}&units=metric"
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, timeout=5) as response:
                if response.status != 200:
                    return _get_mock_fallback(location)
                data = await response.json()
                
                condition = data.get("weather", [{}])[0].get("main", "Clear")
                temp = data.get("main", {}).get("temp", 30.0)
                humidity = data.get("main", {}).get("humidity", 50)
                wind_speed_ms = data.get("wind", {}).get("speed", 0.0)
                wind_kmh = wind_speed_ms * 3.6
                visibility_m = data.get("visibility", 10000)
                visibility_km = visibility_m / 1000.0
                
                rain_1h = data.get("rain", {}).get("1h", 0.0)
                
                if rain_1h > 20:
                    flood_risk = "high"
                    intensity = "high"
                elif rain_1h > 5:
                    flood_risk = "medium"
                    intensity = "medium"
                else:
                    flood_risk = "low"
                    intensity = "low" if rain_1h > 0 else "none"

                return {
                    "condition": condition,
                    "intensity": intensity,
                    "rainfall_mm_hr": rain_1h,
                    "temperature_c": temp,
                    "humidity_pct": humidity,
                    "wind_kmh": round(wind_kmh, 1),
                    "visibility_km": round(visibility_km, 1),
                    "flood_risk": flood_risk,
                    "sector": location,
                    "recorded_at": datetime.utcnow().isoformat() + "Z",
                    "data_source": "OpenWeatherMap-Live"
                }
    except Exception:
        return _get_mock_fallback(location)

def _get_mock_fallback(location: str) -> dict:
    fallback = dict(_DEFAULT_WEATHER)
    fallback["sector"] = location
    fallback["recorded_at"] = datetime.utcnow().isoformat() + "Z"
    return fallback

def _run_async_safely(coro):
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None

    if loop and loop.is_running():
        result = None
        ex = None
        def _thread_worker():
            nonlocal result, ex
            new_loop = asyncio.new_event_loop()
            asyncio.set_event_loop(new_loop)
            try:
                result = new_loop.run_until_complete(coro)
            except Exception as e:
                ex = e
            finally:
                new_loop.close()
        t = threading.Thread(target=_thread_worker)
        t.start()
        t.join()
        if ex:
            raise ex
        return result
    else:
        return asyncio.run(coro)

def get_weather_for_location(location: str) -> dict:
    return _run_async_safely(_fetch_weather_async(location))

# Provide the original get_weather function alias
def get_weather(sector: str, add_noise: bool = True) -> dict:
    return get_weather_for_location(sector)

def get_heatwave_risk(sector: str) -> str:
    weather = get_weather(sector, add_noise=False)
    temp = weather["temperature_c"]
    if temp >= 40:   return "critical"
    if temp >= 37:   return "high"
    if temp >= 34:   return "medium"
    return "low"
