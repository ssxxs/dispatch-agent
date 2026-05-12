# Upwork Pitch Playbook

> Three pitch templates + a 60-second JD-scanning playbook.
> Goal: 1 reply per 5 submissions (industry baseline is ~1 per 15–20 for cold profiles).

---

## How to read this doc

1. **Find the right JD** (see *Targeting* below — don't pitch every job).
2. **Skim the JD for the 4 signals** (Stack, Industry, Pain, Budget — see playbook).
3. **Pick the matching template** by JD length:
   - JD ≤ 5 sentences or budget < $100 → **Variant A (short)**
   - JD 1–3 paragraphs or budget $100–$500 → **Variant B (medium)**
   - JD reads like an RFP / fixed-price ≥ $1k → **Variant C (long)**
4. **Replace the {{placeholders}}** — never submit a template with curly braces left in.
5. **Re-read once aloud** before sending. If it sounds like ChatGPT wrote it, rewrite.

---

## Targeting — which JDs to actually pitch

**Pitch if the JD mentions ANY of:**
- "Vapi", "Bland.ai", "Retell", "VoiceFlow", "Synthflow"
- "AI receptionist / answering service / phone agent / voice bot / inbound"
- "Twilio + AI", "Function calling", "Tool calling", "AI SDR with phone"
- "HVAC / plumbing / dental / law firm / med spa / real estate" + "AI calls/appointments"
- "OpenAI Realtime API", "GPT-4o voice"

**Skip (waste of connects) if:**
- No budget range and "ASAP" — usually tire-kickers
- "Looking for partners not employees" — equity-only nonsense
- ≥ 50 proposals already and only 5 hires lifetime — broken profile
- Asks for a free POC before hire — never do this

**Daily quota:** start at **5 pitches/day** for the first week. Track reply rate. If <1/15, the pitch is the problem, not the volume.

---

## The 4-signal JD scan (do this in 60 seconds)

Before writing anything, extract from the JD:

| Signal | What to look for | Where to use it |
|---|---|---|
| **Stack** | Tools they name: Vapi, Twilio, OpenAI, n8n, GHL, etc. | Echo their vocabulary in line 1 |
| **Industry** | HVAC, dental, legal, real estate, etc. | Reference your relevant vertical demo |
| **Pain** | "missed calls", "after-hours", "expensive answering service", "front desk overwhelmed" | Quote it back to them in line 2 |
| **Budget** | Hourly $/hr or fixed $ | Anchor your rate ±10% of the high end if hourly; never quote fixed in pitch |

**Trick:** if you can't find at least Stack OR Pain, the JD is probably noise. Skip.

---

## Variant A — Short (≤ 80 words)

> *Use when: JD is brief, budget is small ($50–$300), client likely just wants a fast freelancer.*

```
Hey {{first_name}} —

I built a working {{their_industry}} AI receptionist last week. Live demo
booking real appointments here (try voice or text):
https://dispatch-agent-seven.vercel.app/demo/hvac

Stack: {{their_stack_if_named}}. Handles booking, quotes, and emergency
escalation via tool-calling.

Can I do a 15-min Loom walking through how I'd adapt it to {{their_specific_pain}}?
No prep needed on your side.

— {{your_name}}
```

**Why it works:**
- Opens with action, not greeting
- Demo link in second sentence — they can verify before reading further
- Uses their vocabulary (`{{their_stack_if_named}}`)
- CTA is a Loom (lower friction than a call)
- ~50 words — fits the Upwork preview window without scrolling

---

## Variant B — Medium (~150 words)

> *Use when: JD is detailed, budget is $300–$1500, client wrote 1–3 paragraphs.*

```
Hi {{first_name}},

Your line about "{{exact_quote_from_jd}}" — I just solved this. Two days ago
I shipped a voice receptionist for an HVAC scenario that handles exactly
that flow: caller describes the issue, AI detects urgency, books the right
technician, and pages the owner for true emergencies (gas leak, flooding).

Live demo — voice OR text mode, both run the same 4-tool backend:
→ https://dispatch-agent-seven.vercel.app/demo/hvac

Try: "How much would AC repair cost?" or "Water is flooding from my unit!"

For your {{their_industry}} use case, the swap is straightforward:
- New system prompt (1–2 hours, calibrated to your vocabulary + edge cases)
- {{vertical_specific_tool}} tool added to the 4 existing ones
- Knowledge base ingestion for your service area / pricing / policies

Built on {{their_stack_if_named, else 'Vapi + OpenRouter + Next.js'}}. Fully
deployed, no vendor lock.

If useful, I can record a 5-min Loom showing exactly how I'd adapt the
prompt + tools for {{their_business_name_or_industry}}. Where should I send it?

— {{your_name}}
```

**Why it works:**
- Line 1 quotes them back — proves you read it, not template-blasting
- Specific edge cases (gas leak, flooding) demonstrate domain depth
- Lists concrete adaptation steps (not "I'll work with you on requirements")
- CTA asks WHERE to send Loom — assumes the yes

---

## Variant C — Long (~250 words, for $1k+ fixed projects)

> *Use when: JD is RFP-style, budget ≥ $1k, multiple stakeholders mentioned.*

```
{{first_name}},

Three things from your spec stood out:

1. "{{quote_1}}" — handled in my reference build via {{specific_solution}}.
2. "{{quote_2}}" — this is where most Vapi implementations fail; the fix is
   {{your_specific_technical_take, 1 sentence}}.
3. "{{quote_3}}" — agreed, and worth pricing separately if it's in scope.

Reference build (live, real backend, real tools):
→ https://dispatch-agent-seven.vercel.app/demo/hvac

It runs on Vapi (voice) + OpenRouter (LLM router for cost control across
GPT-4o-mini / Gemini Flash / Claude Haiku) + Next.js on Vercel. Total infra
cost: ~$30/mo at low volume. Webhook latency p95: under 400ms. 4 tools:
appointment lookup, booking, owner-escalation, price quoting — all with
input validation and graceful error handling.

Proposed approach for {{their_company}}:
- Week 1: requirements doc, prompt + tool design (I send for sign-off)
- Week 2: build + integrate with {{their_CRM/calendar/PMS}} via {{their_tool}} webhook
- Week 3: pilot 50 calls, tune prompt against actual transcripts, ship
- Post-launch: 30-day support, 2 prompt-tuning revisions included

Rate: ${{rate_high_end}}/hr or ${{fixed_quote}} fixed for the above scope.
Happy to do a 30-min call to walk through trade-offs (LLM choice, voice
provider, telephony) — no prep needed, I'll come with options.

When works for a 30-min call this week?

— {{your_name}}
P.S. Code review / architecture critique of your existing build also available
if you've already started.
```

**Why it works:**
- Numbered list shows you actually read 3 specific things
- Tech specifics (p95 latency, monthly cost) signal you've shipped to production
- Concrete week-by-week plan reduces their perceived risk
- Rate + fixed quote anchors the conversation away from "what do you charge?"
- P.S. opens a second door (architecture review = consulting hours)

---

## Copy-paste mini-templates (drop into Variant B)

Use these when the JD mentions...

### Industry: **Dental / Med Spa**
> "...for a dental practice the flow is: triage emergency (broken tooth, swelling), confirm insurance is in-network, check provider availability for that procedure, then book. I'd add an `insurance_verify` tool to the existing 4."

### Industry: **Real Estate**
> "...for real estate inbound, the 4 tools become: `qualify_buyer` (budget + timeline), `book_showing`, `request_callback_for_listing_agent`, and `send_listing_pdf`. Owner-escalation pattern stays — just routes to the listing agent instead."

### Industry: **Law Firm**
> "...for legal intake, the prompt has to be strict: NO legal advice, only intake. Tools: `screen_conflict_of_interest`, `book_consult`, `escalate_to_attorney`, `quote_consult_fee`. State-bar disclaimer baked into every reply."

### Stack: **Twilio (not Vapi)**
> "...same architecture works on Twilio Voice — swap the voice layer, keep the webhook + tools as-is. I've done both. Twilio is cheaper per minute but Vapi is faster to ship."

### Stack: **OpenAI Realtime API**
> "...Realtime API is great if you want sub-second latency and don't need the orchestration layer. Trade-off: you lose Vapi's built-in observability + retry. For most receptionist use cases Vapi wins; for high-end concierge / EQ-sensitive use cases Realtime wins."

### Pain: **"missed calls"**
> "...the math is: a missed call in HVAC/plumbing costs ~$300 average ticket. At even 20% missed call rate, this pays for itself in week 2."

### Pain: **"answering service is too expensive"**
> "...replacing a $400–$1500/mo answering service with this stack typically lands at $50–$150/mo (Vapi minutes + OpenRouter tokens + Vercel). I can break down the math for your call volume."

---

## Pricing anchors (don't underprice)

| Project type | Anchor in pitch |
|---|---|
| Single-vertical receptionist, no CRM integration | **$800–$1500 fixed** or **$60–$80/hr** |
| Multi-vertical / multi-language / IVR menu | **$2500–$5000 fixed** |
| Custom integration with PMS/CRM/calendar | **+ $1500–$3000 per integration** |
| Ongoing support + prompt tuning | **$50–$100/hr** with 5-hour monthly minimum |

> ⚠️ For your **first 3 hires** specifically, knock the fixed quote down ~25% to build reviews + portfolio. After 3 five-star reviews, return to full rates.

---

## What NEVER to put in a pitch

- ❌ "Hi, I came across your job posting" / "I read your job description"
- ❌ "I am highly skilled and experienced" / "passionate" / "delivering quality"
- ❌ Generic skill list ("Python, Node, React, AWS, Docker...")
- ❌ Asking questions you could answer by reading the JD
- ❌ Promising "AI revolution" / "transform your business"
- ❌ Quoting fixed prices for unclear scope (give a range or say "after a 30-min call")
- ❌ Attaching a giant PDF resume
- ❌ Apologizing for anything ("English is not my first language", "new to Upwork")

---

## After-pitch checklist

For every pitch sent, log:
- [ ] JD title + URL + budget
- [ ] Date sent
- [ ] Variant used (A/B/C)
- [ ] Did you customize ≥ 3 placeholders?
- [ ] Reply received? (Y/N, date)
- [ ] If reply: outcome (call booked / hired / ghosted)

After 15 pitches, look at the data:
- Reply rate <10% → the pitch needs more JD-specific customization
- Reply rate ≥10% but no hires → the call is the bottleneck (rehearse)
- Reply rate ≥10% AND hires < 30% of replies → pricing/scope mismatch

---

## Useful one-liners you can drop in anywhere

> "Real backend, not a no-code wrapper — every tool call hits a typed function with validation."

> "Webhook handler is open source if you want to review the architecture before hiring."

> "I've already filed the gotchas you'll hit on this stack — happy to share them on the call."

> "Built it in 2 days end-to-end, deployed on Vercel for ~$0 infra. Production-ready, not a prototype."

> "Live demo runs voice OR text against the same backend — clients without mic permission can still test."
