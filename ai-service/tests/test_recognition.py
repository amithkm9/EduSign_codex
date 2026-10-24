import unittest
from unittest.mock import patch
from app.recognition import demo_feedback, recognize, _preprocess, LABELS
import numpy as np

class RecognitionTests(unittest.TestCase):
    def result(self, label, confidence=.9):
        return {'detected_sign':label,'confidence':confidence,'all_predictions':{key: confidence if key==label else (1-confidence)/5 for key in LABELS},'hand_frames':30}

    def test_demo_target_mapping_for_all_supported_signs(self):
        for target,label in {'A':'a','B':'b','C':'c','1':'one','2':'two','3':'three'}.items():
            result=demo_feedback(self.result(label),target)
            self.assertEqual(result['verdict'],'match')
            self.assertTrue(result['correct'])
            self.assertFalse(result['lsf_validated'])
            self.assertFalse(result['saved_to_report'])

    def test_different_sign_and_abstention(self):
        self.assertEqual(demo_feedback(self.result('b'),'A')['verdict'],'different')
        self.assertFalse(demo_feedback(self.result('b'),'A')['correct'])
        self.assertIsNone(demo_feedback(self.result('a',.4),'A')['correct'])
        self.assertEqual(demo_feedback({'detected_sign':'unknown','confidence':0},'1')['verdict'],'uncertain')

    def test_invalid_target_never_calls_model(self):
        with patch('app.recognition._recognize') as model:
            with self.assertRaises(ValueError):recognize([], 'Z')
            model.assert_not_called()

    def test_preprocessing_matches_saved_model_shape(self):
        frames=[np.arange(63).reshape(21,3).tolist() for _ in range(12)]
        processed=_preprocess(frames)
        self.assertEqual(processed.shape,(30,63))
        self.assertTrue(np.isfinite(processed).all())
        self.assertTrue(np.allclose(processed[:,:3],0))

if __name__ == '__main__':unittest.main()
