"""Write the final capture manifest and delivery guide after encoding."""
import importlib.util
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('film', ROOT / 'render-film.py')
film = importlib.util.module_from_spec(spec)
spec.loader.exec_module(film)
video = ROOT / 'renders/EduSign-launch-120s.mp4'
probe = json.loads(subprocess.check_output([
    'ffprobe', '-v', 'error', '-show_format', '-show_streams', '-of', 'json', str(video)
]))
v = next(s for s in probe['streams'] if s['codec_type'] == 'video')
a = next(s for s in probe['streams'] if s['codec_type'] == 'audio')
assert float(probe['format']['duration']) == 120.0
assert (v['width'], v['height'], v['nb_frames'], v['r_frame_rate']) == (1920, 1080, '3600', '30/1')
assert a['codec_name'] == 'aac'
subprocess.run(['ffmpeg', '-v', 'error', '-i', str(video), '-f', 'null', '-'], check=True)
audio_check = subprocess.run(['ffmpeg', '-hide_banner', '-i', str(video), '-vn', '-af',
    'loudnorm=I=-16:TP=-1.5:LRA=7:print_format=json', '-f', 'null', '-'],
    capture_output=True, text=True, check=True)
levels = json.loads(re.findall(r'\{[^{}]*"input_i"[^{}]*\}', audio_check.stderr)[-1])
assert -18 <= float(levels['input_i']) <= -14
assert float(levels['input_tp']) < 0
assert all(c['end']-c['start'] >= 1 for c in film.CAPTIONS)
assert film.CAPTIONS[-1]['end'] < 118
assert film.final_frame(118).tobytes() == film.final_frame(119.9).tobytes()
assert not (ROOT / '.demo-session.json').exists(), 'Clean up the temporary demo account first.'
report = {
    'status': 'Rendered and technically verified',
    'format': 'Animated walkthrough of actual application screenshots, with one credited source-video cutaway',
    'video': str(video.relative_to(ROOT)), 'duration_seconds': 120, 'resolution': [1920, 1080],
    'fps': 30, 'frames': 3600, 'video_codec': v['codec_name'], 'audio_codec': a['codec_name'],
    'captions': 'English, burned in with a separate SRT. Word-aligned against actual narration.',
    'narration': 'OpenAI AI narration, Coral voice, natural speed; disclosure in closing frames.',
    'music': 'Original instrumental score synthesized locally; ducked beneath narration.',
    'quality_checks': {'full_decode': 'passed', 'integrated_loudness_lufs': float(levels['input_i']),
                       'true_peak_dbtp': float(levels['input_tp']), 'caption_minimum_seconds': 1,
                       'two_second_static_logo_hold': 'passed',
                       'visual_review': 'Rendered contact sheets and full-resolution detail frames reviewed.',
                       'native_playback_review': 'QuickTime file-open controls did not respond; continuous native playback and subjective listening were not verified.'},
    'demo_account': 'Temporary account deleted after capture. Screens show genuine demonstration activity only.',
    'observed': ['French and English homepages', 'Alphabet resource playing; still frame captured',
                 'Sourced Hello / Bonjour lookup', 'AI coaching response', 'Interactive coach question and correct-answer feedback',
                 'Listen changed to Stop listening', 'Actual three-question quiz completed; report shows one attempt at 100%',
                 'Parent guide', 'Lesson copy-link confirmation'],
    'limitations': ['This is an animated screenshot walkthrough, not continuous screen recording.',
                    'Camera shown in ready state only; no recording or recognition result is demonstrated.',
                    'Assistant player captured blank. Its genuine lookup text is shown, followed by a separately labelled original Elix source clip.',
                    'Voice controls are shown; no successful microphone transcription is claimed.',
                    'Practice and viewing progress are genuine zero values, not seeded learner metrics.'],
    'source_clip': {
        'creator': 'Elix — Signes de sens', 'title': 'Bonjour',
        'source': 'https://commons.wikimedia.org/wiki/File:Bonjour_Nm_1_1_1_-_Elix.webm',
        'license': 'https://creativecommons.org/licenses/by-sa/4.0/',
        'changes': 'Existing H.264 transcode resized into the film composition; final frame briefly held. Signing content unchanged. Adapted clip remains CC BY-SA 4.0.'
    },
    'shots': film.SHOTS
}
(ROOT / 'production-report.json').write_text(json.dumps(report, indent=2, ensure_ascii=False) + '\n')
plan = json.loads((ROOT / 'edit-plan.json').read_text())
plan['status'] = 'COMPLETE — animated walkthrough captured from the real application'
plan['design']['captions'] = report['captions']
plan['design']['audio'] = report['music'] + ' One consistent AI narrator; no speed changes.'
for scene in plan['scenes']:
    scene.pop('planned_shots', None)
    scene['shots'] = [dict(time=[s['a'], s['b']], type=s.get('kind', 'screenshot'),
                           file=(s['file']+'.png') if s.get('file') else ('bonjour.mp4' if s.get('kind')=='source' else 'Editorial graphics'),
                           action=s.get('title', s.get('kind', 'Editorial composition')))
                      for s in film.SHOTS if scene['start'] <= s['a'] < scene['end']]
(ROOT / 'edit-plan.json').write_text(json.dumps(plan, indent=2, ensure_ascii=False) + '\n')
page = '''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>EduSign — Launch film delivery</title><style>
body{margin:0;background:#faf8f3;color:#203049;font:18px/1.6 -apple-system,BlinkMacSystemFont,sans-serif}main{max-width:980px;margin:auto;padding:64px 32px}h1{font-size:58px;line-height:1.1;letter-spacing:-2px}h2{font-size:26px}a{color:#35664e}video{width:100%;border-radius:18px;box-shadow:0 12px 40px #20304920}section{padding:24px 0;border-bottom:1px solid #dde2dc}.meta,small{color:#667383}li{margin:10px 0}.brand{font-size:26px;font-weight:700}code{font-size:15px}footer{padding:32px 0;font-size:15px}</style>
<main><div class="brand">EduSign<span style="color:#497663">.</span></div><h1>Watch. Try. Connect.</h1>
<p class="meta">120 seconds · 1920 × 1080 · 30 fps · H.264 MP4 / AAC audio</p>
<video controls preload="metadata" poster="renders/frame-010.0.jpg" src="renders/EduSign-launch-120s.mp4"></video>
<p><a href="renders/EduSign-launch-120s.mp4">Open the launch film</a> · <a href="renders/EduSign-launch.en.srt">English captions</a> · <a href="production-report.json">Production record</a></p>
<section><h2>Built from the actual product</h2><p>Computer-use captures of the running EduSign application, directed with gentle zooms, close-ups, editorial titles and dissolves. This is an animated screenshot walkthrough. The opening and closing identify the format. Application screens and results have not been reconstructed.</p>
<p>One warm English AI narrator accompanies an original, restrained instrumental score. Captions follow the spoken narration. The final two seconds hold the EduSign wordmark.</p></section>
<section><h2>What was demonstrated</h2><p>French and English homepages; alphabet and numbers workshops; a genuine quiz answer and explanation; a sourced sign lookup; a live AI coaching response and interactive question; voice playback controls; actual demo-account results; parent guidance; and copy-link sharing.</p>
<p>The demo account was removed after capture. It contained only activity performed for this film. No real learner records, credentials or private contact details appear.</p>
<p>The camera is shown ready for practice. No recording, successful recognition or microphone transcription is implied. The assistant’s captured player was blank, so the edit shows the genuine lookup result and then a separately labelled source clip. Actual practice and viewing counters remain zero.</p></section>
<section><h2>Creator credits</h2><p><strong>Bonjour — Elix, Signes de sens.</strong> <a href="https://commons.wikimedia.org/wiki/File:Bonjour_Nm_1_1_1_-_Elix.webm">Source and license record</a>. Licensed under <a href="https://creativecommons.org/licenses/by-sa/4.0/">Creative Commons Attribution–ShareAlike 4.0</a>. The existing H.264 transcode is resized into the film composition and its last frame briefly held; signing content is unchanged. The adapted clip remains under that license.</p>
<p>Alphabet resource: <strong>MAE Langue des Signes</strong>. Numbers resource: <strong>Dico Plus LSF</strong>. Their actual embedded-player previews and captured creator labels remain visible. Original rights remain with their creators.</p>
<p>AI-generated narration: OpenAI, Coral voice. Music: original instrumental composition synthesized for this film, with no stock samples. Product identity and application: EduSign.</p></section>
<section><h2>Reproduce the edit</h2><p>Keep the local <code>footage/</code> and <code>audio/</code> directories. Run <code>ai-service/.venv/bin/python launch-film/render-film.py</code>, then <code>ai-service/.venv/bin/python launch-film/finish-production.py</code>. The renderer requires FFmpeg, Pillow, NumPy and the macOS Avenir Next and Georgia fonts.</p><p>Media and renders are excluded from Git. The source scripts, edit plan and production report are versioned.</p></section>
<footer>AI-generated narration is disclosed in the film. No public website URL was added because none was confirmed.</footer></main></html>'''
(ROOT / 'production-guide.html').write_text(page)
print(json.dumps({key: report[key] for key in ['status', 'duration_seconds', 'resolution', 'fps', 'frames']}))
