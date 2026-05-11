# Spec v2 — Voice Receptionist Agent

> Status: **Active**. Pivoted from Service Dispatcher (v1) after Stage 0 validation revealed Housecall Pro AI already covers v1 scope.

## 1. Product one-liner

**"24/7 AI phone receptionist that knows your industry (HVAC / dental / beauty / legal / moving), qualifies callers, books appointments, escalates emergencies. Missed call = missed revenue. $50/mo replaces a $3,000/mo human."**

## 2. Validated buyer pain (Reddit + Upwork evidence)

- *"Most homeowners call 2–3 companies. The one that answers first usually gets the job."* — `r/hvacadvice`
- *"The phone rings four times and hits voicemail. The customer doesn't leave a message — **80% of callers won't** — and calls the next result on Google."* — `r/smallbusiness`
- *"It's not about replacing a receptionist, it's about catching the calls you're already missing."* — `r/AiForSmallBusiness` (6-month user)
- Upwork "Closebot" seller: **40+ HVAC/plumbing/solar bots deployed** — proven market

## 3. ROI math (for the 30-second pitch)

```
Typical HVAC small co:
  Missed calls/day      : 3-8
  Avg job value         : $200-2000
  Conversion if answered: ~30%
  ────────────────────────────────
  Monthly lost revenue  : ~$10,800

AI receptionist cost (this product):
  Twilio number   : $1.15/mo
  Vapi minutes    : ~$30/mo (200×3min)
  LLM (OpenRouter): ~$5/mo
  ────────────────────────────────
  Total           : ~$40/mo

ROI: 270x
```

## 4. Tech stack (May 2026, verified versions)

```
┌─ Voice in / out
│  Vapi.ai          ($0.05/min orchestration; STT+TTS included)
│  Vapi Web SDK     (Phase 1 MVP — no Twilio needed)
│  Twilio Number    (Phase 2+ — only when going beyond browser demo)
│
├─ LLM
│  OpenRouter       (BYOK to Vapi; user already has account)
│  - dev:  free models (Gemini Flash exp, Llama 3.3, etc.)
│  - prod: openai/gpt-4o-mini OR anthropic/claude-haiku-4.5
│
├─ App framework
│  Next.js 16.2     (App Router, Turbopack default, React Compiler stable)
│  React 19.2
│  Tailwind CSS 4
│  TypeScript 5
│
├─ Backend / DB
│  Supabase         (free tier: 500MB Postgres + pgvector + auth)
│
└─ Hosting
   Vercel hobby     (free)
```

**Decision log**:
- **No LangGraph**: Vapi handles agent orchestration. Adding LangGraph = +1 dep with no Phase 1 value.
- **No Twilio in MVP**: Vapi Web SDK lets browser act as the "phone". Demo works without PSTN.
- **No paid LLM during dev**: OpenRouter free tier covers all local testing.

## 5. Page structure

```
/                      Landing: hero, single CTA → /demo/hvac
/demo/hvac             HVAC voice demo (Phase 1 scope)
/demo/[vertical]       Other verticals (Phase 4+)
/architecture          Architecture diagram + "what this proves"
/contact               Upwork link, email, Calendly
```

## 6. Agent design (Phase 1, HVAC vertical)

Single Vapi assistant with system prompt + tools. **No multi-agent for MVP** — Vapi's single assistant with tools is enough for the call flow.

**Tools** (`/api/vapi-webhook` route):
- `check_availability(date, urgency)` → returns 3 nearest slots from mock roster
- `book_appointment(caller_name, phone, address, slot_id, issue)` → returns confirmation #
- `escalate_to_owner(reason, caller_phone)` → returns "owner will call back in 5 min"
- `get_quote_range(issue_type)` → returns $low-$high from rule table

**System prompt** drives:
- Greeting (1 sentence, by name if returning)
- Triage: ask for name, address, issue, urgency
- If emergency keywords ("no heat", "water leaking", "elderly") → `escalate_to_owner`
- Else → `check_availability` → `book_appointment`
- Always confirm before booking
- Close with summary text + SMS confirmation (mock)

## 7. Five verticals (Phase 4 expansion targets)

| Vertical | Hook | Differentiation |
|---|---|---|
| HVAC | Emergency dispatch + quote | After-hours owner route |
| Dental | Booking + reminders | "Toothache can't sleep" = urgent |
| Beauty/Spa | Multi-service + packages | Multilingual (ES, ZH, EN) |
| Legal intake | Qualify + book consult | Jurisdiction-aware |
| Moving | Quote estimate + survey | Inventory walkthrough |

## 8. Phase plan (35-50h total, time-boxed)

| Phase | Hours | Scope | Exit criteria |
|---|---|---|---|
| **1 (MVP)** | **10h** | HVAC vertical, Web SDK call, basic landing | Can run a full booking flow in browser; deploy to Vercel preview |
| 2 | 12h | Control panel: live transcript, call log, vertical switcher | Multi-vertical config, persistent call records |
| 3 | 8h | n8n workflow: Google Calendar + Sheets + Slack escalation | Real bookings sync to external systems |
| 4 | 8h | Add Dental + Beauty + Legal verticals | 4 verticals selectable, isolated prompts/KBs |
| 5 | 4h | Landing polish + Loom 90s + Upwork portfolio entry | Ready to pitch |
| 6 (opt) | 6h | Moving + multilingual (ES/ZH) | International reach |

**Gate after Phase 1**: invest in Phase 2 only if 5 Upwork pitches get ≥1 substantive reply.

## 9. Cost ceiling

- Phase 1 dev: **$0** (Vapi $10 free credit + OpenRouter free models)
- Public Demo monthly: **$10-30** (Vapi minutes + cheap paid LLM)
- Spend caps: Vapi daily $2, monthly $20

## 10. Risks (logged)

| Risk | Severity | Mitigation |
|---|---|---|
| Vapi/Retell pricing change | M | Architecture-level abstraction; LiveKit + OpenAI Realtime as Plan B |
| Twilio China KYC blocks Phase 2 | M | MVP doesn't need Twilio; Phase 2 can use US virtual number or bring-your-own |
| Demo phone abuse | L | Vapi spend limits + per-IP rate limiting |
| Housecall Pro / ServiceTitan AI catches up | M | Differentiate on multi-vertical + open architecture + accent handling |
| Voice quality poor on accents | M | Use Vapi's `eleven-labs-multilingual-v2` voice; verify in Phase 1 |
| Side-project momentum loss | H | Hard 10h Phase 1 gate; pivot or stop based on Upwork response |
