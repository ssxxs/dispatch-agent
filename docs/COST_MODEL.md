# Cost Model

> All prices verified May 2026. Update when providers change pricing.

## Today (this session)

| Item | Cost |
|---|---|
| Project scaffold | $0 |
| Account registrations | $0 |
| **Total** | **$0** |

## Phase 1 MVP development (10h)

| Item | Cost | Notes |
|---|---|---|
| Vapi minutes (dev testing) | $0 | $10 free credit covers ~150 min |
| OpenRouter LLM (dev) | $0 | Use free models |
| Vercel | $0 | Hobby tier |
| Supabase | $0 | Free tier |
| **Phase 1 total** | **$0** | |

## Public Demo deployment (post-MVP, monthly recurring)

Assuming **30 real demo calls / month** to your Vapi Web SDK page:

| Item | Cost | Calc |
|---|---|---|
| Vapi orchestration | $4.50 | 30 × 3min × $0.05 |
| LLM (paid: gpt-4o-mini) | $0.18 | 30 × 1k in + 500 out × $0.15/$0.60 per MTok |
| Vercel | $0 | Hobby tier sufficient |
| Supabase | $0 | Free tier sufficient |
| **Monthly recurring** | **~$5** | |

Worst-case (200 calls / month, traffic bursts):
- Vapi: $30
- LLM: $1.20
- **Total: ~$31** → still within Vapi $50 spend cap

## Per-call breakdown (typical)

```
3-minute HVAC booking call:
  STT (Vapi inclusive)       : —
  TTS (Vapi inclusive)        : —
  Vapi orchestration: 3 × $0.05    = $0.150
  LLM tokens (paid gpt-4o-mini):
    ~2k input + 1k output      ≈ $0.001
  Per-call total:              ≈ $0.15
```

Compare:
- ServiceTitan AI: $300+/mo flat
- Housecall Pro AI: $79-279/mo flat
- **Our model: $5-30/mo variable (only pay for actual demos)**

## Upwork bidding costs (one-time + variable)

| Item | Cost |
|---|---|
| Account creation | $0 |
| Identity verification | $0 |
| Connects (initial 60) | $10 |
| Per-bid cost | ~$0.60-1.50 (4-10 connects × $0.15) |
| Platform commission | 0-15% of earnings, only after invoice |

**Budget for first 5 bids**: $10 (covers Connects + buffer)

## When to upgrade from free LLM models

Switch from free OpenRouter to paid when:
- Demo is public-facing AND
- More than 1 demo call per day expected AND
- You see rate-limit errors in Vapi logs

**Recommended upgrade path**:
1. `google/gemini-2.0-flash-exp:free` → `google/gemini-2.0-flash` ($0.075/$0.30 per MTok)
2. → `openai/gpt-4o-mini` ($0.15/$0.60 per MTok, more reliable tool calling)
3. → `anthropic/claude-haiku-4.5` ($1/$5 per MTok, best for nuanced calls)

## Hard spend caps (set today in Vapi Dashboard)

- Daily: **$2** (catches misconfig early)
- Monthly: **$20** (graceful pause if Demo blows up)
- Per-call max duration: **6 minutes** (prevents stuck calls)

## ROI break-even

Single $800 Upwork project (low end) = **53 months of demo running cost**.
Single $2500 project (mid) = **166 months**.
You'd basically never lose money on running the demo.

Real risk is **time** (35-50h side-project investment), not cash.
