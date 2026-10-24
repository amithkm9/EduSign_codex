from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .config import INTERNAL_API_TOKEN, PORT, has_openai
from .language import SUPPORTED_LANGUAGES
from .report import generate_insights
from .schemas import (
    ChatRequest,
    ChatResponse,
    RecognizeRequest,
    ReportInsightsRequest,
    TtsRequest,
    TranscribeRequest,
    VoiceChatRequest,
    VoiceChatResponse,
)
from .tutor import process_message
from .voice import clean_for_speech, speech_to_text, text_to_speech

app = FastAPI(title="EduSign AI Service", version="1.0.0")

# Called only by the Next gateway (same machine / internal network).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def require_internal_token(x_internal_token: str | None = Header(default=None)) -> None:
    """Reject calls that don't carry the gateway's shared secret (when one is set)."""
    if INTERNAL_API_TOKEN and x_internal_token != INTERNAL_API_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized")


def _history(items) -> list[dict]:
    return [{"role": m.role, "content": m.content} for m in items]


@app.get("/health")
def health():
    return {"status": "healthy", "openai": has_openai()}


@app.post("/tutor/chat", response_model=ChatResponse, dependencies=[Depends(require_internal_token)])
def tutor_chat(req: ChatRequest):
    try:
        result = process_message(
            req.message, req.language, _history(req.conversation_history),
            req.profile.model_dump() if req.profile else None,
            req.action.model_dump() if req.action else None,
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid exercise answer.")
    return {"success": True, "response": result["response"], "language": result["language"]}


@app.get("/tutor/status", dependencies=[Depends(require_internal_token)])
def assistant_status():
    from .tutor_status import tutor_status
    return tutor_status()


@app.post("/voice/transcribe", dependencies=[Depends(require_internal_token)])
def voice_transcribe(req: TranscribeRequest):
    if not has_openai():
        raise HTTPException(status_code=503, detail="Voice is temporarily unavailable.")
    try:
        message = speech_to_text(req.audio, req.language, req.mime_type)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid audio recording.")
    except Exception:
        raise HTTPException(status_code=503, detail="Voice is temporarily unavailable.")
    return {"success": True, "transcription": message, "language": req.language}


@app.post("/report/insights", dependencies=[Depends(require_internal_token)])
def report_insights(req: ReportInsightsRequest):
    return {"success": True, "insights": generate_insights(req.model_dump())}


@app.post("/recognize", dependencies=[Depends(require_internal_token)])
def recognize_endpoint(req: RecognizeRequest):
    try:
        from .recognition import recognize

        return recognize(req.frames, req.target)
    except Exception:
        raise HTTPException(status_code=503, detail="Recognition is temporarily unavailable.")


@app.get("/recognize/status", dependencies=[Depends(require_internal_token)])
def recognize_status_endpoint():
    try:
        from .recognition import recognition_status
        return recognition_status()
    except Exception:
        raise HTTPException(status_code=503, detail="Recognition is temporarily unavailable.")


@app.post("/voice/tts", dependencies=[Depends(require_internal_token)])
def voice_tts(req: TtsRequest):
    if not has_openai():
        raise HTTPException(status_code=503, detail="Voice is temporarily unavailable.")
    try:
        audio = text_to_speech(req.text, req.voice, req.language)
    except Exception:
        raise HTTPException(status_code=503, detail="Speech is temporarily unavailable.")
    return {"success": True, "audio": audio, "format": "mp3"}


@app.post("/voice/chat", response_model=VoiceChatResponse, dependencies=[Depends(require_internal_token)])
def voice_chat(req: VoiceChatRequest):
    if not has_openai():
        raise HTTPException(status_code=503, detail="Voice is temporarily unavailable.")

    hint = req.language if req.language in SUPPORTED_LANGUAGES else "fr"
    message = voice_transcribe(req)["transcription"]
    if not message:
        return {
            "success": True,
            "transcription": "",
            "response": {"type": "error", "response": ("I couldn’t understand the audio. Please try a short sentence." if hint == "en" else "Je n’ai pas compris le message audio. Réessayez avec une phrase courte.")},
            "audio": None,
            "language": hint,
        }

    result = process_message(
        message,
        req.language,
        _history(req.conversation_history),
        req.profile.model_dump() if req.profile else None,
    )

    audio = None
    audio_error = False
    if req.voice_enabled and result["text_for_speech"]:
        try:
            audio = text_to_speech(clean_for_speech(result["text_for_speech"]), language=hint)
        except Exception:
            audio_error = True

    return {
        "success": True,
        "transcription": message,
        "response": result["response"],
        "audio": audio,
        "language": result["language"],
        "audio_error": audio_error,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=PORT)
