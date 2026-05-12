# Demo Video Script — Dispatch Agent (HVAC Receptionist)

> Goal: a 30-second silent-friendly clip you paste into every Upwork pitch.
> Optional 60s version for LinkedIn / portfolio site.
> All shots can be screen-recorded on Mac + iPhone in under 30 minutes total.

---

## Why a 30s clip beats text

Upwork clients skim. A short looping video that *shows* the AI taking a real
call, calling a tool, returning a confirmation — converts a 10x better than a
README with words like "agentic" and "function calling".

What the video must prove in 30 seconds:
1. **It's voice, not chatbot** — caller talks naturally, AI replies with audible voice.
2. **It runs real tools** — viewer sees structured tool output flash on screen (slot booked, quote returned, owner paged).
3. **It handles emergencies correctly** — flooding/gas-smell triggers escalation, not booking.

---

## 30-second version (the primary asset)

### Shot list

| t (s) | Shot | Audio | On-screen overlay |
|---|---|---|---|
| 0–2 | Title card. Black bg. Logo + tagline. | Silence (or 1 ringtone "brrring") | **AustinAir HVAC — AI Receptionist Demo** |
| 2–6 | iPhone screen recording: open `dispatch-agent-seven.vercel.app/demo/hvac`, tap "Start Call". | (mic activates, brief hum) | *"Live, real call — no edits"* |
| 6–10 | Caller (you) speaks. Riley greets. | **You:** "Hi, my AC stopped cooling. Can someone come today?"<br>**Riley:** "That sounds frustrating, let me check…" | Caption (auto-subtitles) |
| 10–18 | Cut to screen recording of demo page in browser. **🔧 check_availability** tool badge appears with result panel showing `slot_id`, `technician_name`, `window_start`. Riley reads it back. | **Riley:** "I have Marcus available today 2 to 4 PM. Should I book it?" | **🔧 check_availability → slot booked** (highlight) |
| 18–24 | Cut back to phone. **You:** "Yes please." Riley confirms. **🔧 book_appointment** tool flashes. Confirmation number appears. | **Riley:** "Booked. Confirmation AA-7B2K. You'll get a text shortly." | **🔧 book_appointment → AA-7B2K** |
| 24–28 | Quick fade. **You:** "Actually, water is flooding from the unit, can you get someone now?" Cut to screen — **🔧 escalate_to_owner** badge appears. | **Riley:** "That's an emergency. I'm paging the owner — he'll call you in 5 minutes." | **🔧 escalate_to_owner — emergency triage** |
| 28–30 | End card. URL + CTA. | (1 short outro chime) | **dispatch-agent-seven.vercel.app**<br>*"Built in 2 days. Replaces $400/mo answering services."* |

### Total dialogue (memorize this)

> **You (caller):** "Hi, my AC stopped cooling. Can someone come today?"
> **Riley (AI):** "That sounds frustrating. Let me check… I have Marcus available today, two to four PM. Should I book it?"
> **You:** "Yes please."
> **Riley:** "Booked. Your confirmation is AA-seven-B-two-K. You'll get a text in a moment."
> **You:** "Actually — water is flooding from the unit, can you send someone now?"
> **Riley:** "That's an emergency — I'm paging the owner now. He'll call you in five minutes."

> Time it: should fit in ~22 seconds of speech. Buffer 8s for visuals/captions.

---

## 60-second version (LinkedIn / portfolio)

Same opening but add **two extra beats** between booking and emergency:

- **Quote tool demo** (~6s): "How much would the repair cost?" → Riley: "Roughly $150–$600, technician confirms onsite." Show **🔧 get_quote_range** badge.
- **Text-mode fallback** (~5s): cut to laptop screen, viewer types "Schedule a maintenance tuneup next week", Riley replies in text, tool badge expands. Caption: *"Same brain — voice or text"*.

End card 1 extra second longer with tech stack:
> Built with Next.js • Vapi • OpenRouter • Vercel · 2 days · $0 infra cost

---

## Production checklist (do once, in this order)

### Before you start recording
- [ ] **iPhone**: charge to >50%, brightness max, do-not-disturb on, **lock orientation portrait**.
- [ ] **Headphones in** — kills echo from phone speaker bouncing into the mic.
- [ ] Open `https://dispatch-agent-seven.vercel.app/demo/hvac` in **Safari** (not WeChat/in-app browser).
- [ ] **Mac**: open the same URL in Chrome at 1280×720 viewport for the screen-recording shots.
- [ ] **Quiet room** — fan/AC OFF, close door, no background music.
- [ ] **One full dry-run call** to make sure tools fire as expected (mock data is deterministic, so they will).

### Recording the 6 clips
1. **Title card** (2s): Make in Canva, ~5 min. Use Inter font, black bg, white text. Save as MP4 or PNG-stack.
2. **iPhone tap-to-call** (4s): Use iOS Screen Recording (Control Center → record button). Tap into Safari URL → tap "Start Call".
3. **Voice + AI reply** (8s): Two takes. The AI's response timing isn't 100% predictable; pick the smoothest take.
4. **Mac browser, tool badges flashing** (8s): On Mac, run `Cmd+Shift+5` → record selected portion (just the chat panel). Click the example bubbles instead of typing — faster.
5. **Emergency** (4s): Restart call from iPhone. Say the flooding line. Capture the 🔧 escalate_to_owner badge in browser.
6. **End card** (2s): Same Canva template, swap content.

### Editing
- iMovie or DaVinci Resolve (both free).
- **Add captions** — most LinkedIn / Upwork views are muted. Use Otter.ai or YouTube auto-caption then export.
- Background music: keep it under -25 dB or omit. Voice clarity > vibe.
- Export 1080p MP4, ~10 MB, ≤30s. **Don't put it on YouTube** — Upwork people don't click out. Upload directly to Upwork or to your portfolio site.

---

## Things that will go wrong (and the fix)

| Problem | Fix |
|---|---|
| Riley says weird/wrong things | Re-record. The free Gemini model is non-deterministic. Pick the cleanest take. Or temporarily set `OPENROUTER_MODEL=openai/gpt-4o-mini` on Vercel for the recording session — far more reliable for ~$0.01/call. |
| Tool badges don't appear in voice mode | They're text-mode only. For voice mode, screen-record **the live transcript pane** instead, plus a separate close-up of the text-chat tool badges to splice in as B-roll. |
| Tool fires but Riley narrates wrong slot | Free Gemini sometimes hallucinates. Cut to the tool result panel (which is correct) and let the *visuals* tell the truth, voice as flavor. |
| Echo / feedback in iPhone recording | Headphones, always. AirPods work. No headphones → record on Mac with USB mic and Vapi running in Chrome. |
| GFW blocks `vercel.app` for you while recording | Toggle to mobile data (4G), or VPN. End viewers in the US/EU don't have this issue. |

---

## Files to use as B-roll (already in repo)

- `app/api/vapi-webhook/route.ts` — show the webhook handler code for ~2s ("real backend, not a no-code toy")
- `lib/verticals/hvac/tools.ts` — show the 4 tool definitions for ~2s
- Vercel deploy log screenshot — proves it's actually live

---

## What NOT to put in the video

- ❌ Yourself on camera (skip the "founder face" shot — clients don't care)
- ❌ "I built this" voiceover (let the demo speak)
- ❌ Code walkthroughs longer than 2 seconds (Upwork client doesn't read)
- ❌ Animated explainer ("WHAT IS AN AGENT?") — pure waste
- ❌ Generic stock music
- ❌ Watermarks, intro stings, loader animations longer than 0.5s

If a shot doesn't make a stranger think "I want this for my business" within 2 seconds, cut it.
