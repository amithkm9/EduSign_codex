"""Opt-in provider check: opposite UI language, synthetic audio, no learner data."""
import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
if '--live-api' not in sys.argv:
    raise SystemExit('Pass --live-api to make billable provider requests.')
from app.voice import text_to_speech
from app.main import voice_chat
from app.schemas import VoiceChatRequest
for word,spoken,ui,expected in [('Bonjour','fr','en','project-hello'),('Hello','en','fr','project-hello')]:
    audio=text_to_speech(word,language=spoken)
    result=voice_chat(VoiceChatRequest(audio=audio,mime_type='audio/mpeg',language=ui,intent='sign',collection='project'))
    assert result['language']==spoken,(word,result['transcription'],result['language'])
    assert result['response']['sign_ids']==[expected]
    assert result['audio'] and not result['audio_error']
    print('PASS spoken',word,'with',ui,'interface →',spoken,'reply and matching video',flush=True)
