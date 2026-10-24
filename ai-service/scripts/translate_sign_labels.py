"""One-time authoring helper. Translates filenames, never validates a sign's language."""
import sys,json
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from app.llm import get_openai_client
from app.config import TUTOR_MODEL
root=Path(__file__).resolve().parents[2]
keys=list(json.loads((root/'ai-service/app/data/signs_manifest.json').read_text()))
output={key:key for key in keys if len(key)==1}
keys=[key for key in keys if len(key)>1]
for offset in range(0,len(keys),60):
 batch=keys[offset:offset+60]
 response=get_openai_client().with_options(timeout=90).chat.completions.create(model=TUTOR_MODEL,max_completion_tokens=5000,response_format={'type':'json_object'},messages=[{'role':'system','content':'Translate these English vocabulary labels into short French dictionary labels for a bilingual search index. Return a JSON object with EXACT input keys and French string values. Do not describe or interpret sign language. Ignore technical suffix _0A and variant (1). HI=Salut, HELLO=Bonjour, EVENING=Soir, Apple=Pomme. Single dictionary sense only. For ambiguous words choose the common everyday sense.'},{'role':'user','content':json.dumps(batch)}])
 parsed=json.loads(response.choices[0].message.content)
 assert set(parsed)==set(batch) and all(isinstance(v,str) and 0<len(v)<70 for v in parsed.values())
 output.update(parsed)
 print('Translated labels',len(output),'/',len(keys)+36,flush=True)
(root/'ai-service/app/data/project-sign-labels.fr.json').write_text(json.dumps(output,ensure_ascii=False,indent=2)+'\n')
