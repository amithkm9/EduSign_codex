"""Create compatible derivatives without touching the original project videos."""
import json,subprocess,hashlib
from pathlib import Path
root=Path(__file__).resolve().parents[2]
cache=root/'edusign-next/.sign-media-cache';cache.mkdir(exist_ok=True)
manifest=json.loads((root/'ai-service/app/data/signs_manifest.json').read_text())
metadata={}
for index,(key,url) in enumerate(manifest.items()):
 src=root/'edusign-next/public'/url.lstrip('/')
 raw=src.read_bytes();digest=hashlib.sha256(raw).hexdigest()
 dst=cache/(digest+'.mp4')
 if not dst.exists():
  subprocess.run(['ffmpeg','-v','error','-nostdin','-i',str(src),'-c:v','libx264','-crf','23','-pix_fmt','yuv420p','-movflags','+faststart','-an',str(dst)],check=True)
 info=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_format','-show_streams','-of','json',str(dst)]))
 stream=next(s for s in info['streams'] if s['codec_type']=='video')
 metadata[key]={'sha256':digest,'mp4sha256':hashlib.sha256(dst.read_bytes()).hexdigest(),'bytes':len(raw),'mp4bytes':dst.stat().st_size,'duration':float(info['format']['duration']),'width':stream['width'],'height':stream['height']}
 if (index+1)%50==0: print('Prepared',index+1,'/',len(manifest),flush=True)
(cache/'metadata.json').write_text(json.dumps(metadata,indent=2)+'\n')
print('Prepared all',len(metadata),'clips; originals unchanged.',flush=True)
