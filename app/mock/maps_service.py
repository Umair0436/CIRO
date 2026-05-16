"""
Google Maps Directions Integration for CIRO
"""
import os
import aiohttp
import asyncio
import threading

def _get_mock_routes(blocked_location: str) -> list[str]:
    if blocked_location == "G-10":
        return ["Via G-9 Karachi Company — 12 mins extra"]
    elif blocked_location == "Lahore":
        return ["Via Gulberg Main Blvd — 15 mins extra"]
    return ["Via Alternate Route — 10 mins extra"]

async def _fetch_routes_async(blocked_location: str) -> list[str]:
    key = os.getenv("GOOGLE_MAPS_API_KEY", "")
    
    pairs = {
        "G-10": {"origin": "G-9, Islamabad", "destination": "F-7, Islamabad"},
        "I-8": {"origin": "I-8, Islamabad", "destination": "G-11, Islamabad"},
        "Lahore": {"origin": "Gulberg, Lahore", "destination": "DHA, Lahore"}
    }
    
    pair = pairs.get(blocked_location)
    if not key or not pair:
        return _get_mock_routes(blocked_location)

    url = f"https://maps.googleapis.com/maps/api/directions/json?origin={pair['origin']}&destination={pair['destination']}&key={key}"
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, timeout=5) as response:
                if response.status != 200:
                    return _get_mock_routes(blocked_location)
                data = await response.json()
                
                routes = []
                for route in data.get("routes", []):
                    summary = route.get("summary", "Alternate Route")
                    legs = route.get("legs", [])
                    if legs:
                        duration = legs[0].get("duration", {}).get("text", "Unknown time")
                        routes.append(f"Via {summary} — {duration}")
                
                if not routes:
                    return _get_mock_routes(blocked_location)
                return routes
    except Exception:
        return _get_mock_routes(blocked_location)

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

def get_alternate_routes(blocked_location: str) -> list[str]:
    return _run_async_safely(_fetch_routes_async(blocked_location))
