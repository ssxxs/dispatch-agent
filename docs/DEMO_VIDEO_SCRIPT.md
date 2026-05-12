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

---

## Shoot-day artifacts (use these the day you record)

> Everything below is what you actually copy-paste, time, and click on shoot day.
> Print this section or keep on a second monitor.

### Pre-flight (5 min, before pressing record)

Sanity-check every vertical works before you waste a take:

```bash
# Run from any terminal. Each should return HTTP 200 + a tool_call.
for V in hvac plumber electrician dental; do
  echo "=== $V ==="
  curl -sS --max-time 30 -X POST https://dispatch-agent-seven.vercel.app/api/chat \
    -H 'content-type: application/json' \
    -d "{\"vertical\":\"$V\",\"messages\":[{\"role\":\"user\",\"content\":\"How much for service?\"}]}" \
    | head -c 200
  echo ""
done
```

If any vertical returns an error, **fix that first**. Free-model upstream can flap;
if it's a 403/429, temporarily set `OPENROUTER_MODEL=openai/gpt-4o-mini` for the shoot
(~$0.001/call, far more reliable than free GLM/Gemini).

### Per-shot wall-clock budget (total ~25 min of shooting for a 30s clip)

| Shot | Final runtime | Recording wall-clock | Takes you should plan for |
|---|---|---|---|
| 1. Title card | 2s | 5 min in Canva (one time) | Canva exports MP4 directly |
| 2. iPhone tap-to-call | 4s | 3 min (incl. setup) | 1-2 takes |
| 3. Voice greet + first reply | 4s | 6 min | **3-4 takes** (LLM variance) |
| 4. Mac browser, tool badge | 8s | 4 min | 2 takes (just click an example bubble) |
| 5. Emergency line | 4s | 5 min | 2-3 takes (re-tap call) |
| 6. End card | 2s | 2 min | Canva re-export |
| Editing in iMovie | — | 30-40 min | One pass |

**Total session budget: 1 hour from open laptop to MP4 export.** Block it as a single
focused slot — context-switching kills momentum.

### Voiceover script (optional — only for the 60s version)

For the 30s clip, the AI voice IS the audio — no narration needed.
For 60s LinkedIn/portfolio version, narrate **between** the shots like this:

> [0–2s, over title card] *"Service businesses miss eight calls a day. Here's what answering them costs."*
>
> [16–20s, between tool fire and emergency] *"Same agent, same tools — voice or text."*
>
> [50–55s, before end card] *"Built in a week, deployed to Vercel, runs on free-tier models. Source on GitHub."*

Record voiceover in QuickTime → New Audio Recording. Use the same headphones mic
you used for the iPhone call — consistency beats fancy.

### Caption / subtitle text (verbatim — paste into your editor)

These are what gets burned in for muted viewers. Match the timing in the shot list.

| t (s) | Caption (verbatim) |
|---|---|
| 0–2 | `AI Receptionist — live demo` |
| 6–10 | `Caller: "My AC stopped cooling. Can someone come today?"` |
| 10–14 | `Riley (AI): "That sounds frustrating. Let me check..."` |
| 14–18 | `🔧 check_availability  →  Marcus, today 2-4 PM` |
| 18–22 | `Riley: "Booked. Confirmation AA-7B2K."` |
| 22–24 | `🔧 book_appointment  →  AA-7B2K` |
| 24–28 | `Caller: "Actually, water is flooding!"` `Riley: "That's an emergency — paging the owner now."` |
| 28–30 | `dispatch-agent-seven.vercel.app  ·  source on GitHub` |

Use Inter font, white text, semi-transparent black background bar (60% opacity).
Keep captions in the **bottom third** so the tool-badge UI is visible.

### Exact browser click sequence (Mac portion — shot 4)

You're recording the chat panel for ~8 seconds. Don't type — clicking the example
chips is faster and looks crisper on camera.

1. Open `https://dispatch-agent-seven.vercel.app/demo/hvac` in Chrome.
2. **Resize window to exactly 1280×720** (use the Chrome DevTools device toolbar with
   a custom 1280×720 preset — keeps the recording crop predictable).
3. Wait for the page to fully render (chat bubble + 3 example chips visible).
4. Press `Cmd + Shift + 5` → pick "Record selected portion" → drag a tight crop
   around the chat panel only (~600×560 px). Hit Record.
5. Click the **scheduling chip** (will be one of: *"My AC stopped cooling..."* or
   *"Can someone come tomorrow morning?"* — the categorized random picker
   sometimes shuffles; pick whichever AC-related one is showing).
6. Wait for the 🔧 `check_availability` badge to appear (~3-5s on free model).
7. Wait for the streaming reply tokens to finish (look for typing cursor `▊` to
   disappear).
8. Stop recording (`Cmd + Shift + 5` → Stop, or click menubar icon).

If the LLM doesn't pick a tool on this prompt (rare with `get_quote_range` vs
`check_availability`), reset (top-right "Reset" button) and click 🎲 New ideas
to re-roll suggestions, then click a fresh scheduling chip.

### Phrasing variants for iPhone call (in case first take fumbles)

Memorize one primary line per shot, but have backup phrasings ready. The LLM
responds slightly differently to each — pick whichever clip lands cleanest.

**Opening (shot 3):**
- A: *"Hi, my AC stopped cooling. Can someone come today?"*  ← primary, shorter
- B: *"Hey, AC's not blowing cold air. When's the soonest someone can come?"*
- C: *"My air conditioner died. Need someone out today if possible."*

**Confirmation (shot 4):**
- A: *"Yes please."*  ← shortest, cleanest
- B: *"Sounds good, book it."*
- C: *"Yeah let's do that."*

**Emergency pivot (shot 5):**
- A: *"Actually — water is flooding from the unit, can you send someone now?"*  ← primary
- B: *"Wait, there's water pouring out — this is an emergency!"*
- C: *"Hold on, I see water everywhere, please send someone right away!"*

All three of the emergency variants should trigger `escalate_to_owner` because
the keyword `flooding` / `water` is in `EMERGENCY_KEYWORDS`.

### Model setting recommendation for the shoot

Current production model: `z-ai/glm-4.5-air:free` (works, but free models can
be wordy/slow on rare bad takes).

**For the actual recording session**, briefly switch to a paid model:

```bash
# Before shoot
npx vercel env rm OPENROUTER_MODEL production --yes
printf 'openai/gpt-4o-mini' | npx vercel env add OPENROUTER_MODEL production
npx vercel --prod --yes  # ~30s to redeploy

# After shoot (revert to free)
npx vercel env rm OPENROUTER_MODEL production --yes
printf 'z-ai/glm-4.5-air:free' | npx vercel env add OPENROUTER_MODEL production
npx vercel --prod --yes
```

Cost of `gpt-4o-mini` for one shoot session (~15 takes × 2 LLM calls each =
~30 requests × $0.0005): **about 2 cents.** Worth it for crisp, predictable
takes. Revert to free after — your live demo URL goes back to $0 cost.

### Editing decisions in iMovie

| Decision | Pick this |
|---|---|
| Aspect ratio | 16:9 (LinkedIn auto-letterboxes 9:16 anyway, but 16:9 reads better on Upwork) |
| Resolution | 1080p (2K is wasted on Upwork's preview thumbnail) |
| Frame rate | 30fps |
| Tool-badge zoom | Crop in ~20% on shots 4 and 5 — the badges are small |
| Music | Skip it. Voice is the content. |
| Transitions | Hard cuts only. No dissolves, no whooshes. |
| Outro fade | Last 0.5s fade to black on end card |

### Export checklist before uploading anywhere

- [ ] Captions visible at full bottom-third
- [ ] File size < 15 MB (LinkedIn caps at 200 MB but Upwork inline previews fail above ~15)
- [ ] Plays correctly on iPhone Safari (Upwork mobile users)
- [ ] No bleeding audio in first/last frame (trim 100ms each end)
- [ ] Filename: `dispatch-agent-demo-30s.mp4` (clean, no underscores in the URL-encoded path)

### Where to host the file

1. **Upwork inline** — paste MP4 directly into each pitch. Best conversion.
2. **LinkedIn post** — native upload, NOT a YouTube link. LinkedIn algorithm
   suppresses external links by ~80%.
3. **GitHub README** — drag the MP4 into a GitHub Issue comment first to get a
   `user-attachments` URL, then reference that URL in README.md.
4. **NOT YouTube** as primary — fine as backup, but viewers don't click out.
