import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

DATA_DIR = Path(__file__).parent / "data"

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
TUTOR_MODEL = os.getenv("OPENAI_TUTOR_MODEL", "gpt-4o-mini")
TRANSCRIBE_MODEL = os.getenv("OPENAI_TRANSCRIBE_MODEL", "gpt-transcribe")
TTS_MODEL = os.getenv("OPENAI_TTS_MODEL", "gpt-4o-mini-tts")
PORT = int(os.getenv("AI_SERVICE_PORT", os.getenv("PORT", "8100")))
# Shared secret the Next gateway must send. If unset (local dev), auth is skipped.
INTERNAL_API_TOKEN = os.getenv("INTERNAL_API_TOKEN")


def has_openai() -> bool:
    return bool(OPENAI_API_KEY)
