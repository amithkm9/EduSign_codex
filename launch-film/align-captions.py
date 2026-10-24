"""Transcribe only the generated narrator to obtain real word timings."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import json
from dotenv import load_dotenv
from openai import OpenAI

root=Path(__file__).resolve().parent
load_dotenv(root.parent/'ai-service/.env')
plan=json.loads((root/'edit-plan.json').read_text())
def transcribe(scene):
    target=root/'audio'/(scene['id']+'-words.json')
    if not target.exists():
        with (root/'audio'/(scene['id']+'.wav')).open('rb') as audio:
            result=OpenAI(timeout=90,max_retries=1).audio.transcriptions.create(
                model='whisper-1',file=audio,language='en',response_format='verbose_json',
                timestamp_granularities=['word'],prompt='EduSign. LSF. French Sign Language.')
        target.write_text(result.model_dump_json(indent=2))
    item=json.loads(target.read_text())
    return {'scene':scene['id'],'text':item['text'],'words':len(item['words'])}
if __name__=='__main__':
    with ThreadPoolExecutor(max_workers=2) as pool:
        for item in pool.map(transcribe,plan['scenes']):
            print(json.dumps(item),flush=True)
