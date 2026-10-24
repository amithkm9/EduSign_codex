"""Create the launch-film capture guide and optional AI narration draft.

Run from the repository root with ai-service/.venv/bin/python.
No product footage or final product film is manufactured by this script.
"""
import argparse
import html
import json
from pathlib import Path
import subprocess

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
PLAN = json.loads((HERE / "edit-plan.json").read_text())


def guide():
    if PLAN['status'].startswith('COMPLETE'):
        print('Final delivery guide is maintained by finish-production.py.')
        return
    rows = []
    for scene in PLAN["scenes"]:
        shots = "".join(
            f'<li><strong>{s["time"][0]:g}–{s["time"][1]:g}s</strong> '
            f'{html.escape(s["action"])}'
            f'<small>{html.escape(s.get("file", "Editorial motion graphic"))}</small></li>'
            for s in scene["shots"]
        )
        rows.append(f'<article><div class="stamp">{scene["start"]//60}:{scene["start"]%60:02d} — '
                    f'{scene["end"]//60}:{scene["end"]%60:02d}</div><h2>{html.escape(scene["id"][3:].title())}</h2>'
                    f'<p class="vo">{html.escape(scene["narration"])}</p><p class="overlay">'
                    f'{html.escape(scene["overlay"])}</p><ol>{shots}</ol></article>')
    rules = "".join(f'<li>{html.escape(rule)}</li>' for rule in PLAN["capture_rules"])
    page = '''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>EduSign — Launch film production guide</title><style>
:root{color-scheme:light}*{box-sizing:border-box}body{margin:0;background:#faf8f3;color:#203049;font:17px/1.65 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
main{max-width:1000px;margin:0 auto;padding:72px 32px}header{padding:0 0 42px;border-bottom:1px solid #dcdedb}.brand{font-size:25px;font-weight:750;letter-spacing:-1px}.dot{color:#467862}
h1{font-size:54px;line-height:1.1;letter-spacing:-2px;max-width:720px;margin:22px 0}h2{margin:4px 0 24px;font-size:30px;letter-spacing:-1px}.status{color:#74502c;background:#f6ebd2;display:inline-block;padding:7px 14px;border-radius:8px;font-size:13px;font-weight:650}
.meta{color:#647080}.intro{max-width:780px}article{margin:28px 0;padding:36px;background:#fff;border:1px solid #e4e6e4;border-radius:20px;box-shadow:0 6px 24px #20304906}.stamp{font-size:13px;letter-spacing:2px;font-weight:700;color:#467862}
.vo{font-size:22px;line-height:1.5;letter-spacing:-.3px}.overlay{background:#f0f5ef;padding:16px 20px;border-radius:10px;color:#355f4d}li{margin:14px 0}small{display:block;color:#667082;font-size:13px;margin-top:5px}strong{font-variant-numeric:tabular-nums}.rules{padding:26px 36px;border:1px solid #dcdedb;border-radius:20px}footer{font-size:14px;color:#647080;margin-top:40px}a{color:#304eb4}
@media(max-width:600px){main{padding:32px 18px}h1{font-size:38px}article{padding:24px}.vo{font-size:19px}}@media print{article{break-inside:avoid;box-shadow:none}main{padding:0}body{font-size:11pt}h1{font-size:30pt}.vo{font-size:14pt}}
</style><main><header><div class="brand">EduSign<span class="dot">.</span></div><h1>Watch. Try. Connect.</h1><p class="meta">Launch film · 120 seconds · 1920 × 1080 · 30 fps · 3,600 frames</p><div class="status">PREPRODUCTION · Awaiting actual product recordings</div></header>
<p class="intro">The running application is accessible in Safari. Native recording could not be started through the available computer-use controls. No complete application footage was supplied or captured, and no final product demo has been rendered.</p>
<p class="intro">Capture the actions below in a demo account, then place the original clips in <code>launch-film/footage/</code> or attach them in the conversation. One continuous recording is also welcome. A genuine screenshot sequence can support an explicitly labelled animated walkthrough.</p>
<div class="rules"><h2>Capture once. Keep it real.</h2><ul>''' + rules + '''</ul></div>
''' + "".join(rows) + '''<footer><p>Voice draft: one consistent Coral narrator, warm and assured. Wording is shortened to allow natural pauses inside each scene. The audio draft is not evidence that a feature was demonstrated. Final narration must be matched to the received footage.</p><p>Caption text will be derived from the final voice track and checked against playback; approximate preproduction timing must not be treated as final captions. Keep credits and important controls outside the caption area.</p><p>Graphics use cream, navy and restrained green accents. The real application retains its existing blue controls. No interface reconstruction, generated signing hands, fictional learner metrics or public URL.</p><p>Final quality gate: 120.000 seconds, exactly 3,600 frames, 16:9, H.264 MP4 with AAC audio and fast-start; confirm audio/caption sync, every source clip, privacy redactions, creator credits, music rights and the 118–120 second logo hold.</p><p>API reference used for narration generation: <a href="https://developers.openai.com/api/docs/guides/text-to-speech">official OpenAI text-to-speech documentation</a>.</p></footer></main></html>'''
    (HERE / "production-guide.html").write_text(page)


def narrate():
    from dotenv import load_dotenv
    import os
    from openai import OpenAI
    load_dotenv(ROOT / "ai-service/.env")
    client = OpenAI(timeout=90, max_retries=1)
    out = HERE / "audio"
    out.mkdir(exist_ok=True)
    model = os.getenv("OPENAI_TTS_MODEL", "gpt-4o-mini-tts")
    audit = []
    inputs = []
    filters = []
    for index, scene in enumerate(PLAN["scenes"]):
        path = out / (scene["id"] + ".wav")
        if not path.exists():
            response = client.audio.speech.create(
                model=model, voice=PLAN["voice"], input=scene["narration"],
                response_format="wav", speed=1.0,
                instructions=("You are the same warm, confident English narrator across every passage of a thoughtful software launch film. "
                              "Natural conversational delivery, clear diction, calm assurance, no sales hype or theatrical emphasis. "
                              "Read at a comfortable 145 to 155 words per minute with brief natural pauses. "
                              "Pronounce EduSign consistently as ED-you-sign, and L S F as the individual letters ell ess eff. "
                              "Speak only the supplied text. Do not add words."),
            )
            path.write_bytes(response.content)
        # Speech responses may carry a streaming WAV header with an unknown
        # data size. Probe the actual media rather than trusting that header.
        duration = float(subprocess.check_output([
            "ffprobe", "-v", "error", "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1", str(path),
        ], text=True).strip())
        deadline = 118 if index == 6 else scene["end"] - 0.2
        available = deadline - scene["voice_start"]
        item = {"scene": scene["id"], "duration": round(duration, 3), "available": round(available, 3), "fits": duration <= available}
        audit.append(item)
        print(json.dumps(item), flush=True)
        inputs += ["-i", str(path)]
        delay = round(scene["voice_start"] * 1000)
        filters.append(f'[{index}:a]aresample=48000,aformat=channel_layouts=stereo,adelay={delay}|{delay}[s{index}]')
    (out / "timing-audit.json").write_text(json.dumps(audit, indent=2))
    if not all(x["fits"] for x in audit):
        raise SystemExit("Voice exceeds a scene. Shorten its script and regenerate that file; do not speed it up or truncate speech.")
    filters.append("".join(f'[s{i}]' for i in range(len(audit))) + 'amix=inputs=7:normalize=0,apad,atrim=duration=120,loudnorm=I=-18:TP=-2:LRA=7[out]')
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", *inputs, "-filter_complex", ";".join(filters), "-map", "[out]", "-ar", "48000", "-c:a", "pcm_s16le", str(out / "EduSign-narration-DRAFT-120s.wav")], check=True)
    print("Created 120-second narration draft. No final film or synchronized captions have been rendered.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--narration", action="store_true", help="Generate narration using the configured paid speech API")
    args = parser.parse_args()
    guide()
    if args.narration:
        narrate()
