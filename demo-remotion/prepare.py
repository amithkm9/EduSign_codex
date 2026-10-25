"""Rebuild local video assets without altering the original recording."""
from pathlib import Path
import argparse
import json
import shutil
import subprocess

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT.parent / 'Screen Recording 2026-10-25 at 6.36.05 PM.mp4'
SCORE = ROOT.parent / 'launch-film/audio/original-score.wav'

def ffmpeg(*args):
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', *map(str, args)], check=True)

def stamp(seconds):
    ms = round(seconds * 1000)
    return f'{ms // 3600000:02}:{ms // 60000 % 60:02}:{ms // 1000 % 60:02},{ms % 1000:03}'

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--source', type=Path, default=SOURCE)
    parser.add_argument('--score', type=Path, default=SCORE)
    args = parser.parse_args()
    for folder in ['public', 'inspection', 'renders']:
        (ROOT / folder).mkdir(exist_ok=True)
    shutil.copy2(args.source, ROOT / 'public/recording.mp4')
    for source, destination in [('Arial.ttf', 'Arial.ttf'), ('Arial Bold.ttf', 'Arial-Bold.ttf'), ('Georgia Italic.ttf', 'Georgia-Italic.ttf')]:
        shutil.copy2(Path('/System/Library/Fonts/Supplemental') / source, ROOT / 'public' / destination)
    ffmpeg('-i', args.source, '-vn', '-af', 'highpass=f=80,afftdn=nf=-35,loudnorm=I=-17:TP=-2:LRA=11', '-ar', 48000, '-ac', 2, ROOT / 'inspection/narration.wav')
    ffmpeg('-stream_loop', -1, '-i', args.score, '-t', 172, '-af', 'afade=t=in:d=2,afade=t=out:st=167:d=5', ROOT / 'inspection/music.wav')
    mix = "[0:a]adelay=7000|7000,apad,atrim=duration=172[voice];[1:a]volume='if(lt(t,7),0.7,if(gt(t,165),0.7,0.14))':eval=frame[bed];[voice][bed]amix=inputs=2:normalize=0:duration=longest,loudnorm=I=-16:TP=-1.5:LRA=11,afade=t=out:st=169:d=3[mix]"
    ffmpeg('-i', ROOT / 'inspection/narration.wav', '-i', ROOT / 'inspection/music.wav', '-filter_complex', mix, '-map', '[mix]', '-t', 172, '-ar', 48000, '-c:a', 'pcm_s16le', ROOT / 'public/mix.wav')
    captions = json.loads((ROOT / 'src/captions.json').read_text())
    srt = '\n\n'.join(f"{i+1}\n{stamp(c['start']+7)} --> {stamp(c['end']+7)}\n{c['text']}" for i, c in enumerate(captions))
    (ROOT / 'renders/EduSign-demo.en.srt').write_text(srt + '\n')

if __name__ == '__main__':
    main()
