"""
CIRO In-Memory Log Store
Thread-safe, bounded deque for storing session logs.
Also manages in-flight session state between /api/ingest and /api/analyze.
"""

import threading
from collections import deque
from typing import Optional
from app.config import MAX_LOG_ENTRIES


class LogStore:
    """
    Thread-safe in-memory store for:
    - Session logs (circular buffer, max MAX_LOG_ENTRIES)
    - Live session state (ingest result cached for analyze step)
    """

    def __init__(self, maxlen: int = MAX_LOG_ENTRIES):
        self._lock         = threading.Lock()
        self._logs: deque  = deque(maxlen=maxlen)
        self._sessions: dict = {}   # session_id → session state dict

    # ── Log methods ───────────────────────────────────────────────────────────

    def append(self, entry: dict) -> None:
        """Append a log entry (dict) to the circular buffer."""
        with self._lock:
            self._logs.append(entry)

    def get_all(self, limit: int = 50) -> list[dict]:
        """Return the N most recent log entries (newest first)."""
        with self._lock:
            entries = list(self._logs)
        return list(reversed(entries))[:limit]

    def clear(self) -> None:
        with self._lock:
            self._logs.clear()

    @property
    def count(self) -> int:
        with self._lock:
            return len(self._logs)

    # ── Session state methods ─────────────────────────────────────────────────

    def save_session(self, session_id: str, state: dict) -> None:
        """Persist ingest pipeline state so /api/analyze can retrieve it."""
        with self._lock:
            self._sessions[session_id] = state

    def get_session(self, session_id: str) -> Optional[dict]:
        """Retrieve session state by ID. Returns None if not found."""
        with self._lock:
            return self._sessions.get(session_id)

    def delete_session(self, session_id: str) -> None:
        with self._lock:
            self._sessions.pop(session_id, None)

    @property
    def session_count(self) -> int:
        with self._lock:
            return len(self._sessions)


# ── Singleton ─────────────────────────────────────────────────────────────────
log_store = LogStore()
