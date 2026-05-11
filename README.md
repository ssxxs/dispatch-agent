# Dispatch Agent

**24/7 AI Voice Receptionist for service businesses** — HVAC, dental, beauty, legal intake, moving. Same architecture, multiple verticals. Misses no call, books appointments, escalates emergencies.

## Quick Status

- **Phase**: MVP (Phase 1 / 6) — HVAC single vertical, browser-based call
- **Stack**: Next.js 16 + Vapi (Voice) + OpenRouter (LLM) + Supabase (DB)
- **Cost target**: < $0.05 per demo call

## Get Started

```bash
npm install
cp .env.example .env.local  # fill in keys
npm run dev
```

Open http://localhost:3000 → click "Try the HVAC Receptionist" → browser asks for mic → AI picks up.

## Docs

- [`SPEC.md`](./SPEC.md) — Product spec v2 (Voice Receptionist)
- [`progress.md`](./progress.md) — Cross-session progress tracker
- [`docs/ACCOUNT_SETUP.md`](./docs/ACCOUNT_SETUP.md) — Registration runbook (Vapi, OpenRouter, Vercel, Supabase, Upwork)
- [`docs/COST_MODEL.md`](./docs/COST_MODEL.md) — Full cost breakdown

## License

Private project — Upwork portfolio piece.

