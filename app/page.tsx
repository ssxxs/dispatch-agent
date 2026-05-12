import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="mb-20">
          <p className="text-sm uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-4">
            Dispatch Agent · Live Demo
          </p>
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
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors"
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

        <div className="mb-20">
          <h2 className="text-2xl font-semibold mb-6">Same architecture. Five industries.</h2>
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

        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-8 text-sm text-zinc-500">
          Built with Next.js 16, Vapi, and OpenRouter. Open source.
        </div>
      </div>
    </main>
  );
}

const VERTICALS = [
  { label: '🔥 HVAC', href: '/demo/hvac', live: true, mode: 'Voice + text' },
  { label: '🚰 Plumbing', href: '/demo/plumber', live: true, mode: 'Text only' },
  { label: '⚡ Electrical', href: '/demo/electrician', live: true, mode: 'Text only' },
  { label: 'Dental', href: '#', live: false, mode: '' },
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
