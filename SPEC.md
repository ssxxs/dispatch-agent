# Spec v2 — Voice Receptionist Agent

> Status: **Active**. Pivoted from Service Dispatcher (v1) after Stage 0 validation revealed Housecall Pro AI already covers v1 scope.
>
> **Off-plan additions ahead of Phase 2 gate are logged in [§11](#11-off-plan-decision-log-case-law). Read before adding anything new.**

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

| Phase | Hours | Scope | Status | Exit criteria |
|---|---|---|---|---|
| **1 (MVP)** | **10h** | HVAC vertical, Web SDK call, basic landing | ✅ done | Full booking flow in browser; deployed to Vercel |
| **1.5 (off-plan)** | ~6h actual | Multi-vertical factory + 3 extra verticals (plumber, electrician, dental) | ✅ done | 4 verticals share one factory; ~45 min to add a 5th |
| **2.0 (off-plan, partial)** | ~1h actual | Supabase `appointments` table + persistence in `book_appointment` / `check_availability` | ✅ done | DB writes verified end-to-end in prod; in-memory fallback when env unset |
| 2.1 | ~9h remaining | Admin dashboard `/admin/<vertical>`, `call_logs` table + writer, voice for plumber/electrician/dental | 🚫 gated | Owner can see live bookings + transcripts; voice for all 4 |
| 3 | 8h | n8n workflow: Google Calendar + Sheets + Slack escalation | 🚫 gated | Real bookings sync to external systems |
| 4 | 8h | Add Beauty + Legal + Moving verticals | 🚫 gated | 7 verticals selectable, isolated prompts/KBs |
| 5 | 4h | Landing polish + Loom 90s + Upwork portfolio entry | partial | Demo video recorded, posted, source on GitHub |
| 6 (opt) | 6h | Multilingual (ES/ZH) | 🚫 gated | International reach |

### ⛔️ Hard gate before any 🚫 work

**Zero new feature work past Phase 2.0 until ALL of:**
1. 5 Upwork pitches sent (templates in `docs/UPWORK_PITCH.md`).
2. ≥1 **substantive** reply received. "Substantive" = a human who:
   - Watched the demo OR clicked the live URL, AND
   - Asks a follow-up question OR proposes a call.
   - Form letters / auto-rejects / `"interested, send portfolio"` do NOT count.
3. Reply was within 14 days of pitch (signal decays fast).

**Allowed without the gate**: bug fixes, doc updates, refactors that don't add features, prompt-tuning for existing verticals, recording the demo video.

**If 5 pitches → 0 substantive replies**: do NOT build more. Iterate on pitch positioning + vertical selection instead. The bottleneck is external signal, not code.

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
| **Builder-mindset scope creep** | **H** | **§11 case-law log + hard gate language in §8. Cascade and human review every "what's next?" question against gate before starting work.** |

## 11. Off-plan decision log (case law)

Log of work done before its phase gate unlocked, why, and the lesson. Future
"what's next?" decisions should consult this section to avoid repeating the
same justifications.

### 2026-05-12 morning — Multi-vertical factory + 3 extra verticals (Phase 1.5)

- **Spec said**: Phase 4, after Upwork validation
- **Built**: `lib/verticals/build-tools.ts` factory + plumber + electrician + dental
- **Cost**: ~6h
- **Trigger**: Refactoring HVAC into a generic factory felt like part of Phase 1 polish. Once the factory existed, adding 3 more verticals was "30 min each".
- **Verdict**: Scope creep, but with high cohesion (real engineering signal for portfolio recruiters). The factory was probably justified; the 3 extra verticals could have waited until at least one Upwork reply asked about a non-HVAC industry.
- **Lesson**: "It's only 30 minutes" × 4 = 2 hours. Time-box the refactor; don't let it expand into adding new business logic.

### 2026-05-12 PM — Supabase `appointments` persistence (Phase 2.0)

- **Spec said**: Phase 2, gated on Upwork reply
- **Built**: Schema migration, `lib/supabase.ts` (admin client + persistBooking + fetchBookedSlotIds with timestamptz round-trip fix), factory integration, e2e test script (`npm run test:supabase`)
- **Cost**: ~1h dev + 2 commits + 1 schema migration
- **Trigger**: Cascade proposed `/admin/<vertical>` dashboard as "highest demo value next step". Human reviewed against §8 gate and called the violation. Persistence work was already done by then.
- **Verdict**: Borderline justified. The factory's `book_appointment` was returning fake `AA-XXXXXX` confirmation numbers that were not actually persisted — a sophisticated viewer of the demo would notice this is a stub. The Supabase wiring upgrades the demo from "plausible mock" to "actually-persisting prototype" without changing the surface UX. Cost was small, in-memory fallback means zero risk if env vars removed.
- **What was NOT built (correctly held back)**: `/admin/<vertical>` dashboard, `call_logs` table, voice for plumber/electrician/dental — those remain Phase 2.1 and gated.
- **Lesson**: Cascade pattern-match on "highest demo value" is biased toward building. Always cross-check against §8 gate before opening editor. The right move was to skip persistence too and trust that the existing tool-trace badges in the demo video (showing `🔧 book_appointment → AA-7B2K`) carry the same proof-of-execution signal at zero infra cost.

### Going forward (current as of 2026-05-12)

- **Next valid action**: record demo video + send 5 Upwork pitches.
- **Next valid feature work**: only after §8 hard gate satisfies.
- **If a "small" tactical refactor seems urgent**: ask "will this be visible in the 30s video or change a pitch line?" If no, it waits.
