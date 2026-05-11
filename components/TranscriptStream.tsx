'use client';

import type { TranscriptEntry } from '@/lib/types';

interface Props {
  entries: TranscriptEntry[];
  emptyText?: string;
}

export function TranscriptStream({
  entries,
  emptyText = 'No transcript yet. Start a call to see live captions.',
}: Props) {
  if (entries.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-8 text-center text-sm text-zinc-500">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
      {entries.map((entry, i) => (
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
            <div>{entry.text}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
