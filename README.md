<div align="center">

# EduSign

### Watch. Try. Connect.

A bilingual learning platform for students and families discovering **French Sign Language (LSF)**.

**French & English interface · Video workshops · Interactive assistant · Family learning**

[Explore the product](#the-product) · [Architecture](#architecture) · [Run locally](#run-locally) · [Documentation](#documentation)

</div>

---

EduSign brings credited sign-language videos, guided practice, and a bilingual assistant into one learning journey. A parent can find a supported word, watch its demonstration with their child, and return to a workshop or a short learning activity.

**LSF** means *Langue des signes française* — French Sign Language. Switching the interface to English translates the experience; the lessons continue to teach LSF.

*En français : EduSign accompagne les élèves et leurs parents dans la découverte de la langue des signes française, avec des vidéos, des activités et un assistant bilingue.*

## Contents

- [The product](#the-product)
- [Architecture](#architecture)
- [How the assistant works](#how-the-assistant-works)
- [Run locally](#run-locally)
- [Configuration](#configuration)
- [Project structure](#project-structure)
- [Testing and verification](#testing-and-verification)
- [Learning records and privacy](#learning-records-and-privacy)
- [Current scope and next steps](#current-scope-and-next-steps)
- [Product film](#product-film)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [Sources and licensing](#sources-and-licensing)

## The product

A focused starting point for learning together, built around two workshops: **the alphabet** and **numbers**.

```mermaid
flowchart LR
    Discover["Discover a workshop"] --> Watch["Watch a credited LSF video"]
    Watch --> Try["Try camera practice"]
    Watch --> Quiz["Explore a comprehension quiz"]
    Try --> Reflect["Review your learning activity"]
    Quiz --> Reflect
    Reflect --> Together["Keep learning together"]
    Assistant["Find a sign or ask the coach"] -.-> Watch
    Assistant -.-> Together

    classDef main fill:#faf8f3,stroke:#203049,color:#203049
    classDef accent fill:#e8f0e9,stroke:#497663,color:#203049
    class Discover,Watch,Try,Quiz,Reflect main
    class Assistant,Together accent
```

| Experience | What learners can do |
| --- | --- |
| **Discover** | Explore the homepage and filter the workshop catalogue in French or English. |
| **Watch** | Follow alphabet and numbers resources with learning objectives, creator credits, and direct source links. |
| **Practise** | Record a short camera attempt, replay it, and try again. Experimental recognition is available for a limited demo vocabulary. |
| **Reflect** | Answer optional comprehension questions and see explanations. Saved scores are recalculated on the server. |
| **Find a sign** | Search supported French or English words, open one matching video, and use slow playback or looping. |
| **Ask the coach** | Request short learning plans, answer interactive questions, dictate a message, or listen to a response. |
| **Learn together** | View activity records and quiz results, read parent guidance, and share a lesson link. |

> **Two collections, clearly distinguished.** The assistant includes six sourced LSF clips from Elix and a separate imported collection of 354 clips labelled **“Sign language unverified.”** Translated search labels do not establish a clip’s sign language. Select the sourced LSF collection for LSF demonstrations.

### Main pages

| Route | Purpose |
| --- | --- |
| `/` | Product introduction and workshop previews |
| `/courses` | Searchable lesson catalogue |
| `/learn/lsf-alphabet` · `/learn/lsf-nombres` | Video, camera practice, and comprehension quiz |
| `/tutor` | Video lookup and interactive coach |
| `/dashboard` · `/report` | Personal learning notebook and report |
| `/parents` · `/resources` | Family guidance and learning resources |
| `/community` | Shared activities and lesson sharing |
| `/about` · `/packages` | Project mission and planned offers |

## Architecture

The **Next.js application** owns the user experience, session checks, and learning-data access. The **FastAPI service** handles assistant requests, speech, report insights, and experimental recognition. Supabase provides authentication, PostgreSQL, and private video storage.

```mermaid
flowchart TB
    Browser["Browser<br/>French / English interface"]

    subgraph App["EduSign application"]
        Web["Next.js 15 + React 19<br/>Pages and authenticated API routes"]
        Python["FastAPI<br/>Stateless AI service"]
        Model["Legacy recognition model<br/>TensorFlow + MediaPipe"]
    end

    subgraph Supabase["Supabase"]
        Auth["Auth<br/>Email / Google OAuth"]
        DB[("PostgreSQL<br/>Learning records")]
        Storage["Private Storage<br/>Project video collection"]
    end

    OpenAI["OpenAI<br/>Coaching and speech"]
    Sources["Credited media<br/>YouTube workshops / Elix clips"]

    Browser --> Web
    Browser <-->|"Sign-in and session"| Auth
    Web -->|"Verify user"| Auth
    Web <-->|"Drizzle ORM"| DB
    Web -->|"Create temporary media URL"| Storage
    Browser -->|"Play signed video URL"| Storage
    Browser -->|"Watch source media"| Sources
    Web <-->|"Internal token"| Python
    Python <-->|"Model requests"| OpenAI
    Python --> Model

    classDef app fill:#faf8f3,stroke:#203049,color:#203049
    classDef service fill:#e8f0e9,stroke:#497663,color:#203049
    class Browser,Web,Python,Model app
    class Auth,DB,Storage,OpenAI,Sources service
```

The Python service has **no direct database connection**. Next.js sends the context needed for each request. Browser-facing assistant, voice, and recognition routes require an authenticated Supabase user; the internal gateway supplies `X-Internal-Token` when configured.

| Layer | Technologies |
| --- | --- |
| Web | Next.js 15, React 19, TypeScript |
| Interface | Tailwind CSS, Radix Slot, Lucide icons, Recharts |
| Identity and data | Supabase Auth, PostgreSQL, Drizzle ORM, Supabase Storage |
| AI service | Python, FastAPI, OpenAI SDK, Pydantic |
| Experimental recognition | TensorFlow, MediaPipe, OpenCV |
| Verification | Node.js test runner, Python unittest, HTTP and connected journey scripts |

## How the assistant works

The assistant separates **finding a known video** from **generating learning guidance**. A word lookup uses a deterministic catalogue; it does not ask a language model to invent a sign or media URL.

```mermaid
flowchart TD
    Input["Type a message or dictate"] --> Text["Text message<br/>Dictation can be reviewed before sending"]
    Text --> Language["Resolve French or English<br/>Ambiguous words use the interface language"]
    Language --> Mode{"Selected mode"}
    Mode -->|"Find a sign"| Lookup["Search the selected collection<br/>Known words and aliases"]
    Lookup --> Match{"Supported word?"}
    Match -->|"Yes"| Video["One matching video<br/>Collection label and source details"]
    Match -->|"No"| Missing["Explain the missing word<br/>No invented demonstration"]
    Mode -->|"Ask the coach"| Coach["Short plan, guided question,<br/>or resource recommendation"]
    Coach --> Reply["Reply in the resolved language<br/>Optional spoken playback"]

    classDef main fill:#faf8f3,stroke:#203049,color:#203049
    classDef accent fill:#e8f0e9,stroke:#497663,color:#203049
    class Input,Text,Language,Mode,Lookup,Match,Coach main
    class Video,Missing,Reply accent
```

- **Language follows the message.** `bonjour` receives a French response; `hello` receives an English response, even when the interface uses the other language. Shared words, letters, and numbers use the interface language.
- **The collection controls the demonstration.** In the sourced LSF collection, `bonjour` selects Elix’s Bonjour clip. The imported collection resolves to its own corresponding clip and retains its unverified label.
- **Coaching is grounded in selected resources.** Responses use structured output and approved resource identifiers. Guided questions are checked on the server; fallback guidance is explicitly labelled.
- **Voice is optional.** Dictation records up to 60 seconds and offers an editable transcript. Replies have individual playback controls; automatic reading is optional.
- **Conversation history is temporary.** Messages remain in the current page session and survive an interface-language switch; there is no persistent conversation archive.

Text lookup and guided exercises require the Python service but do not require an OpenAI key. Generative coaching and speech require a working provider configuration. The workshops remain available when the AI service is offline.

## Run locally

### Prerequisites

- Node.js 20 or newer, with npm.
- Python 3.10 or 3.11 for the pinned recognition dependencies. The AI Dockerfile uses Python 3.11.
- A Supabase project with database access and API keys.
- An OpenAI API key for generative coaching and voice.
- FFmpeg and FFprobe only if preparing video derivatives or rendering the product film.

Commands below assume a macOS/Linux shell. Start from the repository root and use separate terminals for the two services.

### 1. Install and configure the web application

```sh
cd edusign-next
npm ci
cp -n .env.local.example .env.local
```

Fill in `.env.local` using the [configuration reference](#configuration). Keep existing credentials: `.env.local` takes precedence over `.env`. Use the exact **Transaction pooler** connection string supplied by your Supabase project.

### 2. Prepare the database and start the app

Run these commands inside `edusign-next/` after configuring the environment:

```sh
npm run db:setup
npm run db:seed
npm run config:check
npm run db:verify
npm run dev -- --port 3100
```

`db:setup` applies migrations, profile triggers, and ownership policies. `db:seed` publishes the alphabet and numbers workshops, unpublishes known legacy courses, and disables known legacy packages. It preserves users and learning history. Use a development Supabase project when setting up a new environment.

Open **http://localhost:3100**.

### 3. Install and start the AI service

In a second terminal, starting at the repository root:

```sh
cd ai-service
python3.11 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
cp -n .env.example .env
```

Set `OPENAI_API_KEY` in `ai-service/.env`. If using an internal token, put the same `INTERNAL_API_TOKEN` in both services. Then start FastAPI:

```sh
.venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8100
```

The health endpoint is **http://localhost:8100/health**. Its `openai` field indicates that a key is configured, not that every configured model or quota is available. The assistant’s status check verifies provider/model access separately.

### 4. Configure authentication and media

Set Supabase’s site URL and callback allowlist to match `http://localhost:3100`. Email confirmation and password recovery need working email delivery; Google sign-in needs its provider configuration. Follow [the authentication guide](docs/AUTH_SETUP.md).

A fresh clone does **not** include the large imported video library, generated derivatives, or launch-film captures. Project-library playback requires the matching objects in the private `sign-demonstrations` bucket. See [video-library setup and synchronization](docs/SIGN_VIDEO_LIBRARY.md). The sourced Elix collection has its own [attribution record](edusign-next/public/signs/ATTRIBUTION.md).

For a local production build, stop the development server before running:

```sh
# Inside edusign-next/
npm run build
npm run start -- --port 3100
```

## Configuration

Copy the checked-in examples; never commit real keys. Only the Supabase URL and publishable key belong in browser configuration. Database credentials, service-role keys, OpenAI keys, and the internal token stay server-side.

### Web application — `edusign-next/.env.local`

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Application origin for authentication links; locally `http://localhost:3100`. |
| `SUPABASE_URL` | Supabase project URL. Supported public aliases are documented in the configuration helper. |
| `SUPABASE_PUBLISHABLE_KEY` | Browser-safe Supabase API key. |
| `SUPABASE_SECRET_KEY` | Server-only administrative access and private-video URL signing. |
| `DATABASE_URL` | PostgreSQL transaction-pooler connection string. |
| `MIGRATION_DATABASE_URL` | Optional migration connection; falls back to `DATABASE_URL`. |
| `AI_SERVICE_URL` | FastAPI origin; locally `http://localhost:8100`. |
| `INTERNAL_API_TOKEN` | Shared secret sent to FastAPI. Set a matching nonempty value when deploying. |
| `NEXT_PUBLIC_MEDIA_BASE_URL` | Optional base URL for existing media paths; separate from private sign-video signing. |
| `EDUSIGN_STANDARD_MONTHLY_EUR` | Optional Standard plan display price. Does not enable payment. |
| `EDUSIGN_TUTOR_MONTHLY_EUR` | Tutor plan display price; current default is €99/month. |
| `EDUSIGN_SCHOOLS_EMAIL` | Public school-enquiry address displayed on the Plans page. |

### AI service — `ai-service/.env`

| Variable | Purpose / configured default |
| --- | --- |
| `OPENAI_API_KEY` | Provider key for generative coaching and voice. |
| `INTERNAL_API_TOKEN` | Must match the web gateway’s token. An empty value skips internal authentication for local development. |
| `OPENAI_TUTOR_MODEL` | Coaching model; `gpt-4o-mini`. |
| `OPENAI_TRANSCRIBE_MODEL` | Transcription model; `gpt-transcribe`. |
| `OPENAI_TTS_MODEL` | Speech model; `gpt-4o-mini-tts`. |
| `AI_SERVICE_PORT` | Port used by the Python entry point; defaults to `8100`. An explicit Uvicorn `--port` takes precedence. |

Model names above reflect the repository’s configuration defaults. Confirm access with your provider account and override them as needed. Restart the AI service after changing its environment.

## Project structure

```text
.
├── edusign-next/                 # Web application and authenticated gateway
│   ├── src/app/                  # Pages, auth callbacks, and API routes
│   ├── src/components/           # Lessons, assistant, reports, and shared UI
│   ├── src/lib/
│   │   ├── data/                 # Workshop and sign-video catalogues
│   │   ├── db/                   # Drizzle connection and schema
│   │   ├── i18n/                 # Locale handling and English translations
│   │   ├── quiz/                 # Versioned questions and server grading
│   │   └── video/                # Viewing-progress tracking and persistence
│   ├── public/signs/             # Sourced Elix clips and attribution
│   ├── drizzle/                  # Database migrations and ownership policies
│   ├── scripts/                  # Setup, media synchronization, smoke checks
│   └── tests/                    # Web contract and logic tests
├── ai-service/
│   ├── app/                      # Coaching, lookup, voice, reports, recognition
│   │   ├── data/                 # Mirrored catalogues and prompt resources
│   │   └── models/               # Preserved legacy recognition weights
│   ├── tests/                    # Python tests and opt-in live verification
│   ├── requirements.txt          # AI and pinned recognition dependencies
│   └── Dockerfile                # Python 3.11 service image
├── docs/                         # Product history, auth, and media guides
├── launch-film/                  # Film sources, edit plan, and production record
└── AGENTS.md                     # Repository contribution instructions
```

## Testing and verification

### Local code checks

```sh
# Inside edusign-next/
npm run typecheck
npm run lint
npm test
npm run build
```

```sh
# Inside ai-service/
.venv/bin/python -m unittest discover -s tests
```

### HTTP checks

With the web app running on **port 3100**, run from `edusign-next/`:

```sh
node scripts/smoke-auth.mjs
node scripts/smoke-http.mjs
node scripts/smoke-locales.mjs
node scripts/smoke-product-pages.mjs
node scripts/verify-lsf-links.mjs
```

### Connected checks — explicit opt-in

Use a test Supabase project. These scripts create temporary accounts and clean them up afterward. Start the web app on **3100** and the AI service on **8100** for the full journey and assistant checks.

```sh
# Inside edusign-next/
node scripts/verify-auth.mjs --temporary-user
node scripts/verify-ownership.mjs --temporary-users
node scripts/verify-signup.mjs --temporary-user
node scripts/verify-learner-journey.mjs --temporary-user
node scripts/verify-tutor.mjs --temporary-user
```

The signup test verifies confirmation without sending email. It does not prove SMTP delivery or the complete browser OAuth flow.

An optional real-provider check exercises synthetic French and English conversations and the speech pipeline. It makes billable API calls:

```sh
# Inside ai-service/
.venv/bin/python tests/verify_live_coach.py --live-api
```

Compilation, HTTP tests, and synthetic speech tests do not replace browser review. Verify real microphone input, camera capture, YouTube playback, mobile layouts, and authentication redirects separately.

### Troubleshooting

| Symptom | Check |
| --- | --- |
| Assistant reports unavailable | FastAPI is running on `8100`; `AI_SERVICE_URL` is correct; internal tokens match. |
| Text works but voice fails | Provider key, model access, and quota; microphone permission for dictation; restart after environment changes. |
| Project-library video will not play | User session, `SUPABASE_SECRET_KEY`, matching catalogue objects, and private-bucket synchronization. |
| Database or profile error | Pooler URL, `db:setup`, and `db:verify`. Check whether `.env.local` overrides an older `.env`. |
| Google sign-in unavailable | Enable and configure Google in Supabase, including callback URLs. |
| Confirmation email missing | SMTP configuration, authorized recipients, and authentication redirect settings. |

## Learning records and privacy

EduSign keeps different signals separate so the report is understandable:

| Record | Meaning |
| --- | --- |
| Practice completion | A learner’s declaration that they tried an activity. |
| Video progress | Estimated active playback, unique coverage, and last position. Pauses, buffering, background time, and large seeks are excluded. |
| Quiz score | Comprehension answers for a versioned quiz; saved results are recalculated on the server. |
| Recognition result | Experimental demo feedback, not a certified signing score and not recorded as one. |

Anonymous quiz attempts remain on the page. Signed-in results are saved to Supabase. Viewing progress does not establish attention or mastery; the last unsent interval can be lost if the connection closes. One account currently represents a shared notebook, without separate child profiles.

Camera recordings capture no audio. Anonymous practice stays local; authenticated analysis sends up to 30 reduced JPEG frames to the Python service for in-memory processing. The service does not save those frames to disk. Dictation and spoken replies use the configured speech provider. The French/English coach prompt receives selected progress aggregates without the profile’s name or age, alongside conversation text supplied by the user.

Private project clips are served through authenticated catalogue IDs and temporary signed URLs. A copied URL can remain usable until its one-hour expiry. Original local media is preserved in its existing public-assets location; private Storage does not retroactively make those source files private.

## Current scope and next steps

EduSign is a working discovery prototype with deliberately limited teaching scope.

- **Learning content:** two workshops and a small sourced LSF clip collection. Review the pedagogy and demonstrations with qualified LSF contributors before expanding the curriculum.
- **Gesture analysis:** the legacy model covers A/B/C and 1/2/3. Its class ordering is assumed, confidence is uncalibrated, and accuracy has not been validated for LSF. Feedback can be a match, a different prediction, or uncertain.
- **Voice and devices:** automated bilingual speech checks exist; physical microphone and mobile-device coverage still need broader verification.
- **Accounts:** no separate child profiles or persistent assistant history yet.
- **Plans and community:** paid offers are informational; checkout and booking are not enabled. The community page provides activities and sharing, not a member forum.
- **Deployment:** complete deployed authentication/email checks, content-rights review, and operational validation before a public launch.

The [product plan](docs/EDUSIGN_PLAN.md) records implementation history and earlier verification snapshots. Later dated entries supersede older descriptions.

## Product film

The repository includes the sources for a **120-second, 1920 × 1080 launch film**: real application screenshots, editorial motion, English AI narration, captions, an original instrumental score, and a separately credited Elix source-video excerpt.

See the [production guide and credits](launch-film/production-guide.html), [edit plan](launch-film/edit-plan.json), and [production record](launch-film/production-report.json).

The MP4, narration, and source captures are local artifacts excluded from Git. When available, the main export is `launch-film/renders/EduSign-launch-120s.mp4`. Re-rendering requires the original capture/audio directories, FFmpeg, Pillow, NumPy, and the fonts documented by the renderer. The film is an animated product walkthrough, not continuous screen recording.

## Documentation

| Guide | Use it for |
| --- | --- |
| [Product plan](docs/EDUSIGN_PLAN.md) | Scope, decisions, implementation history, and verification notes |
| [Authentication setup](docs/AUTH_SETUP.md) | Supabase email, Google OAuth, redirects, and account checks |
| [Video library](docs/SIGN_VIDEO_LIBRARY.md) | Collections, media preparation, private storage, and bilingual lookup |
| [Elix attribution](edusign-next/public/signs/ATTRIBUTION.md) | Source files, creators, conversion notes, and licenses |
| [Web environment example](edusign-next/.env.local.example) | Web application configuration |
| [AI environment example](ai-service/.env.example) | Provider and internal-service configuration |
| [Workspace instructions](AGENTS.md) | Contribution rules and required checks |

## Contributing

Read [AGENTS.md](AGENTS.md) and the product plan before making architectural changes.

1. Keep interface changes bilingual. Use the locale provider and add English copy and accessible labels to `edusign-next/src/lib/i18n/en.json`.
2. Reuse the shared colour tokens in `edusign-next/src/app/globals.css` and `tailwind.config.ts`. Keep success and warning states distinct.
3. Preserve source media, model weights, learner history, and creator credits. Never label an unverified collection as LSF.
4. Version changed published quiz questions with a new quiz identifier so historical results retain their meaning.
5. Run the relevant checks, review changed screens in a real browser, and state any interactions that remain unverified.
6. Make focused commits with accurate descriptions. Keep credentials and generated media out of Git.

## Sources and licensing

- **Alphabet workshop:** MAE Langue des Signes. **Numbers workshop:** Dico Plus LSF. Lessons embed the original publications and retain creator attribution; their metadata is in the [LSF catalogue](edusign-next/src/lib/data/lsf-catalog.json).
- **Sourced sign clips:** Elix — Signes de sens, distributed under **CC BY-SA 4.0**, with original URLs, license links, and adaptation notices in the [attribution file](edusign-next/public/signs/ATTRIBUTION.md).
- **Imported project clips:** retained from the existing project. Their sign language is unverified; translated labels are search aids, not linguistic validation.

EduSign is not affiliated with the referenced creators or dictionaries. Media retains its respective rights and licenses. No standalone project-wide `LICENSE` file is currently included; do not assume the application code or imported media has an open-source redistribution license.
