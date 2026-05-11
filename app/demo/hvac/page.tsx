'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CallButton } from '@/components/CallButton';
import { TranscriptStream } from '@/components/TranscriptStream';
import type { TranscriptEntry } from '@/lib/types';

export default function HvacDemoPage() {
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);

  const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY ?? '';
  const assistantId = process.env.NEXT_PUBLIC_VAPI_HVAC_ASSISTANT_ID ?? '';
  const configMissing = !publicKey || !assistantId;

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link
          href="/"
          className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 mb-8 inline-block"
        >
          ← Back
        </Link>

        <div className="mb-12">
          <p className="text-sm uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-3">
            Live Demo · HVAC Receptionist
          </p>
          <h1 className="text-4xl font-bold tracking-tight mb-4">Meet Riley.</h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Riley is the AI receptionist for AustinAir HVAC. Try booking an appointment — describe a
            problem, say it&apos;s an emergency, or ask for a price estimate.
          </p>
        </div>

        {configMissing && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950 dark:border-amber-800 p-4 mb-8 text-sm text-amber-900 dark:text-amber-100">
            <strong>⚠️ Demo not configured.</strong> Set{' '}
            <code className="font-mono bg-amber-100 dark:bg-amber-900 px-1 rounded">
              NEXT_PUBLIC_VAPI_PUBLIC_KEY
            </code>{' '}
            and{' '}
            <code className="font-mono bg-amber-100 dark:bg-amber-900 px-1 rounded">
              NEXT_PUBLIC_VAPI_HVAC_ASSISTANT_ID
            </code>{' '}
            in <code className="font-mono">.env.local</code>, then restart{' '}
            <code className="font-mono">npm run dev</code>. See{' '}
            <code className="font-mono">docs/ACCOUNT_SETUP.md</code>.
          </div>
        )}

        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 mb-8 flex flex-col items-center">
          <CallButton
            publicKey={publicKey}
            assistantId={assistantId}
            onTranscript={(entry) => setTranscript((prev) => [...prev, entry])}
          />
        </div>

        <div className="mb-8">
          <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500 mb-3">
            Live transcript
          </h2>
          <TranscriptStream entries={transcript} />
        </div>

        <details className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 text-sm text-zinc-600 dark:text-zinc-400">
          <summary className="cursor-pointer font-medium text-zinc-900 dark:text-zinc-100">
            Try saying...
          </summary>
          <ul className="mt-3 space-y-1 list-disc list-inside">
            <li>&ldquo;My A/C stopped cooling, can you send someone today?&rdquo;</li>
            <li>
              &ldquo;I smell gas in the house&rdquo; <em>(emergency triage)</em>
            </li>
            <li>
              &ldquo;How much does it cost to fix a leaking furnace?&rdquo; <em>(quote tool)</em>
            </li>
            <li>&ldquo;Schedule a maintenance tuneup for next week&rdquo;</li>
            <li>
              &ldquo;My elderly mom has no heat and it&apos;s 35 degrees&rdquo; <em>(emergency)</em>
            </li>
          </ul>
        </details>
      </div>
    </main>
  );
}
