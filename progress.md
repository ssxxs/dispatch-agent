# Progress Tracker

> Cross-session memory. Update at end of each work session. Most recent at top.

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
