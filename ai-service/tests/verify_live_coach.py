"""Opt-in, billable provider check with synthetic learning prompts only."""
import base64
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
if '--live-api' not in sys.argv:
    raise SystemExit('Pass --live-api to make billable provider requests.')
from app.lsf import process_french_message
from app.voice import text_to_speech, speech_to_text
from app.tutor_status import tutor_status
if tutor_status()['connection'] != 'ready':
    raise SystemExit('BLOCKED: provider credentials or model access unavailable; no live pass claimed.')
for language, prompt, speech in [
    ('fr', 'Je débute en LSF. Propose un programme de cinq minutes pour apprendre les lettres de mon prénom.', 'Bonjour, je voudrais apprendre les nombres en langue des signes française.'),
    ('en', 'I am new to LSF. Make a five-minute plan to learn the letters of my name.', 'Hello, I would like to learn numbers in French Sign Language.'),
]:
    reply = process_french_message(prompt, language=language)['response']
    assert reply['mode'] == 'ai', f'{language}: provider failed or returned invalid structured output'
    assert reply['language'] == language and reply['suggestions']
    assert any(r['url'] == '/learn/lsf-alphabet' for r in reply['resources'])
    followup = process_french_message('Et si je n’ai que deux minutes ?' if language == 'fr' else 'What if I only have two minutes?', [{'role':'user','content':prompt},{'role':'assistant','content':reply['response']}], language=language)['response']
    assert followup['mode'] == 'ai'
    print('PASS live text and follow-up', language, flush=True)
    print('REVIEW', language, followup['response'], flush=True)
    if '--text-only' in sys.argv:
        print('SUGGESTIONS', language, reply['suggestions'], flush=True)
        continue
    audio = text_to_speech(speech, language=language)
    assert len(base64.b64decode(audio)) > 1000
    transcript = speech_to_text(audio, language, 'audio/mpeg')
    assert len(transcript.split()) > 4
    print('PASS live speech synthesis and transcription', language, flush=True)
    print('TRANSCRIPT', language, transcript, flush=True)
    voice_reply = process_french_message(transcript, language=language)['response']
    assert voice_reply['mode'] == 'ai'
    output = text_to_speech(voice_reply['response'], language=language)
    assert len(base64.b64decode(output)) > 1000
    print('PASS voice transcript → coach → spoken reply', language, flush=True)
