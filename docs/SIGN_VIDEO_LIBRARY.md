# Assistant video library

The default “Find a sign” collection uses the 354 existing clips from `edusign-next/public/assets/videos/signs`, at the owner's request. Original files are unchanged. French labels translate filenames for search; they do not validate the gestures or identify the sign language. Existing notes associate the legacy collection with Indian Sign Language, but it has not been independently verified. The UI labels it “Sign language unverified”. Lessons remain LSF.

## Storage and playback

The private Supabase bucket `sign-demonstrations` contains 708 objects: 354 original WebM files and 354 H.264 MP4 derivatives. Original bytes: 358,015,920; MP4 bytes: 30,932,088. Object paths contain SHA-256 hashes. Uploads do not overwrite existing objects; source hashes and remote sizes are checked. No learner records are migrated.

Authenticated users request `/api/signs/[id]/video`. The server accepts only catalog identifiers and returns a private, non-cached redirect to a one-hour signed URL. `?original=1` selects the preserved source. A copied signed link remains usable until expiry. The bucket itself is not public. Original local public files retain their existing location; this change does not remove them.

The API returns catalog IDs, never model-generated media URLs. Both Python and Next.js use matching versioned catalogs. Search supports exact aliases, common parent request templates, and typo suggestions. Unsupported words receive no unrelated demonstration. Separate word clips are not a signed sentence.

## Rebuild or synchronize

Run from the repository root with ffmpeg and ffprobe installed:

```sh
python3 edusign-next/scripts/prepare-sign-media.py
node edusign-next/scripts/sync-sign-storage.mjs
# Explicit upload using the existing ignored server environment:
node edusign-next/scripts/sync-sign-storage.mjs --upload
```

The first command builds ignored `.sign-media-cache/` derivatives and metadata; the second updates both catalogs without uploading. Upload is resumable and validates existing content-addressed objects by size. French labels are versioned in `ai-service/app/data/project-sign-labels.fr.json`; the optional authoring script `ai-service/scripts/translate_sign_labels.py` uses the configured OpenAI model to generate labels and is not needed at runtime. Review new labels before publication.

A separate six-clip LSF collection is sourced from Elix on Wikimedia Commons under CC BY-SA 4.0. It remains separate from imported clips. Credits, original URLs, license links and conversion notices appear in every player and in `public/signs/ATTRIBUTION.md`.

## Verification

Python tests cover every imported canonical word, bilingual requests, wrong-language requests, missing words, replay, transcript routing and catalog agreement. The authenticated `node scripts/verify-tutor.mjs --temporary-user` test checks both languages, clip hashes, seeking, private storage and authentication, then removes its temporary account. Run it from `edusign-next` with the app on port 3100 and AI service on 8100.

## Message language

French and English words and request phrasing determine the reply language independently of the interface. `bonjour` with English UI returns a French reply, one matching video ID, French title/controls and French speech. `hello` with French UI returns English. Shared vocabulary (for example `orange`, letters and numbers) falls back to the UI language. This deterministic vocabulary/phrase detector is not a general multilingual classifier. Transcription auto-detects the spoken language; speech output uses the resolved response language.

The studio separates the demonstration player from the conversation. One video is selected at a time, explored clips can be revisited, and missing-word results clear the previous selection.
