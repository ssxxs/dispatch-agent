<div align="center">

# Dispatch Agent

**24/7 AI voice receptionist for service businesses.**
Books appointments. Quotes prices. Escalates emergencies. Never misses a call.

[![Live Demo](https://img.shields.io/badge/live%20demo-dispatch--agent--seven.vercel.app-emerald?style=for-the-badge)](https://dispatch-agent-seven.vercel.app)
[![Built with Vapi](https://img.shields.io/badge/voice-Vapi.ai-7c3aed?style=for-the-badge)](https://vapi.ai)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Deployed on Vercel](https://img.shields.io/badge/deployed-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)

[**🎙️ Try a live demo**](https://dispatch-agent-seven.vercel.app) ·
[Architecture](#architecture) ·
[Run it locally](#run-it-locally) ·
[How it works](#how-it-works)

**Four industries live, one factory pattern:**
[🔥 HVAC](https://dispatch-agent-seven.vercel.app/demo/hvac) (voice + text) ·
[🚰 Plumbing](https://dispatch-agent-seven.vercel.app/demo/plumber) ·
[⚡ Electrical](https://dispatch-agent-seven.vercel.app/demo/electrician) ·
[� Dental](https://dispatch-agent-seven.vercel.app/demo/dental)

</div>

---

## What it does

A small service business gets a phone call. Their AI receptionist — Riley (HVAC), Sam (plumbing), Alex (electrical), or Jordan (dental) — picks up on the first ring, listens to the issue, decides the right action, and either:

- **Books an appointment** with the next available technician (with skills + urgency matching)
- **Quotes a price range** for common repairs, with a human disclaimer
- **Pages the owner immediately** if it's a real emergency (gas leak, flooding, knocked-out tooth, sparking outlet)
- **Hands off** politely if it's out of scope (DIY questions, off-topic, weather)

Same backend powers **voice calls (via Vapi)** and **text chat with SSE streaming**. Visitors without a mic can still test it — every reply streams in token-by-token, with tool calls surfaced as live badges so you can see exactly what the AI decided and why. No black-box magic.

Four verticals share one factory: a new industry takes ~45 minutes of focused work (system prompt + roster + business rules + register). See [Multi-vertical factory](#multi-vertical-factory) below.

> 📺 **30-second demo video:** see [`docs/DEMO_VIDEO_SCRIPT.md`](./docs/DEMO_VIDEO_SCRIPT.md) for the recording playbook.

---

## Why it matters

For service-business owners (HVAC, plumbing, dental, legal intake, real estate):

| Today | With Dispatch Agent |
|---|---|
| Misses 30–40% of after-hours calls | Picks up 24/7, every call |
| Pays $400–$1500/mo for a human answering service | Runs at ~$30–$80/mo on hosted infra |
| Front desk overwhelmed during peak | AI handles routine; humans handle exceptions |
| Same boilerplate questions to every caller | Captures structured data on first contact |

Each missed call in HVAC averages a **$300 lost ticket**. At 20% miss rate, this pays for itself in week one.

---

## Architecture

```
   ┌────────────────┐                                     ┌──────────────────┐
   │  Caller phone  │   PSTN / WebRTC                     │ Service business │
   │  / browser     │ ───────────────┐                    │  owner's mobile  │
   └────────────────┘                ▼                    └────────▲─────────┘
                                ┌─────────────┐                    │
                                │   Vapi.ai   │  emergency page    │
                                │  (voice)    │ ───────────────────┘
                                └──────┬──────┘
                                       │  STT + LLM + TTS
                                       │  (with tool calls)
                                       ▼
                                ┌──────────────┐         ┌────────────────────┐
                                │  OpenRouter  │ ◀─────▶ │ openai/gpt-4o-mini │
                                │  (LLM router)│         │ google/gemini ...  │
                                └──────┬───────┘         │ anthropic/claude.. │
                                       │                 └────────────────────┘
                                       │  function call: check_availability /
                                       │  book_appointment / get_quote_range /
                                       │  escalate_to_owner
                                       ▼
                                ┌──────────────┐
                                │   Webhook    │   Next.js route on Vercel
                                │  /api/...    │   shared tool handlers
                                └──────┬───────┘   typed args + validation
                                       │
                                       ▼
                                ┌──────────────┐
                                │ Vertical     │   buildVerticalTools(cfg)
                                │ factory      │   = same 4 tools, different
                                │              │   roster + prompt + rules
                                └─────┬──────┘
                                      │
          ┌───────────────────┼───────────────────┐
          ▼                  ▼                   ▼          ▼
      ┌─────────┐      ┌───────────┐    ┌───────────┐ ┌──────────┐
      │  HVAC  │      │ Plumber │    │Electric│ │ Dental │
      │ roster │      │ roster  │    │ roster │ │ roster │
      └─────────┘      └───────────┘    └───────────┘ └──────────┘
```

**Same tools, two channels, four verticals:**

```
   Voice path:  caller → Vapi → OpenRouter → /api/vapi-webhook → vertical.handler
   Text path:   browser → /api/chat (Edge runtime, SSE stream) → vertical.handler
                                  └─→ shared buildVerticalTools() factory
                                          └─→ lib/verticals/{hvac,plumber,electrician,dental}/
```

The agentic loop in `/api/chat` runs up to 4 LLM ↔ tool iterations per turn, **streamed** as Server-Sent Events. The client renders tool calls as live progress badges (running → result) and reply tokens stream in word-by-word. No "three dots" wait — first feedback in under 200ms.

---

## Tech stack

| Layer | Choice | Version | Why |
|---|---|---|---|
| Web framework | **Next.js** (App Router, RSC, Turbopack) | `16.2.6` | API routes + UI in one repo, edge-friendly |
| UI runtime | **React** / **React DOM** | `19.2.4` | Server Components + new `use()` / Actions APIs |
| Language | **TypeScript** (strict mode) | `^5.9.3` | Catches tool-arg shape bugs at build time |
| Styling | **Tailwind CSS** (+ `@tailwindcss/postcss`) | `^4.3.0` | No CSS files, theme via CSS tokens, zero-config v4 engine |
| Linting | **ESLint** + **eslint-config-next** | `9.39.4` / `16.2.6` | Flat config (`eslint.config.mjs`) aligned with Next 16 |
| Voice (STT + TTS + orchestration) | **Vapi.ai** Web SDK (`@vapi-ai/web`) | `^2.5.2` | Fastest to ship, $10 free credit, swappable to Twilio + OpenAI Realtime |
| LLM provider | **OpenRouter** (HTTP, streaming SSE, no SDK) | — | One key, route between GPT-4o-mini / GLM 4.5 Air / Claude Haiku for cost control |
| Chat API runtime | **Vercel Edge** (V8 isolate) | — | Native Web streams = no CDN buffering on SSE chunks |
| Deployment | **Vercel** | — | Zero-config Next.js, free hobby tier |
| Persistence (Phase 2) | **Supabase** | — | Postgres + RLS + auth in one |
| Telephony (Phase 3) | **Twilio** | — | Real US phone numbers, BYO number support |

### Runtime requirements

- **Node.js** `>= 20.x` (matches `@types/node ^20`, required by Next.js 16)
- **npm** `>= 10` (or any compatible package manager)

### Full dependency manifest

Pinned in [`package.json`](./package.json); resolved versions captured in `package-lock.json`.

**Production dependencies**

| Package | Declared | Resolved |
|---|---|---|
| `next` | `16.2.6` | `16.2.6` |
| `react` | `19.2.4` | `19.2.4` |
| `react-dom` | `19.2.4` | `19.2.4` |
| `@vapi-ai/web` | `^2.4.0` | `2.5.2` |

**Dev dependencies**

| Package | Declared | Resolved |
|---|---|---|
| `typescript` | `^5` | `5.9.3` |
| `eslint` | `^9` | `9.39.4` |
| `eslint-config-next` | `16.2.6` | `16.2.6` |
| `tailwindcss` | `^4` | `4.3.0` |
| `@tailwindcss/postcss` | `^4` | `4.3.0` |
| `@types/node` | `^20` | `20.19.40` |
| `@types/react` | `^19` | `19.2.14` |
| `@types/react-dom` | `^19` | `19.2.3` |

> ⚠️ This project targets **Next.js 16**, which ships breaking changes vs. Next 14/15 (async `params`/`searchParams`, new caching defaults, Turbopack-by-default). Consult `node_modules/next/dist/docs/` before introducing patterns from older Next.js tutorials.

---

## Features

- ✅ **Voice + text** parity — same prompt, same tools, same backend
- ✅ **4 production tools** with typed schemas and graceful error handling:
  - `check_availability(urgency, needed_skills?)` — slot lookup with technician matching
  - `book_appointment(...)` — with required-field validation and confirmation IDs
  - `escalate_to_owner(reason, caller_phone)` — emergency triage path
  - `get_quote_range(issue_type)` — price ranges with human disclaimer
- ✅ **Emergency detection** — keyword + intent based, escalates BEFORE booking
- ✅ **Out-of-scope handling** — politely redirects DIY questions, weather, etc.
- ✅ **Pluggable verticals** — `lib/verticals/<name>/{prompt,roster,rules,kb}.ts` pattern
- ✅ **Idempotent assistant sync** — single command pushes prompt + tools + voice + STT to Vapi
- ✅ **21-check smoke test suite** — runs against local OR production webhook
- ✅ **Tool-call transparency** — UI shows every tool the AI called + the result it got back

Roadmap: see [`SPEC.md`](./SPEC.md) for Phase 2 (Supabase persistence + multi-vertical) and Phase 3 (Twilio numbers + analytics dashboard).

---

## Run it locally

```bash
git clone https://github.com/ssxxs/dispatch-agent.git
cd dispatch-agent
npm install
cp .env.example .env.local      # fill in your keys (see below)
npm run dev
```

Open http://localhost:3000 to see the multi-vertical landing page, then try any of:
- http://localhost:3000/demo/hvac — voice + text (needs Vapi env vars for voice)
- http://localhost:3000/demo/plumber — text
- http://localhost:3000/demo/electrician — text
- http://localhost:3000/demo/dental — text

Text mode just needs `OPENROUTER_API_KEY`. Voice mode also needs Vapi configuration — see [`docs/ACCOUNT_SETUP.md`](./docs/ACCOUNT_SETUP.md).

### Required env vars

```bash
# Required for voice mode (browser-side, safe to expose)
NEXT_PUBLIC_VAPI_PUBLIC_KEY=...
NEXT_PUBLIC_VAPI_HVAC_ASSISTANT_ID=...

# Required for text mode (server-side, keep secret)
OPENROUTER_API_KEY=sk-or-v1-...
# Recommended (paid, fast, reliable for demos): openai/gpt-4o-mini   (~$0.001/call)
# Free fallback (works, slightly slower):       z-ai/glm-4.5-air:free  ($0/call)
# Auto-route (resilient, picks best free model): openrouter/free       ($0/call)
OPENROUTER_MODEL=z-ai/glm-4.5-air:free

# Optional — only for the local sync script
VAPI_PRIVATE_KEY=...
```

### Smoke tests

```bash
# Verify the 4 tools against a local dev server (21 assertions)
npm run test:webhook

# Or against production:
WEBHOOK_URL=https://your-deployment.vercel.app/api/vapi-webhook npm run test:webhook
```

### Sync the assistant config to Vapi

```bash
# Pushes prompt + 4 tools + voice + STT settings to your Vapi assistant.
# Idempotent — safe to run repeatedly.
npm run sync:hvac

# Override the webhook URL for production:
VAPI_SERVER_URL=https://your-deployment.vercel.app/api/vapi-webhook npm run sync:hvac
```

---

## How it works

### Single source of truth for tools

`lib/verticals/hvac/tools.ts` exports both:
- `HVAC_TOOLS` — OpenAI / OpenRouter / Vapi compatible function definitions
- `handleHvacTool(name, params)` — pure async handler returning structured results

Both `/api/vapi-webhook` (voice) and `/api/chat` (text) import from this single module. Adding a new tool means writing one function and it's live in both channels.

### The agentic loop in `/api/chat`

```ts
for (let i = 0; i < MAX_ITERATIONS; i++) {
  const llm = await callOpenRouter(messages);
  if (!llm.tool_calls) return { reply: llm.content, tool_trace };
  for (const tc of llm.tool_calls) {
    const result = await handleHvacTool(tc.function.name, JSON.parse(tc.function.arguments));
    messages.push({ role: 'tool', tool_call_id: tc.id, content: JSON.stringify(result) });
    tool_trace.push({ name: tc.function.name, arguments: ..., result });
  }
}
```

Capped at 4 iterations — if the LLM gets stuck calling tools, we return an error instead of looping forever.

### Multi-vertical factory

Every vertical is just **four files** wired through one factory:

```
lib/verticals/<industry>/
  ├─ prompt.ts         # System prompt: persona, call flow, emergencies, scope
  ├─ business-rules.ts # Quote ranges, emergency keywords, owner phone, hours
  ├─ mock-roster.ts    # Technicians/dentists/electricians + availability
  └─ tools.ts          # 5-line wrapper around buildVerticalTools(cfg)
```

The factory (`lib/verticals/build-tools.ts`) generates the same 4 OpenAI-spec tool
definitions and a typed handler from those data sources — so the tool *schemas*
are identical across HVAC, plumbing, electrical, and dental, only the *data*
differs. Adding a new industry typically takes 30-45 minutes:

```bash
mkdir -p lib/verticals/realestate
# Author the 4 files following lib/verticals/dental/ as a template
# Register in lib/verticals/registry.ts (one entry)
# Add app/demo/realestate/page.tsx (10 lines, uses VerticalDemo)
# Done — voice + text + tool transparency, all working.
```

Fix a bug in the handler? It fixes all four verticals at once. Add a new tool?
All four get it. That's the leverage of the factory.

### Categorized prompt suggestions (UI detail worth noting)

Each vertical's `examplePrompts` is grouped into `{ emergency, quote, scheduling }`.
The chat UI picks 1 random prompt from each category on every page load, so
visitors **always** see the three core capabilities demonstrated. A 🎲 button
reshuffles without resetting the chat. Pure-random sampling would risk showing
three quote prompts and missing the emergency-triage demo entirely.

---

## Repo layout

```
dispatch-agent/
├── app/
│   ├── api/
│   │   ├── vapi-webhook/route.ts    # Vapi tool-call receiver (voice path)
│   │   └── chat/route.ts            # Text chat, Edge runtime, SSE streaming
│   ├── demo/
│   │   ├── hvac/page.tsx            # Voice + text tabbed demo
│   │   ├── plumber/page.tsx         # Text-only demo
│   │   ├── electrician/page.tsx     # Text-only demo
│   │   └── dental/page.tsx          # Text-only demo (HIPAA-aware prompt)
│   └── page.tsx                     # Multi-vertical landing page
├── components/
│   ├── CallButton.tsx               # Vapi Web SDK integration
│   ├── TranscriptStream.tsx         # Live voice transcript renderer
│   ├── TextChat.tsx                 # Text mode: SSE consumer + tool badges + streaming
│   └── VerticalDemo.tsx             # Shared demo layout (voice/text tabs)
├── lib/
│   ├── types.ts                     # Shared types (verticals, urgency, slots)
│   └── verticals/
│       ├── build-tools.ts           # Factory: cfg → { tools, handler }
│       ├── shared-roster.ts         # Slot-matching algorithm reused by all verticals
│       ├── registry.ts              # Single import surface (config + meta)
│       └── {hvac,plumber,electrician,dental}/
│           ├── prompt.ts            # System prompt
│           ├── business-rules.ts    # Quotes, emergencies, owner phone
│           ├── mock-roster.ts       # In-memory roster
│           └── tools.ts             # 5-line factory wrapper
├── voice/vapi-config/
│   └── hvac-assistant.json          # Vapi assistant config (model + voice + STT)
├── scripts/
│   ├── sync-vapi-assistant.mjs      # Push config + tools to Vapi (idempotent)
│   └── test-webhook.mjs             # End-to-end smoke test (local or prod)
└── docs/
    ├── ACCOUNT_SETUP.md             # Registration runbook (Vapi, OpenRouter, ...)
    ├── COST_MODEL.md                # Full cost breakdown
    ├── DEMO_VIDEO_SCRIPT.md         # 30s + 60s demo recording playbook + shoot-day artifacts
    └── UPWORK_PITCH.md              # Pitch templates + 5 filled-in ready-to-send pitches
```

---

## Cost

At demo / Upwork-portfolio scale: **~$0/month**.

| Component | Free tier | After free tier |
|---|---|---|
| Vapi voice | $10 credit on signup (~50 demo calls) | $0.05–$0.10 / minute |
| OpenRouter | $0 with free models (`z-ai/glm-4.5-air:free`, `openrouter/free`) | ~$0.001 / message with `gpt-4o-mini` |
| Vercel hosting | Hobby plan free | Pro $20/mo for custom domains |
| Supabase (Phase 2) | Free tier covers up to 500MB | $25/mo Pro |

Production estimate at **100 calls/month**: ~$30–$60/mo all-in. See [`docs/COST_MODEL.md`](./docs/COST_MODEL.md).

---

## Status

- ✅ **Phase 1 (MVP)** — backend live, smoke checks passing on production, voice + text both working
- ✅ **Phase 1.5 (Multi-vertical)** — 4 industries (HVAC / plumbing / electrical / dental) sharing the factory, categorized random prompts, SSE streaming, Edge runtime
- 🚧 **Phase 2** — Supabase persistence (call logs, appointments, customers), per-tenant dashboards, voice mode for all verticals
- 📅 **Phase 3** — Twilio number provisioning, post-call analytics, multi-tenant deployment template, legal-intake vertical (different tool shape from receptionist booking)

---

## Built by

Built in a week as a portfolio piece for service-business AI work. Available for similar builds via [Upwork](https://www.upwork.com).

If you're a service-business owner who wants this for *your* company — HVAC, dental, plumbing, legal intake, real estate — open an issue or reach out. Single-vertical adaptation typically takes 1–2 weeks end to end.

---

## License

Source code: MIT.
HVAC vertical config (prompt + roster + rules) is illustrative — replace with your own for production use.
