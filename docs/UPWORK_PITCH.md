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

---

## Ready-to-paste pitches by scenario (5 filled-in templates)

> The variants A/B/C above are scaffolding. Below are five **fully-flesh­ed-out
> pitches** for the most common JD shapes you'll see this month — placeholders
> already filled with realistic content you can edit lightly per JD. Each pitch
> has **4 opener variants** to A/B test, plus a **3-day follow-up message** for
> when the first one is ghosted.
>
> Replace `[brackets]` with JD-specific details. Curly braces are gone.

---

### Pitch 1 — Small HVAC contractor (1-2 trucks, JD ≤ $300)

**Scenario:** "Looking for someone to set up an AI to answer my phone after hours
so I stop losing weekend calls. Budget around $200."

**Primary pitch (Variant A, ~70 words):**

```
Hey [first name] —

I built a working HVAC AI receptionist last week. It answers, asks the
right questions, books the slot, and pages you for emergencies (gas
leaks, flooding). Try it now — voice OR text:

https://dispatch-agent-seven.vercel.app/demo/hvac

Sample lines that work: "AC stopped cooling, what's available?" or
"Water flooding from my unit!" — watch the tool calls fire live.

Adapting to your business: ~3-4 hours (your service area, prices,
techs). Can I send you a 5-min Loom showing exactly what changes?

— [your name]
```

**Opener variants (replace line 1):**

- **Industry hook:** *"You're losing $300+ per missed weekend call — here's the cheapest fix."*
- **Demo-first:** *"Skip the pitch, here's a working HVAC AI taking real calls: [demo URL]."*
- **Empathy:** *"After-hours calls killing your weekends? I built this for exactly that."*
- **Math hook:** *"Math says answering one extra emergency call/week pays for this in 3 days."*

**3-day follow-up if no reply:**

```
Quick follow-up — did the demo link work for you? Mobile Safari
sometimes blocks Vapi's mic permission. If voice didn't fire,
the text version of the demo runs the same backend tools.

If timing is off this month, no worries. If you want, I can hold
a 15-min slot Friday and walk through what an adapter for your
business would look like — no commitment.

— [your name]
```

---

### Pitch 2 — Multi-location plumbing company (5-10 trucks, JD names Vapi/Bland)

**Scenario:** "We use Vapi already but our current build hallucinates appointment
times and confuses customers. Need someone who actually understands function
calling. $1000-2000 budget."

**Primary pitch (Variant B, ~160 words):**

```
Hi [first name],

Your line about the AI "confusing customers with hallucinated
appointment times" — that's a function-calling failure, not a Vapi
problem. Most Vapi builds skip the strict tool schema and let the
LLM invent slot IDs. The fix is making `check_availability` return
a typed object the LLM has to repeat verbatim, not paraphrase.

Live reference build doing it right:
→ https://dispatch-agent-seven.vercel.app/demo/plumber

Click "How fast can someone get out for a tree-root blockage?" —
watch the tool fire, return a real slot from the roster, and the
AI read it back without invention.

For your scope:
- Audit your current Vapi assistant + transcript review (1-2 hrs)
- Refactor tools to strict-typed schemas with validated returns
- Add observability so you catch hallucinations before customers do
- Document the prompt + tool contract for your team

Rate $75/hr or $1200 fixed for the above. Where should I send a
3-min Loom auditing one of your recent transcripts?

— [your name]
```

**Opener variants:**

- **Diagnostic:** *"Hallucinated appointment times = tool-call schema is too loose. 3-min Loom audit?"*
- **Authority:** *"I've debugged this exact failure on 3 Vapi builds. The fix is upstream of the LLM."*
- **Curiosity gap:** *"Your current AI is probably failing in one specific way. Here's how to tell:"*
- **Reference build:** *"Plumber demo at [URL] never hallucinates slots — same Vapi, different tool design."*

**3-day follow-up:**

```
Following up — even if I'm not the right fit, the failure pattern
I described is fixable in ~2 hours by whoever you hire. Two things
to check on your current assistant:

1. Is `check_availability` returning a structured object or a string?
2. Does the system prompt say "read back the slot_id verbatim" or
   is it free-form?

Happy to be a no-strings second opinion if you want a 15-min call.

— [your name]
```

---

### Pitch 3 — Dental practice / single dentist ($300-800)

**Scenario:** "Front desk overwhelmed. We need an AI that can book cleanings,
handle the basic insurance questions, and route emergencies to me when I'm out.
$500."

**Primary pitch (Variant B, ~170 words):**

```
Hi Dr. [last name],

Front-desk overwhelm in a single-doc dental office is almost always
the same 3 calls: routine cleanings, insurance "do you take X",
and the after-hours emergency. I built a dental receptionist that
handles all three — try it:

→ https://dispatch-agent-seven.vercel.app/demo/dental

Click "My kid knocked his tooth out at soccer practice!" — watch
it triage as emergency, page you immediately, AND give the parent
the milk-storage first aid (which buys you 30 minutes to call back).

It also knows what NOT to do, which matters in dental:
- Won't ask for SSN or PHI on the cold call (HIPAA)
- Won't quote exact treatment cost (you confirm post-exam)
- Won't give clinical advice beyond OTC ibuprofen guidance
- Defers insurance verification to in-person (the only sane policy)

For your practice, I'd swap the mock dentists for your actual roster
+ procedure codes, calibrate the emergency keywords for your patient
base, and connect to your PMS (Dentrix? OpenDental?) for real-time
slot availability. ~4-6 hours total. $500 sounds right for the scope.

Open to a 20-min call this week?

— [your name]
```

**Opener variants:**

- **Specific scenario:** *"Knocked-out tooth at 7pm Saturday — your AI receptionist should do exactly this:"*
- **HIPAA hook:** *"Most dental AI demos break HIPAA on call 1. Here's one that doesn't."*
- **PMS-aware:** *"Does it need to plug into Dentrix/OpenDental? I've thought about that integration."*
- **Math:** *"Front desk overwhelm = 2-3 missed booking calls a day = ~$10k/year walking away."*

**3-day follow-up:**

```
Following up — one thing I forgot to mention: dental emergency
triage is the highest-stakes piece because the wrong answer can
cost a tooth. The demo I sent uses the standard avulsed-tooth
protocol (handle by crown, store in milk, get in within 30 min)
which most generic AI receptionists get wrong.

If you'd rather just see how I'd handle YOUR top 5 call types,
send me the categories and I'll loom through them. ~10 min on
your end to send the list.

— [your name]
```

---

### Pitch 4 — Electrical contractor ($500-1500, emergency-dispatch flavor)

**Scenario:** "Need an AI to handle emergency dispatch + give ballpark quotes.
Customer asks if a sparking outlet is dangerous, AI needs to say YES and route
to on-call. $800-1200."

**Primary pitch (Variant B, ~150 words):**

```
Hi [first name],

Two things that separate a useful electrical AI from a dangerous one:
the AI must NEVER give DIY repair advice on energized equipment, and
it must triage sparking / burning-smell / panel-fire as emergencies
in under 2 sentences.

Demo doing both:
→ https://dispatch-agent-seven.vercel.app/demo/electrician

Try the chip "My outlet is sparking and I smell burning plastic!" —
the AI pages the owner BEFORE asking for the name. Then it tells the
caller to leave the breaker tripped and stay clear. No "have you tried
resetting it?" nonsense.

For ballpark quotes, it uses a typed `get_quote_range` tool with your
real pricing matrix (panel upgrades, EV chargers, sub-panels, etc.) —
caveat baked in: "approximate, electrician confirms onsite". No
hallucinated $399 panel upgrades.

For your business: swap the mock electricians for your real roster,
calibrate emergency keywords for your insurance preferences, and
plug into your dispatch tool. $800-1000 fixed for the prompt + tool
adaptation; integration is +$500 depending on your dispatch software.

Where should I send a Loom adapting this for [their company name]?

— [your name]
```

**Opener variants:**

- **Safety hook:** *"AI receptionists giving DIY electrical advice = insurance nightmare. Here's one that doesn't."*
- **Spec-driven:** *"Sparking outlet → page owner before name = correct. Your current AI doing that?"*
- **Quote precision:** *"Ballpark electrical quotes without hallucinating prices is a tool-design problem. Solved."*
- **Compliance:** *"Liability-aware electrical AI: no DIY advice, always defer to licensed onsite."*

**3-day follow-up:**

```
Following up — one risk to flag with whoever you hire (me or
otherwise): make sure they understand the AI must NEVER suggest
"try flipping the breaker" for a sparking outlet. That's
training-data default behavior and costs houses every year.

The demo I sent has those phrases explicitly blocked in the
system prompt. Happy to share the prompt verbatim if you want
to vet your own implementation.

— [your name]
```

---

### Pitch 5 — Generic "AI voice agent developer" RFP ($1500+, multi-stakeholder)

**Scenario:** "Looking for a senior developer to build an AI voice receptionist
for our service business. Must handle calls, book appointments, integrate with
[CRM]. Fixed $2500."

**Primary pitch (Variant C, ~240 words):**

```
[first name],

Three things from your spec stood out:

1. "Handle calls AND book appointments" — solved this with a
   4-tool pattern: check_availability, book_appointment,
   escalate_to_owner, get_quote_range. Strict-typed schemas so
   the LLM can't hallucinate slot IDs (which is where 80% of
   competitor builds fail).
2. "Integrate with [their CRM]" — most CRMs ship a webhook
   or REST API; the integration sits between book_appointment
   and the actual calendar write. ~4-6 hours depending on
   their auth model.
3. "Service business, fixed $2500" — fair scope for one
   vertical, voice + text fallback, one integration, deployed
   to your infra with handoff docs.

Reference build (live, real backend, 4 verticals):
→ https://dispatch-agent-seven.vercel.app

The HVAC vertical has voice mode (Vapi). All four verticals
share the same factory pattern — that's how I'd ship yours in
under 2 weeks.

Stack: Vapi (voice) + OpenRouter (LLM router for cost control
across gpt-4o-mini / GLM / Claude Haiku) + Next.js + Vercel.
Total infra cost at 1000 calls/mo: ~$30. Source on GitHub if
you want to architect-review before hire.

Proposed timeline for [their company]:
- Week 1: prompt + tool design doc (you sign off before build)
- Week 2: build + integrate with [their CRM] via their webhook/API
- Week 3: pilot 50 real calls, tune prompt, ship
- Post-launch: 30-day support, 2 prompt revisions included

$2500 fixed works for that scope. When works for a 30-min
discovery call this week — Tue or Thu both open.

— [your name]
P.S. If you've already started a build, I do architecture
reviews for $200 flat — useful sanity check before committing
to one approach.
```

**Opener variants:**

- **Spec-driven:** *"Read your spec — 3 specific decisions to make before write a single line of code. Quick call?"*
- **Reference-first:** *"Working reference build at [URL] — let me know if it answers your spec faster than reading my pitch."*
- **Process focus:** *"My process for these: spec sign-off in week 1, build in week 2, pilot in week 3. Open to your timeline?"*
- **Risk-reducer:** *"Service-business AI receptionist + CRM integration: 3 places this typically fails. Avoidable with the right prompt + tool contract."*

**3-day follow-up:**

```
Following up — wanted to flag one decision point that's worth
making before hiring anyone, regardless of who you go with:

LLM provider lock-in. If you build directly against OpenAI
Realtime API, switching providers later is a full rebuild.
If you build on Vapi or VoiceFlow with OpenRouter, you can
A/B test models without changing code. For service-business
volume, the latter saves ~40% on LLM cost in year 1.

Happy to walk through the trade-offs in 15 min if useful —
no commitment.

— [your name]
```

---

### Tracking sheet — first 10 pitches

Copy this into a Google Sheet or Notion:

| # | Date | JD URL | Industry | Variant | Pitch number used (1-5) | Customized lines | Reply? | Outcome |
|---|---|---|---|---|---|---|---|---|
| 1 |  |  |  |  |  |  |  |  |
| 2 |  |  |  |  |  |  |  |  |
| ... |  |  |  |  |  |  |  |  |

After 10 pitches, expect:
- **<1 reply** → your customization is too thin (you're sending templates)
- **1-2 replies** → on target; keep volume
- **3+ replies** → consider raising rates or being more selective

### Where to find JDs faster

Sorted by signal-to-noise:

1. **Upwork search saved filters** — "AI voice agent" + "Vapi" + "Posted last 24h" + "Budget > $300"
2. **Upwork RSS feeds** — subscribe to the search; get notified before the JD has 50 proposals
3. **r/Upwork** — `vapi` posts in last week (sometimes contractors mention specific JDs to avoid)
4. **Twitter/X** — search "hiring vapi developer" filter:replies — clients sometimes post first there
5. **AI voice agent Discords** — Vapi has one; Retell has one; clients post hires there before Upwork

Do NOT pitch on Fiverr — race-to-bottom pricing kills your anchor for Upwork later.
