import json
import unittest
from pathlib import Path
from unittest.mock import patch
from app.sign_lookup import COLLECTIONS, sign_reply
from app.lsf import process_french_message
from app.main import tutor_chat, voice_chat
from app.schemas import ChatRequest, VoiceChatRequest

class SignLookupTests(unittest.TestCase):
    def test_project_words_and_parent_requests(self):
        for text, expected in [('hi','project-hi'),('hello','project-hello'),('bonjour','project-hello'),('maman','project-mother'),('eau','project-water'),('How do I sign hi?','project-hi'),('I want to teach my child hi','project-hi'),('Show me the sign for hello','project-hello'),('Comment montrer le signe bonjour à ma fille ?','project-hello'),('Montre-moi le signe « eau »','project-water'),('How can I teach my child to say hello?','project-hello')]:
            with self.subTest(text=text):
                reply=sign_reply(text,'en',explicit=True,collection='project')['response']
                self.assertEqual(reply['sign_ids'],[expected])
                self.assertEqual(reply['mode'],'library')
                self.assertNotIn('in French Sign Language',reply['response'])

    def test_all_project_filenames_have_matching_videos(self):
        for item in COLLECTIONS['project']:
            reply=sign_reply(item['key'],explicit=True,collection='project')['response']
            self.assertIn(item['id'],reply['sign_ids'],item['key'])
        self.assertEqual(len(COLLECTIONS['project']),354)
        self.assertTrue(all(item['language']=='unverified' for item in COLLECTIONS['project']))

    def test_lsf_selection_and_explicit_language_are_honoured(self):
        for text, collection in [('hi','lsf'),('Show me hi in LSF','project')]:
            reply=sign_reply(text,'en',explicit=True,collection=collection)['response']
            self.assertEqual(reply['sign_ids'],['bonjour'])
            self.assertEqual(reply['collection'],'lsf')
        self.assertEqual(sign_reply('hi in ASL','en',explicit=True,collection='project')['response']['sign_ids'],[])

    def test_unknown_words_sentences_and_substrings_do_not_return_wrong_video(self):
        for text in ['this', 'please translate this whole sentence', 'javascript:alert(1)', 'nonexistentword']:
            reply=sign_reply(text,'en',explicit=True,collection='project')['response']
            self.assertEqual(reply['sign_ids'],[],text)
            self.assertEqual(reply['type'],'sign_not_found')

    def test_phrases_preserve_word_order_and_exact_lsf_greeting(self):
        for text in ['good morning', 'Good morning!', 'How do I sign good morning?', 'Show me "good morning"']:
            reply = sign_reply(text, 'en', explicit=True, collection='project')['response']
            self.assertEqual(reply['sign_ids'], ['project-good', 'project-morning'])
            self.assertIn('separate word demonstrations', reply['response'])
        reply = sign_reply('good morning', 'en', explicit=True, collection='lsf')['response']
        self.assertEqual(reply['sign_ids'], ['bonjour'])
        reply = sign_reply('good good morning', 'en', explicit=True, collection='project')['response']
        self.assertEqual(reply['sign_ids'], ['project-good', 'project-good', 'project-morning'])

    def test_partial_phrases_name_missing_words(self):
        reply = sign_reply('hello and nonexistentword', 'en', explicit=True, collection='project')['response']
        self.assertEqual(reply['sign_ids'], ['project-hello'])
        self.assertIn('No clip was found for: nonexistentword', reply['response'])

    def test_learning_questions_reach_coach_in_both_modes(self):
        for message in ['What is the best way to learn sign language?', 'Help me learn', 'Make it easier', 'learn best language', 'What is sign language?', 'Comment apprendre la LSF ?', 'Propose-moi un programme de cinq minutes']:
            for explicit in [True, False]:
                self.assertIsNone(sign_reply(message, 'en', explicit=explicit, collection='project'), message)

    def test_typo_asks_before_showing_and_replay_uses_context(self):
        reply=sign_reply('helllo','en',explicit=True,collection='project')['response']
        self.assertEqual(reply['sign_ids'],[])
        self.assertIn('Hello',reply['suggestions'])
        history=[{'role':'assistant','content':'Here is « Hi » from your video library.'}]
        reply=sign_reply('show it again','en',history,True,'project')['response']
        self.assertEqual(reply['sign_ids'],['project-hi'])

    @patch('app.lsf.get_openai_client',side_effect=AssertionError('Video lookups must not call the LLM'))
    def test_lookup_works_without_provider_and_through_text_endpoint(self,_):
        result=tutor_chat(ChatRequest(message='hi',language='en',intent='sign',collection='project'))
        self.assertEqual(result['response']['sign_ids'],['project-hi'])
        self.assertEqual(process_french_message('unknown word',language='fr',intent='sign',collection='project')['response']['mode'],'library')

    @patch('app.main.has_openai',return_value=True)
    @patch('app.main.voice_transcribe',return_value={'transcription':'bonjour'})
    def test_voice_transcription_routes_to_same_video(self,*_):
        result=voice_chat(VoiceChatRequest(audio='YQ==',language='fr',intent='sign',collection='project',voice_enabled=False))
        self.assertEqual(result['response']['sign_ids'],['project-hello'])

    def test_web_and_service_catalogs_are_identical(self):
        root=Path(__file__).resolve().parents[2]
        for name in ['sign-videos.json','project-sign-videos.json']:
            self.assertEqual(json.loads((root/'ai-service/app/data'/name).read_text()),json.loads((root/'edusign-next/src/lib/data'/name).read_text()))
