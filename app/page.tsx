import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Subtle radial-grid background for hero */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px] bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.08),_transparent_60%)]"
      />

      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="mb-20">
          <div className="mb-4 inline-flex items-center gap-2 text-sm uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            <span className="relative inline-flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Dispatch Agent · Live Demo
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6">
            Your AI receptionist
            <br />
            <span className="text-zinc-400 dark:text-zinc-600">never misses a call.</span>
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-10 max-w-2xl leading-relaxed">
            Service businesses miss <strong>3-8 calls every day</strong>. That&apos;s{' '}
            <strong>$10K+/month</strong> walking to your competitors. We answer for you, 24/7,
            industry-aware, books straight into your calendar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/demo/hvac"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-lg shadow-emerald-500/20 transition-all hover:shadow-xl hover:shadow-emerald-500/30"
            >
              📞 Try the HVAC demo
            </Link>
            <a
              href="https://github.com/ssxxs/dispatch-agent"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            >
              View source on GitHub
            </a>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 mb-20">
          <Stat label="of voicemail callers don't leave a message" value="80%" />
          <Stat label="avg missed-call cost per day for service SMBs" value="$360" />
          <Stat label="cost per AI call vs $3K human receptionist" value="$0.15" />
        </div>

        {/* How it works in 30 seconds */}
        <div className="mb-20">
          <h2 className="text-2xl font-semibold mb-2">How it works in 30 seconds.</h2>
          <p className="mb-8 text-sm text-zinc-500">
            One agentic loop, four tools, zero black-box magic. Click any demo below to watch it
            happen live in the chat.
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            <Step
              n="1"
              title="Caller describes the issue"
              body="Voice or text. The agent listens, asks the right follow-ups for that industry, and decides intent: emergency, quote, or booking."
            />
            <Step
              n="2"
              title="AI calls real backend tools"
              body="Typed function calls fire against an in-memory roster + business rules. You see every call as a live badge — no hallucinated slots."
            />
            <Step
              n="3"
              title="Books, quotes, or escalates"
              body="Real emergency? Owner gets paged before the caller finishes. Routine? Slot booked with a confirmation ID. Out of scope? Polite handoff."
            />
          </div>
        </div>

        <div className="mb-20">
          <h2 className="text-2xl font-semibold mb-2">Same architecture. Four industries live.</h2>
          <p className="mb-6 text-sm text-zinc-500">
            Each vertical = ~45 minutes of focused work via the shared factory. Tap any card to
            try it now.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {VERTICALS.map((v) =>
              v.live ? (
                <Link
                  key={v.label}
                  href={v.href}
                  className="rounded-xl border border-emerald-500 dark:border-emerald-400 bg-emerald-50 dark:bg-emerald-950 p-4 text-center hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors"
                >
                  <div className="font-medium mb-1">{v.label}</div>
                  <div className="text-xs text-emerald-700 dark:text-emerald-300">✅ {v.mode}</div>
                </Link>
              ) : (
                <div
                  key={v.label}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 text-center opacity-60"
                >
                  <div className="font-medium mb-1">{v.label}</div>
                  <div className="text-xs text-zinc-500">Roadmap</div>
                </div>
              )
            )}
          </div>
        </div>

        {/* Tech trust row */}
        <div className="mb-12">
          <p className="mb-4 text-xs uppercase tracking-widest text-zinc-500">
            Built on production-grade stack
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-zinc-600 dark:text-zinc-400">
            <TechBadge label="Next.js 16" sub="Edge runtime" />
            <TechBadge label="TypeScript" sub="strict mode" />
            <TechBadge label="Vapi.ai" sub="voice + STT + TTS" />
            <TechBadge label="OpenRouter" sub="LLM router" />
            <TechBadge label="Vercel" sub="SSE streaming" />
            <TechBadge label="Tailwind v4" sub="design system" />
          </div>
        </div>

        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-8 text-sm text-zinc-500">
          Built with Next.js 16, Vapi, and OpenRouter.{' '}
          <a
            href="https://github.com/ssxxs/dispatch-agent"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            Open source on GitHub.
          </a>
        </div>
      </div>
    </main>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
      <div className="mb-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
        {n}
      </div>
      <div className="mb-1 font-medium text-zinc-900 dark:text-zinc-100">{title}</div>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{body}</p>
    </div>
  );
}

function TechBadge({ label, sub }: { label: string; sub: string }) {
  return (
    <span className="inline-flex flex-col">
      <span className="font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
      <span className="text-xs text-zinc-500">{sub}</span>
    </span>
  );
}

const VERTICALS = [
  { label: '🔥 HVAC', href: '/demo/hvac', live: true, mode: 'Voice + text' },
  { label: '🚰 Plumbing', href: '/demo/plumber', live: true, mode: 'Text only' },
  { label: '⚡ Electrical', href: '/demo/electrician', live: true, mode: 'Text only' },
  { label: '🦷 Dental', href: '/demo/dental', live: true, mode: 'Text only' },
  { label: 'Legal Intake', href: '#', live: false, mode: '' },
];

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
      <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">{value}</div>
      <div className="text-sm text-zinc-600 dark:text-zinc-400">{label}</div>
    </div>
  );
}
