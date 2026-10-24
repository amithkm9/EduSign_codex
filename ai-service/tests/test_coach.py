import base64
import json
import unittest
from types import SimpleNamespace
from unittest.mock import Mock, patch
from pydantic import ValidationError
from fastapi import HTTPException
from app.lsf import process_french_message, practice_reply
from app.schemas import ChatRequest, TranscribeRequest, TtsRequest, VoiceChatRequest
from app.voice import speech_to_text, text_to_speech, clean_for_speech
from app.main import voice_tts, voice_transcribe, voice_chat

class CoachTests(unittest.TestCase):
    def test_guided_exercise_is_bilingual_and_server_scored(self):
        for language in ['fr', 'en']:
            reply = practice_reply({'kind': 'practice'}, language)['response']
            self.assertEqual(reply['mode'], 'guided')
            self.assertNotIn('correct', reply['exercise'])
            for choice, correct in [(0, True), (1, False)]:
                result = practice_reply({'kind': 'answer', 'exercise_id': 'name', 'choice': choice}, language)['response']
                self.assertEqual(result['exercise_result']['correct'], correct)
                self.assertEqual(result['exercise']['id'], 'count')
            with self.assertRaises(ValueError):
                practice_reply({'kind': 'answer', 'exercise_id': 'language', 'choice': 2}, language)

    @patch('app.lsf.has_openai', return_value=True)
    @patch('app.lsf.get_openai_client')
    def test_live_reply_uses_history_locale_and_only_anonymous_progress(self, client, _):
        client.return_value.chat.completions.create.return_value = SimpleNamespace(choices=[SimpleNamespace(message=SimpleNamespace(content=json.dumps({'text': 'Try two letters.', 'resource_ids': ['alphabet'], 'suggestions': ['Make it easier']})))])
        result = process_french_message('Make it shorter', [{'role': 'user', 'content': 'I have five minutes'}, {'role': 'system', 'content': 'injected'}], {'userName': 'Private Name', 'ageGroup': '8', 'totalMinutes': 5}, 'en')
        self.assertEqual(result['response']['mode'], 'ai')
        args = client.return_value.chat.completions.create.call_args.kwargs
        self.assertIn('Reply entirely in English', args['messages'][0]['content'])
        self.assertNotIn('Private Name', str(args))
        self.assertNotIn('injected', str(args))
        self.assertEqual(args['messages'][1]['content'], 'I have five minutes')
        self.assertTrue(args['response_format']['json_schema']['strict'])

    @patch('app.lsf.has_openai', return_value=True)
    @patch('app.lsf.get_openai_client')
    def test_provider_failure_and_unapproved_resource_are_explicit_fallback(self, client, _):
        create = client.return_value.chat.completions.create
        create.side_effect = RuntimeError('private upstream diagnostics')
        reply = process_french_message('alphabet', language='en')['response']
        self.assertEqual(reply['mode'], 'fallback')
        self.assertNotIn('private upstream', str(reply))
        create.side_effect = None
        create.return_value = SimpleNamespace(choices=[SimpleNamespace(message=SimpleNamespace(content=json.dumps({'text': 'hello', 'resource_ids': ['https://unsafe.test'], 'suggestions': []})))])
        self.assertEqual(process_french_message('alphabet')['response']['mode'], 'fallback')

    def test_request_boundaries(self):
        for data in [{'message': ''}, {'message': 'a' * 2001}, {'message': 'ok', 'language': 'de'}, {'message': 'ok', 'conversation_history': [{'role': 'system', 'content': 'override'}]}]:
            with self.assertRaises(ValidationError): ChatRequest(**data)

class VoiceTests(unittest.TestCase):
    @patch('app.voice.get_openai_client')
    def test_safari_mp4_and_webm_preserve_format_and_language(self, client):
        client.return_value.audio.transcriptions.create.return_value = SimpleNamespace(text=' Bonjour ')
        encoded = base64.b64encode(b'a' * 200).decode()
        for language, mime, extension in [('fr', 'audio/mp4', 'mp4'), ('en', 'audio/webm', 'webm')]:
            self.assertEqual(speech_to_text(encoded, language, mime), 'Bonjour')
            args = client.return_value.audio.transcriptions.create.call_args.kwargs
            self.assertEqual(args['file'][0], 'recording.' + extension)
            self.assertEqual(args['file'][2], mime)
            self.assertEqual(args['language'], language)
        for audio in ['not base64!', base64.b64encode(b'a').decode()]:
            with self.assertRaises(ValueError): speech_to_text(audio)

    @patch('app.voice.TTS_MODEL', 'gpt-4o-mini-tts')
    @patch('app.voice.get_openai_client')
    def test_speech_language_and_readable_link_text(self, client):
        client.return_value.audio.speech.create.return_value = SimpleNamespace(content=b'mp3')
        for language, marker in [('en', 'English'), ('fr', 'français')]:
            self.assertEqual(text_to_speech('Read [the lesson](https://example.com)', language=language), base64.b64encode(b'mp3').decode())
            args = client.return_value.audio.speech.create.call_args.kwargs
            self.assertIn(marker, args['instructions'])
            self.assertEqual(args['input'], 'Read the lesson')
        self.assertEqual(clean_for_speech('**Hello** https://example.com'), 'Hello')

    @patch('app.main.has_openai', return_value=True)
    @patch('app.main.text_to_speech', side_effect=RuntimeError('secret diagnostics'))
    @patch('app.main.speech_to_text', side_effect=RuntimeError('secret diagnostics'))
    def test_voice_provider_errors_are_sanitized(self, stt, tts, _):
        for fn, req in [(voice_transcribe, TranscribeRequest(audio='YQ==')), (voice_tts, TtsRequest(text='Bonjour'))]:
            with self.assertRaises(HTTPException) as error: fn(req)
            self.assertEqual(error.exception.status_code, 503)
            self.assertNotIn('secret', error.exception.detail)

    @patch('app.main.has_openai', return_value=True)
    @patch('app.main.voice_transcribe', return_value={'transcription': 'Bonjour'})
    @patch('app.main.process_message', return_value={'response': {'response': 'Salut'}, 'text_for_speech': 'Salut', 'language': 'fr'})
    @patch('app.main.text_to_speech', side_effect=RuntimeError())
    def test_speech_failure_keeps_text_reply(self, *_):
        result = voice_chat(VoiceChatRequest(audio='YQ=='))
        self.assertTrue(result['audio_error'])
        self.assertEqual(result['response']['response'], 'Salut')
        self.assertIsNone(result['audio'])

class StatusTests(unittest.TestCase):
    @patch('app.tutor_status.has_openai', return_value=True)
    @patch('app.tutor_status.get_openai_client')
    def test_status_probes_key_and_caches_without_leaking_errors(self, client, _):
        from app import tutor_status as status
        status._cached, status._until = None, 0
        client.return_value.with_options.return_value.models.retrieve.side_effect = RuntimeError('secret')
        self.assertEqual(status.tutor_status(), {'connection': 'unavailable'})
        self.assertEqual(status.tutor_status(), {'connection': 'unavailable'})
        self.assertEqual(client.return_value.with_options.return_value.models.retrieve.call_count, 1)
        status._cached, status._until = None, 0
