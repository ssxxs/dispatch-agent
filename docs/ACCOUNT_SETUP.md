# Account Setup Runbook (China mainland, Visa)

> Last reviewed: 2026-05-11. Verified for China mainland users with international Visa card.

## Priority order

| Step | Service | Cost today | Required for | Risk |
|---|---|---|---|---|
| 1 | OpenRouter (have) | $0 | LLM | ✅ user has account |
| 2 | **Vapi** | $0 ($10 free credit) | Voice | 🟡 medium |
| 3 | Vercel | $0 | Deploy | 🟢 easy |
| 4 | Supabase | $0 | DB (Phase 2+) | 🟢 easy |
| 5 | Upwork | $0 (Connects later $10) | Marketing | 🟡 ID review 3-7 days |
| ~~6~~ | ~~Twilio~~ | — | **Skipped** for MVP | (Phase 2+) |

## Step 1 — OpenRouter (user already has)

**Verify your existing key works**:

```bash
curl https://openrouter.ai/api/v1/chat/completions \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "google/gemini-2.0-flash-exp:free",
    "messages": [{"role":"user","content":"Reply with: ok"}],
    "max_tokens": 5
  }'
```

Expected: `{"choices":[{"message":{"content":"ok"...`

If 401: regenerate key at https://openrouter.ai/keys
If 429: free model rate-limited; try `meta-llama/llama-3.3-70b-instruct:free` instead

## Step 2 — Vapi 🔴 **Do this today**

1. Go to https://vapi.ai → "Sign Up" → Google or GitHub OAuth (no card required)
2. Verify $10 free credit visible in Dashboard top-right
3. **Settings → API Keys**:
   - Copy **Public Key** → save as `NEXT_PUBLIC_VAPI_PUBLIC_KEY` in `.env.local`
   - Copy **Private Key** → save as `VAPI_PRIVATE_KEY`
4. **Settings → Provider Keys** → Add OpenRouter:
   - Provider: `openrouter`
   - API Key: paste your OpenRouter key
   - Click "Validate" — should turn green
5. **Spend Controls**: set daily limit $2, monthly limit $20 (prevents runaway cost)
6. **Test the pipeline**:
   - Create assistant manually OR import `voice/vapi-config/hvac-assistant.json` (provided in this repo)
   - Model: `openrouter / google/gemini-2.0-flash-exp:free`
   - Voice: `eleven-labs / multilingual-v2` (default ok)
   - Click "Talk to Assistant" in browser — should hear AI greet you
   - Save the assistant UUID → `NEXT_PUBLIC_VAPI_HVAC_ASSISTANT_ID`

**Common errors**:
- "Provider key invalid": OpenRouter key wrong, regenerate
- "Model not found": Vapi caches model list; refresh Dashboard
- "Failed to start call": browser blocked microphone, grant permission

## Step 3 — Vercel (whenever)

1. https://vercel.com → "Continue with GitHub"
2. Import `ssxxs/dispatch-agent` repo (after first push)
3. Auto-detected as Next.js — accept defaults
4. Add env vars from `.env.local` to Project Settings → Environment Variables
5. Deploy

Free Hobby tier: 100GB bandwidth, unlimited static deploys, serverless invocations included.

## Step 4 — Supabase (Phase 2+, can skip for MVP)

1. https://supabase.com → "Start your project" → GitHub OAuth
2. New Project → region: `Northeast Asia (Tokyo)` (lowest latency from China)
3. Name: `dispatch-agent`, db password: generate strong
4. Wait ~2 min for provisioning
5. SQL Editor → run `create extension if not exists vector;`
6. Settings → API:
   - Copy `URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - Copy `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy `service_role` (server-only!) → `SUPABASE_SERVICE_ROLE_KEY`

Free tier: 500MB DB + 1GB storage + 50K MAU. Enough for years of Demo traffic.

## Step 5 — Upwork (async, 3-7 days)

⚠️ **Do NOT use VPN during registration** — Upwork flags geographic mismatch.

1. https://upwork.com → "Apply as a freelancer"
2. Email: use Gmail/Outlook (not QQ/163)
3. Location: **China, real city** — be honest
4. Title: "AI Voice Agent Developer | Vapi + OpenRouter + n8n"
5. Categories: "AI & Machine Learning" → "AI Agent Development", "AI Automation"
6. Hourly rate: start at $35-50/h (raise after first contract)
7. Upload government ID (passport preferred over national ID — easier review)
8. Video face match (clear lighting, no filter)
9. **Wait 3-7 days for review**

After approval:
10. Add payment method (Payoneer recommended, works with China bank)
11. Buy 60 Connects ($10) when ready to bid

## What if Vapi fails / I get stuck?

**Tell Cascade immediately**. Plan B options:

- **Plan B1**: LiveKit + OpenAI Realtime (more setup, lower per-call cost)
- **Plan B2**: Bland.ai (China-friendlier, less customization)
- **Plan B3**: Custom WebRTC + browser-only (no PSTN, demo only)

Don't try to brute-force a blocked service for hours. Pivot fast.
