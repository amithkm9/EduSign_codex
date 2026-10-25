# EduSign — narrated Remotion demo

A 2:52, 1920 × 1080, 30 fps product demo edited from Amith's October 25 screen recording. The original recording is preserved at the repository root.

The film adds a seven-second animated opening, seven chapter headings, subtle framing motion, timed English captions, an original instrumental bed, and a fourteen-second closing sequence explaining Codex and OpenAI. The closing sequence replaces the final seven seconds of screen imagery while retaining the complete original narration. No product actions are simulated. Camera feedback remains labelled experimental; imported clips remain labelled unverified.

## Outputs

- `renders/EduSign-demo.mp4`: finished video with captions and mixed audio.
- `renders/EduSign-demo.en.srt`: optional subtitle track (English speech, automatically aligned and spelling-normalized).
- `src/Demo.tsx`: editable design and timeline.
- `production-report.json`: source and validation record.

## Preview and render

```sh
cd demo-remotion
npm ci
python3 prepare.py
npm run typecheck
npm run studio -- --port=3323
npm run render -- --browser-executable='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
```

The dedicated render port is 3322, avoiding local Next.js applications. A Remotion-managed browser may be used instead by omitting `--browser-executable`.

`prepare.py` requires FFmpeg, the original recording and `../launch-film/audio/original-score.wav`. It copies macOS Arial and Georgia font files locally for consistent rendering; those font files are not committed. Original footage, intermediate audio, copied fonts, and rendered media are excluded from Git. The caption data is already included, so rerendering does not make API calls.

## Audio and media

The speaker is Amith, from the supplied recording, not an AI replacement voice. Audio receives a high-pass filter, light noise reduction and loudness normalization. The instrumental score is the original locally synthesized EduSign score from `launch-film`; it is lowered beneath speech. The final mix targets −16 LUFS and −1.5 dBTP.

Lesson material visible inside the recording is credited to MAE Langue des Signes and Dico Plus LSF. Imported sign clips retain their existing provenance and unverified-language labels. Source-media rights remain with their owners.

The original recording's spoken wording is retained. Editorial notices distinguish experimental recognition from validated signing assessment and separate word clips from a signed-sentence translation.
