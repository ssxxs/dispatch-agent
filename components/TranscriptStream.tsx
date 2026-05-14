'use client';

import { useEffect, useRef } from 'react';
import type { TranscriptEntry } from '@/lib/types';

interface Props {
  entries: TranscriptEntry[];
  emptyText?: string;
}

export function TranscriptStream({
  entries,
  emptyText = 'No transcript yet. Start a call to see live captions.',
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll: use scrollIntoView on a sentinel element at the bottom.
  // This works regardless of whether the overflow is on the inner container
  // or the page itself.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  if (entries.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-8 text-center text-sm text-zinc-500">
        {emptyText}
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="space-y-3 max-h-[520px] overflow-y-auto pr-2">
      {entries.map((entry, i) => {
        const hasPartial = entry.partialText.length > 0;
        const display = hasPartial
          ? (entry.finalText ? entry.finalText.trimEnd() + ' ' : '') + entry.partialText
          : entry.finalText;
        return (
          <div
            key={i}
            className={`flex ${entry.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                entry.role === 'assistant'
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              <div className="font-medium text-xs uppercase tracking-wide opacity-60 mb-0.5">
                {entry.role === 'assistant' ? 'Riley (AI)' : 'You'}
              </div>
              <div>
                {display}
                {hasPartial && (
                  <span className="inline-block w-1.5 h-4 bg-current opacity-60 animate-pulse ml-0.5 align-text-bottom" />
                )}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
