<div align="center">

# Dispatch Agent

**24/7 AI voice receptionist for service businesses.**
Books appointments. Quotes prices. Escalates emergencies. Never misses a call.

[![Live Demo](https://img.shields.io/badge/live%20demo-dispatch--agent--seven.vercel.app-emerald?style=for-the-badge)](https://dispatch-agent-seven.vercel.app/demo/hvac)
[![Built with Vapi](https://img.shields.io/badge/voice-Vapi.ai-7c3aed?style=for-the-badge)](https://vapi.ai)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Deployed on Vercel](https://img.shields.io/badge/deployed-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)

[**🎙️ Try the live demo**](https://dispatch-agent-seven.vercel.app/demo/hvac) ·
[Architecture](#architecture) ·
[Run it locally](#run-it-locally) ·
[How it works](#how-it-works)

</div>

---

## What it does

A small business gets a phone call. Their AI receptionist — Riley, in our HVAC demo — picks up on the first ring, listens to the issue, decides the right action, and either:

- **Books an appointment** with the next available technician (with skills + urgency matching)
- **Quotes a price range** for common repairs, with a human disclaimer
- **Pages the owner immediately** if it's a real emergency (gas leak, flooding, no heat with vulnerable person)
- **Hands off** politely if it's out of scope

Same backend powers **voice calls (via Vapi)** and **text chat (direct LLM)**. Visitors without a mic can still test it. Every assistant reply shows the tool calls it made — full transparency, not a black box.

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
                                │ Mock roster  │   Phase 1: in-memory
                                │ + business   │   Phase 2: Supabase
                                │ rules        │
                                └──────────────┘
```

**Same tools, two channels:**

```
   Voice path:  caller → Vapi → OpenRouter → /api/vapi-webhook → tools
   Text path:   browser → /api/chat (agentic loop) → tools
                                  └─→ shared lib/verticals/hvac/tools.ts
```

The agentic loop in `/api/chat` runs up to 4 LLM ↔ tool iterations per turn. Tool calls are surfaced in the UI as expandable badges — you see what the AI decided and why.

---

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Voice (STT + TTS + orchestration) | **Vapi.ai** | Fastest to ship, $10 free credit, swappable to Twilio + OpenAI Realtime |
| LLM provider | **OpenRouter** | One key, route between GPT-4o-mini / Gemini Flash / Claude Haiku for cost control |
| Web framework | **Next.js 16** (App Router, RSC, Turbopack) | API routes + UI in one repo, edge-friendly |
| Styling | **Tailwind CSS 4** | No CSS files, theme via tokens |
| Deployment | **Vercel** | Zero-config Next.js, free hobby tier |
| Persistence (Phase 2) | **Supabase** | Postgres + RLS + auth in one |
| Language | **TypeScript** strict mode | Catches tool-arg shape bugs at build time |
| Telephony (Phase 3) | **Twilio** | Real US phone numbers, BYO number support |

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

Open http://localhost:3000/demo/hvac → switch to **💬 Text chat** tab → click an example bubble. (Voice mode requires you also configure a Vapi assistant — see [`docs/ACCOUNT_SETUP.md`](./docs/ACCOUNT_SETUP.md).)

### Required env vars

```bash
# Required for voice mode (browser-side, safe to expose)
NEXT_PUBLIC_VAPI_PUBLIC_KEY=...
NEXT_PUBLIC_VAPI_HVAC_ASSISTANT_ID=...

# Required for text mode (server-side, keep secret)
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL=openai/gpt-4o-mini   # or google/gemini-2.0-flash-exp:free for $0/call

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

### Adding a new vertical

```bash
mkdir -p lib/verticals/dental
# Copy + adapt the 4 files from hvac/
cp lib/verticals/hvac/{prompt.ts,mock-roster.ts,business-rules.ts,kb.md} lib/verticals/dental/
# Edit them for your industry vocabulary, emergencies, pricing
# Then build a `tools.ts` that imports from these
# Wire into the demo page via a vertical switcher
```

---

## Repo layout

```
dispatch-agent/
├── app/
│   ├── api/
│   │   ├── vapi-webhook/route.ts    # Vapi tool-call receiver (voice path)
│   │   └── chat/route.ts            # Text chat with agentic loop
│   ├── demo/hvac/page.tsx           # Voice + text tabbed demo UI
│   └── page.tsx                     # Marketing landing page
├── components/
│   ├── CallButton.tsx               # Vapi Web SDK integration
│   ├── TranscriptStream.tsx         # Live voice transcript renderer
│   └── TextChat.tsx                 # Text mode with tool-trace badges
├── lib/
│   ├── types.ts                     # Shared types (verticals, urgency, slots)
│   └── verticals/hvac/
│       ├── prompt.ts                # System prompt (call flow, emergencies, tone)
│       ├── tools.ts                 # Tool definitions + handlers (single source)
│       ├── mock-roster.ts           # In-memory technician roster (Phase 1)
│       ├── business-rules.ts        # Emergency keywords, hours, owner phone, quotes
│       └── kb.md                    # Knowledge base for prompt ingestion
├── voice/vapi-config/
│   └── hvac-assistant.json          # Vapi assistant config (model + voice + STT)
├── scripts/
│   ├── sync-vapi-assistant.mjs      # Push config + tools to Vapi (idempotent)
│   └── test-webhook.mjs             # 21-check smoke test (local or prod)
└── docs/
    ├── ACCOUNT_SETUP.md             # Registration runbook (Vapi, OpenRouter, ...)
    ├── COST_MODEL.md                # Full cost breakdown
    ├── DEMO_VIDEO_SCRIPT.md         # 30s + 60s demo recording playbook
    └── UPWORK_PITCH.md              # Pitch templates + JD scanning playbook
```

---

## Cost

At demo / Upwork-portfolio scale: **~$0/month**.

| Component | Free tier | After free tier |
|---|---|---|
| Vapi voice | $10 credit on signup (~50 demo calls) | $0.05–$0.10 / minute |
| OpenRouter | $0 with free models (`gemini-2.0-flash-exp:free`) | ~$0.001 / message with `gpt-4o-mini` |
| Vercel hosting | Hobby plan free | Pro $20/mo for custom domains |
| Supabase (Phase 2) | Free tier covers up to 500MB | $25/mo Pro |

Production estimate at **100 calls/month**: ~$30–$60/mo all-in. See [`docs/COST_MODEL.md`](./docs/COST_MODEL.md).

---

## Status

- ✅ **Phase 1 (MVP)** — backend live, 21/21 smoke checks passing on production, voice + text both working
- 🚧 **Phase 2** — Supabase persistence (call logs, appointments, customers), multi-vertical support, dashboard
- 📅 **Phase 3** — Twilio number provisioning, post-call analytics, multi-tenant deployment template

---

## Built by

Built in 2 days as a portfolio piece for service-business AI work. Available for similar builds via [Upwork](https://www.upwork.com).

If you're a service-business owner who wants this for *your* company — HVAC, dental, plumbing, legal intake, real estate — open an issue or reach out. Single-vertical adaptation typically takes 1–2 weeks end to end.

---

## License

Source code: MIT.
HVAC vertical config (prompt + roster + rules) is illustrative — replace with your own for production use.
