"""Small, cached credential probe. No keys or upstream diagnostics leave the service."""
from time import monotonic
from threading import Lock
from .config import has_openai, TUTOR_MODEL
from .llm import get_openai_client

_cached = None
_until = 0.0
_lock = Lock()


def tutor_status():
    global _cached, _until
    if not has_openai():
        return {"connection": "unconfigured"}
    with _lock:
        if _cached is not None and monotonic() < _until:
            return _cached
        try:
            get_openai_client().with_options(timeout=5, max_retries=0).models.retrieve(TUTOR_MODEL)
            result = {"connection": "ready"}
        except Exception:
            result = {"connection": "unavailable"}
        _cached, _until = result, monotonic() + 60
        return result
