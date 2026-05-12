'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CallButton } from '@/components/CallButton';
import { TranscriptStream } from '@/components/TranscriptStream';
import TextChat from '@/components/TextChat';
import type { TranscriptEntry } from '@/lib/types';
import type { VerticalMeta } from '@/lib/verticals/registry';

type Mode = 'voice' | 'text';

interface VerticalDemoProps {
  vertical: VerticalMeta;
  allVerticals: VerticalMeta[];
  /** Vapi public key for voice mode (browser-side; safe to expose). */
  publicKey: string;
  /** Vapi assistant id, present only for verticals where voiceAvailable=true. */
  assistantId: string;
}

export default function VerticalDemo({
  vertical,
  allVerticals,
  publicKey,
  assistantId,
}: VerticalDemoProps) {
  // Default to text mode when this vertical has no voice support
  const [mode, setMode] = useState<Mode>(vertical.voiceAvailable ? 'voice' : 'text');
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);

  const voiceConfigMissing = vertical.voiceAvailable && (!publicKey || !assistantId);

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link
          href="/"
          className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 mb-8 inline-block"
        >
          ← Back
        </Link>

        {/* Vertical switcher pills */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {allVerticals.map((v) => (
            <Link
              key={v.id}
              href={`/demo/${v.id}`}
              className={`text-xs rounded-full px-3 py-1.5 border transition ${
                v.id === vertical.id
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200'
                  : 'border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900'
              }`}
            >
              {v.emoji} {v.label}
              {v.voiceAvailable ? '' : ' (text only)'}
            </Link>
          ))}
        </div>

        <div className="mb-10">
          <p className="text-sm uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-3">
            Live Demo · {vertical.label} Receptionist
          </p>
          <h1 className="text-4xl font-bold tracking-tight mb-4">Meet {vertical.agentName}.</h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            {vertical.agentName} is the AI receptionist for {vertical.businessName}. Try booking
            an appointment — describe a problem, say it&apos;s an emergency, or ask for a price
            estimate.
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            Same architecture as every other vertical here: shared system prompt scaffold + the
            same 4 tools (check_availability, book_appointment, escalate_to_owner,
            get_quote_range). Only the industry vocabulary and data differ.
          </p>
        </div>

        {/* Mode tabs (only if voice is available for this vertical) */}
        {vertical.voiceAvailable && (
          <div className="mb-6 inline-flex rounded-lg border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900">
            <TabButton active={mode === 'voice'} onClick={() => setMode('voice')}>
              🎙️ Voice call
            </TabButton>
            <TabButton active={mode === 'text'} onClick={() => setMode('text')}>
              💬 Text chat
            </TabButton>
          </div>
        )}

        {!vertical.voiceAvailable && (
          <div className="rounded-lg border border-zinc-200 bg-white p-3 mb-6 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
            ℹ️ Voice mode for {vertical.label} is on the roadmap — one Vapi assistant per vertical.
            Text chat below uses the exact same prompt + tools the voice version would.
          </div>
        )}

        {mode === 'voice' && vertical.voiceAvailable && (
          <>
            {voiceConfigMissing && (
              <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950 dark:border-amber-800 p-4 mb-6 text-sm text-amber-900 dark:text-amber-100">
                <strong>⚠️ Voice not configured.</strong> Set{' '}
                <code className="font-mono bg-amber-100 dark:bg-amber-900 px-1 rounded">
                  NEXT_PUBLIC_VAPI_PUBLIC_KEY
                </code>{' '}
                and the {vertical.label} assistant id in{' '}
                <code className="font-mono">.env.local</code>, then restart{' '}
                <code className="font-mono">npm run dev</code>.
              </div>
            )}

            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 mb-6 flex flex-col items-center">
              <CallButton
                publicKey={publicKey}
                assistantId={assistantId}
                onTranscript={(entry) => setTranscript((prev) => [...prev, entry])}
              />
              <p className="mt-4 text-xs text-zinc-500 text-center max-w-md">
                Voice requires a working mic + browser permission. On iPhone, use Safari (not
                in-app browsers). No mic handy? Switch to text chat above.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500 mb-3">
                Live transcript
              </h2>
              <TranscriptStream entries={transcript} />
            </div>
          </>
        )}

        {(mode === 'text' || !vertical.voiceAvailable) && (
          <div className="mb-8">
            <TextChat
              verticalId={vertical.id}
              agentName={vertical.agentName}
              greeting={vertical.greeting}
              examplePrompts={vertical.examplePrompts}
            />
            <p className="mt-3 text-xs text-zinc-500">
              Each AI response shows the tools it called and what they returned (click the 🔧 badge
              to expand). Same prompt + same tools the voice agent uses.
            </p>
          </div>
        )}

        <details className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 text-sm text-zinc-600 dark:text-zinc-400">
          <summary className="cursor-pointer font-medium text-zinc-900 dark:text-zinc-100">
            Full prompt library by category
          </summary>
          <div className="mt-4 grid sm:grid-cols-3 gap-4">
            <PromptCategory title="🚨 Emergency" items={vertical.examplePrompts.emergency} />
            <PromptCategory title="💰 Quote" items={vertical.examplePrompts.quote} />
            <PromptCategory title="📅 Scheduling" items={vertical.examplePrompts.scheduling} />
          </div>
        </details>
      </div>
    </main>
  );
}

function PromptCategory({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="mb-2 font-semibold text-zinc-700 dark:text-zinc-300">{title}</div>
      <ul className="space-y-1 list-disc list-inside text-xs">
        {items.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-4 py-2 text-sm font-medium transition ${
        active
          ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
          : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
      }`}
    >
      {children}
    </button>
  );
}
