import base64
import binascii
import re
from .config import TRANSCRIBE_MODEL, TTS_MODEL
from .llm import get_openai_client

MIME_EXTENSIONS = {"audio/webm": "webm", "audio/mp4": "mp4", "audio/ogg": "ogg", "audio/wav": "wav", "audio/mpeg": "mp3"}
_EMOJI = re.compile("[\U0001F300-\U0001FAFF\U00002600-\U000027BF]", flags=re.UNICODE)


def speech_to_text(audio_b64: str, language: str = "fr", mime_type: str = "audio/webm") -> str:
    if mime_type not in MIME_EXTENSIONS:
        raise ValueError("Unsupported audio format")
    try:
        audio_bytes = base64.b64decode(audio_b64, validate=True)
    except (ValueError, binascii.Error):
        raise ValueError("Invalid audio") from None
    if not 100 <= len(audio_bytes) <= 7500000:
        raise ValueError("Invalid audio size")
    transcription = get_openai_client().audio.transcriptions.create(
        model=TRANSCRIBE_MODEL,
        file=("recording." + MIME_EXTENSIONS[mime_type], audio_bytes, mime_type),
        # Let the transcription model detect spoken language; the UI is only
        # a fallback for ambiguous text, never a forced audio language.
    )
    return (transcription.text or "").strip()[:2000]


def text_to_speech(text: str, voice: str = "coral", language: str = "fr") -> str:
    params = {"model": TTS_MODEL, "voice": voice, "input": clean_for_speech(text)[:4000], "response_format": "mp3"}
    if TTS_MODEL.startswith("gpt-"):
        params["instructions"] = ("Speak clearly and warmly in English at a comfortable learning pace." if language == "en" else "Parle clairement et chaleureusement en français, à un rythme confortable pour apprendre.")
    resp = get_openai_client().audio.speech.create(**params)
    audio_bytes = resp.content if hasattr(resp, "content") else resp.read()
    return base64.b64encode(audio_bytes).decode()


def clean_for_speech(text: str) -> str:
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
    text = re.sub(r"https?://\S+", "", text)
    text = re.sub(r"[*_`#]", "", text)
    return _EMOJI.sub("", text).strip()[:4000]
