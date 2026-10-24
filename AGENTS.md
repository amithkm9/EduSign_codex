# EduSign — Codex workspace

Use Codex for development in this repository. Read README.md and docs/EDUSIGN_PLAN.md before making architectural changes.

- Web app: `edusign-next/` (Next.js, TypeScript, Supabase).
- AI service: `ai-service/` (Python, FastAPI, OpenAI).
- Support both French and English. Keep the lesson sign language LSF in either interface language.
- Add English UI copy to `edusign-next/src/lib/i18n/en.json`; use the locale provider for rendered text and accessible labels.
- Supabase owns authentication. Keep server keys and database credentials in ignored environment files.
- Preserve original model weights, media and learner records. Preserve Git history unless the user explicitly requests a fresh history; archive it locally before replacing it. Do not relabel unverified signs as LSF.
- Use focused commits for actual changes, with accurate messages and normal timestamps.
- Run `npm run typecheck`, `npm run lint`, `npm test` and `npm run build` in the web app after relevant changes. Run `.venv/bin/python -m unittest discover -s tests` in the AI service.
- HTTP smoke checks require the local app on port 3100. Tests that create temporary accounts require their explicit command-line opt-in and must clean up afterward.
- Browser visual review is separate from compilation and HTTP tests. Report any unverified interaction plainly.
