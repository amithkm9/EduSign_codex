import unittest
from unittest.mock import patch
from app.tutor import process_message
from app.language import SUPPORTED_LANGUAGES
from app.report import _fallback

class FrenchTutorTests(unittest.TestCase):
    @patch('app.lsf.has_openai', return_value=False)
    def test_french_sign_request_never_uses_legacy_video(self, _):
        result = process_message('Comment signer bonjour ?', 'fr')
        self.assertEqual(result['language'], 'fr')
        reply = result['response']
        self.assertNotIn('videoSequence', reply)
        self.assertNotIn('responseSigns', reply)
        self.assertEqual(reply['resources'][0]['url'], '/learn/lsf-bonjour')

    @patch('app.lsf.has_openai', return_value=False)
    def test_accents_and_unknown_queries_use_curated_sources(self, _):
        known = process_message('Les émotions', 'fr')['response']
        self.assertEqual(known['resources'][0]['url'], '/learn/lsf-emotions')
        unknown = process_message('Un signe qui n’existe pas ici', 'fr')['response']
        self.assertEqual(unknown['resources'][0]['url'], 'https://dico.elix-lsf.fr/')
        self.assertNotIn('videoSequence', unknown)

    @patch('app.lsf.has_openai', return_value=False)
    def test_english_still_teaches_lsf(self, _):
        reply = process_message('Where can I learn the alphabet?', 'en')
        self.assertEqual(reply['language'], 'en')
        self.assertEqual(reply['response']['resources'][0]['url'], '/learn/lsf-alphabet')
        self.assertIn('French Sign Language', reply['response']['response'])
        self.assertNotIn('videoSequence', reply['response'])

    def test_report_uses_selected_language(self):
        report = _fallback({'language':'en','statistics':{'totalCompleted':2},'student':{'name':'Camille'}})
        self.assertIn('2 activities', report['overallSummary'])
        self.assertIn('without assessing', report['overallSummary'])

    def test_french_transcription_is_supported(self):
        self.assertIn('fr', SUPPORTED_LANGUAGES)

    def test_report_does_not_claim_mastery(self):
        report = _fallback({'statistics': {'totalCompleted': 2}, 'student': {'name': 'Camille'}})
        self.assertIn('2 activité', report['overallSummary'])
        self.assertIn('sans évaluer', report['overallSummary'])

if __name__ == '__main__':
    unittest.main()
