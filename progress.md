# Progress Tracker

> Cross-session memory. Update at end of each work session. Most recent at top.

## 2026-05-11 (Phase 1 milestone: end-to-end backend live)

### Done this session
- [x] Vapi & OpenRouter accounts registered, keys configured locally
- [x] Webhook smoke test: 21/21 checks pass on **local** dev server
- [x] Deployed to Vercel production: https://dispatch-agent-seven.vercel.app
- [x] Pushed `NEXT_PUBLIC_VAPI_*` env vars to Vercel (Production + Development)
- [x] Synced assistant config to Vapi with prod `serverUrl` + 4 tools
- [x] Webhook smoke test: **21/21 checks pass on PRODUCTION** ✅
- [x] Confirmed JSON response schema matches Vapi tool-calls spec

### Live URLs
- Demo page: https://dispatch-agent-seven.vercel.app/demo/hvac
- Webhook:   https://dispatch-agent-seven.vercel.app/api/vapi-webhook
- Vapi assistant: `a8a9622e-7207-4119-b352-9a6ebfd39c42`

### Gotcha logged (for future sessions)
- ⚠️ `npx vercel link` **silently overwrites `.env.local`** with cloud env vars (only adds VERCEL_OIDC_TOKEN to a fresh project, deleting everything else). Always back up `.env.local` before running `link` or `env pull`:
  ```bash
  cp -p .env.local ".env.local.bak.$(date +%Y%m%d-%H%M%S)"
  ```
  (`.env*` is gitignored, so backups won't leak.)
- Workaround we used: `VAPI_SERVER_URL=... npm run sync:hvac` to override without touching `.env.local`.

### Next up (user actions)
- [ ] Open demo page on **iPhone Safari** → grant mic → tap Call → talk to Riley
- [ ] Verify tool calls fire correctly during the live call (book an appt, ask for quote, trigger emergency)
- [ ] If voice quality / latency / model is good → proceed to Upwork pitch prep

---

## 2026-05-11 (Phase 0 / Phase 1 kickoff)

### Decisions locked
- Direction: **AI Voice Receptionist** (pivoted from Service Dispatcher v1 after Stage 0 validation)
- Vertical for MVP: **HVAC** (single vertical, validated by Reddit + Upwork data)
- Stack: Next.js 16.2 + Vapi Web SDK + OpenRouter (user's existing key) + Supabase + Vercel
- Cost discipline: zero upfront paid commitment; use free tiers + Vapi $10 credit
- 10h MVP gate: build → pitch 5 Upwork jobs → continue only if ≥1 reply

### Done
- [x] Stage 0 validation: 13 Reddit threads + 10+ Upwork gigs = market validated
- [x] Cost model: dev = $0, public demo = $10-30/mo
- [x] Account map: OpenRouter (user has) ✅, Anthropic skipped, Twilio deferred
- [x] Project scaffold: Next.js 16.2.6 + React 19.2.4 + TS + Tailwind 4 (this session)
- [x] Created: README, SPEC.md, progress.md, .env.example, docs/

### In progress
- [ ] **User**: register Vapi (free, no card), connect OpenRouter key, run 1 test call
- [ ] **Me**: write Phase 1 code (HVAC vertical, Web SDK demo, webhook tools)
- [ ] **Both**: `git remote add origin git@github.com:ssxxs/dispatch-agent.git` (user does push)

### Blocked / pending decisions
- (none yet)

### Open questions
- Does user's OpenRouter account allow free model calls? (User to verify with curl)
- Will Vapi Dashboard accept OpenRouter key from China IP? (User to test)

### Files of note
- `SPEC.md` — product spec v2
- `lib/verticals/hvac/` — HVAC vertical config (prompt + roster + business rules)
- `app/api/vapi-webhook/route.ts` — tool call webhook
- `voice/vapi-config/hvac-assistant.json` — Vapi assistant config (paste into Dashboard)
- `docs/ACCOUNT_SETUP.md` — registration runbook

### Costs incurred so far
- $0
