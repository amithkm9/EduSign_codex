import unittest
from unittest.mock import patch
from app.bilingual import reply_language
from app.lsf import process_french_message
from app.main import tutor_chat, voice_chat
from app.schemas import ChatRequest, VoiceChatRequest

class BilingualTests(unittest.TestCase):
    def test_french_words_override_english_interface_and_history(self):
        for word, sign in [('bonjour','project-hello'),('maman','project-mother'),('eau','project-water'),('salut','project-hi'),('pomme','project-apple'),('Comment signer bonjour ?','project-hello')]:
            with self.subTest(word=word):
                result=tutor_chat(ChatRequest(message=word,language='en',intent='sign',collection='project',conversation_history=[{'role':'assistant','content':'Hello, how can I help?'}]))
                self.assertEqual(result['language'],'fr')
                self.assertEqual(result['response']['language'],'fr')
                self.assertEqual(result['response']['sign_ids'],[sign])
                self.assertTrue(result['response']['response'].startswith('Voici'))
                self.assertNotIn('Here is',result['response']['response'])
        self.assertIn('« Bonjour »',tutor_chat(ChatRequest(message='bonjour',language='en',intent='sign',collection='project'))['response']['response'])

    def test_english_words_override_french_interface(self):
        for word, sign in [('hello','project-hello'),('hi','project-hi'),('mother','project-mother'),('water','project-water'),('mom','project-mother'),('Show me hello','project-hello')]:
            result=tutor_chat(ChatRequest(message=word,language='fr',intent='sign',collection='project'))
            self.assertEqual(result['language'],'en',word)
            self.assertEqual(result['response']['sign_ids'],[sign])
            self.assertTrue(result['response']['response'].startswith('Here is'))

    def test_bonjour_is_one_demonstration_in_each_collection(self):
        for collection,expected in [('project','project-hello'),('lsf','bonjour')]:
            result=tutor_chat(ChatRequest(message='bonjour',language='en',intent='sign',collection=collection))
            self.assertEqual(result['response']['sign_ids'],[expected])
            self.assertEqual(result['response']['language'],'fr')

    @patch('app.lsf.has_openai',return_value=False)
    def test_coach_and_missing_words_follow_message_language(self,_):
        for prompt,ui,expected in [('Je voudrais apprendre avec mon enfant','en','fr'),('I would like to learn with my child','fr','en'),('Comment signer un ornithorynque ?','en','fr'),('How do I sign an unavailableword?','fr','en')]:
            self.assertEqual(process_french_message(prompt,language=ui)['language'],expected)
        for language in ['fr','en']:
            for ambiguous in ['orange','alphabet','12345']:
                self.assertEqual(reply_language(ambiguous,language),language)

    @patch('app.main.text_to_speech',return_value='audio')
    @patch('app.main.voice_transcribe',return_value={'transcription':'bonjour'})
    @patch('app.main.has_openai',return_value=True)
    def test_spoken_reply_uses_detected_french_with_english_ui(self,_,transcribe,speech):
        result=voice_chat(VoiceChatRequest(audio='YQ==',language='en',intent='sign',collection='project'))
        self.assertEqual(result['language'],'fr')
        self.assertEqual(result['response']['sign_ids'],['project-hello'])
        self.assertEqual(speech.call_args.kwargs['language'],'fr')
