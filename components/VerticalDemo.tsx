'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CallButton, type TranscriptChunk } from '@/components/CallButton';
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

  // Aggregate Vapi transcript chunks into bubbles. The challenge: while a
  // user is speaking, the AI may emit late partial/final chunks that
  // interleave with user partials. Naively starting a new bubble on every
  // role flip produces fragmented duplicates ("5 minutes" / "to" appearing
  // as separate AI bubbles).
  //
  // Algorithm:
  // - Each chunk routes to the most recent UN-SEALED bubble of its role.
  //   If none exists, a new bubble is created.
  // - Sealing is one-directional: only USER finals seal the open AI bubble.
  //   That signals "the customer just said something new, the assistant's
  //   prior turn is over." AI finals do NOT seal user bubbles, because the
  //   user may still be mid-utterance when the AI finalizes a segment.
  // - User finals also self-seal — user messages are atomic.
  // - AI bubbles never self-seal: Vapi splits one AI turn into many
  //   speech segments (each a partial→final cycle), all of which should
  //   accumulate into the same bubble until the user speaks.
  const handleTranscript = (chunk: TranscriptChunk) => {
    setTranscript((prev) => {
      const next = prev.slice();

      // Step 1: find or create the active (un-sealed) bubble for this role
      let activeIdx = -1;
      for (let i = next.length - 1; i >= 0; i--) {
        if (next[i].role === chunk.role && !next[i].sealed) {
          activeIdx = i;
          break;
        }
      }

      if (activeIdx === -1) {
        next.push({
          role: chunk.role,
          finalText: chunk.isFinal ? chunk.text : '',
          partialText: chunk.isFinal ? '' : chunk.text,
          sealed: chunk.isFinal && chunk.role === 'user',
          ts: new Date().toISOString(),
        });
      } else {
        const cur = next[activeIdx];
        if (chunk.isFinal) {
          next[activeIdx] = {
            ...cur,
            finalText: cur.finalText
              ? cur.finalText.trimEnd() + ' ' + chunk.text.trimStart()
              : chunk.text,
            partialText: '',
            sealed: chunk.role === 'user' ? true : cur.sealed,
          };
        } else {
          next[activeIdx] = { ...cur, partialText: chunk.text };
        }
      }

      // Step 2: only USER finals seal open AI bubbles. AI finals do NOT
      // touch user bubbles — the user could still be mid-sentence.
      if (chunk.isFinal && chunk.role === 'user') {
        for (let i = 0; i < next.length; i++) {
          if (next[i].role === 'assistant' && !next[i].sealed) {
            next[i] = { ...next[i], sealed: true };
          }
        }
      }

      return next;
    });
  };

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

        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 text-sm uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            <span className="relative inline-flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Live Demo · {vertical.label} Receptionist
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-3">Meet {vertical.agentName}.</h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-4">
            AI receptionist for <strong>{vertical.businessName}</strong>. Describe a problem, say
            it's an emergency, or ask for a price estimate — watch the tool calls fire live.
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            <Chip>⚡ SSE streaming</Chip>
            <Chip>🔧 4 typed tools</Chip>
            <Chip>📦 shared factory</Chip>
            <Chip>🔓 open source</Chip>
          </div>
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
                onTranscript={handleTranscript}
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

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
      {children}
    </span>
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
