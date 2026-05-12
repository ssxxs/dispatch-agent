'use client';

import { useState, useRef, useEffect } from 'react';
import type { ExamplePromptCategories } from '@/lib/verticals/registry';

/**
 * Text-chat fallback for the voice receptionist demo. Works for any
 * vertical — pass `verticalId`, `agentName`, `greeting`, and
 * `examplePrompts` as props. The component posts the conversation to
 * /api/chat which runs an agentic loop using the vertical's prompt
 * + tools.
 */

interface Message {
  role: 'user' | 'assistant';
  content: string;
  /** Live status ("Thinking..." / "Composing reply...") shown in-bubble while streaming. */
  status?: string;
  tool_calls?: Array<{
    name: string;
    arguments: Record<string, unknown>;
    result?: unknown; // undefined while running, set on tool_result event
  }>;
}

export interface TextChatProps {
  verticalId: string;
  agentName: string;
  greeting: string;
  /** Categorized prompt pool. UI picks 1 from each category per page load. */
  examplePrompts: ExamplePromptCategories;
}

/** Pick one random element from an array. */
function pickOne<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Pick 1 random prompt from each of [emergency, quote, scheduling]. */
function pickBalanced(pool: ExamplePromptCategories): string[] {
  return [pickOne(pool.emergency), pickOne(pool.quote), pickOne(pool.scheduling)].filter(
    (p): p is string => typeof p === 'string'
  );
}

export default function TextChat({
  verticalId,
  agentName,
  greeting,
  examplePrompts,
}: TextChatProps) {
  const initialGreeting = `${greeting} (You can type below or pick an example.)`;
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: initialGreeting },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Suggestions: 1 random prompt from each of [emergency, quote, scheduling].
  // Initial state uses first item from each category to avoid SSR/CSR
  // hydration mismatch; useEffect re-rolls truly random ones on mount.
  const [suggestions, setSuggestions] = useState<string[]>(() => [
    examplePrompts.emergency[0] ?? '',
    examplePrompts.quote[0] ?? '',
    examplePrompts.scheduling[0] ?? '',
  ].filter(Boolean));
  useEffect(() => {
    setSuggestions(pickBalanced(examplePrompts));
  }, [examplePrompts]);
  const refreshSuggestions = () => setSuggestions(pickBalanced(examplePrompts));

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setError(null);

    // Add the user message + a placeholder assistant message that we'll
    // mutate as SSE events stream in.
    const userMsg: Message = { role: 'user', content: trimmed };
    const placeholder: Message = {
      role: 'assistant',
      content: '',
      status: 'Thinking\u2026',
      tool_calls: [],
    };
    const baseHistory = [...messages, userMsg];
    setMessages([...baseHistory, placeholder]);
    setInput('');
    setLoading(true);

    /** Mutate the in-flight assistant message via setState. */
    const updatePlaceholder = (mut: (m: Message) => Message) => {
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (!last || last.role !== 'assistant') return prev;
        return [...prev.slice(0, -1), mut(last)];
      });
    };

    try {
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          vertical: verticalId,
          messages: baseHistory.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      if (!r.ok || !r.body) {
        const errBody = await r.json().catch(() => ({}));
        setError(errBody.error || `HTTP ${r.status}`);
        // drop the placeholder so the UI doesn't show empty bubble
        setMessages(baseHistory);
        return;
      }

      const reader = r.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let streamErrored = false;

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const parts = buffer.split('\n\n');
        buffer = parts.pop() ?? '';

        for (const part of parts) {
          const line = part.split('\n').find((l) => l.startsWith('data:'));
          if (!line) continue;
          const dataStr = line.slice(5).trim();
          if (!dataStr) continue;

          let evt: { type: string } & Record<string, unknown>;
          try {
            evt = JSON.parse(dataStr);
          } catch {
            continue;
          }

          switch (evt.type) {
            case 'status':
              updatePlaceholder((m) => ({ ...m, status: String(evt.message ?? '') }));
              break;

            case 'token':
              updatePlaceholder((m) => ({
                ...m,
                content: m.content + String(evt.token ?? ''),
                status: undefined,
              }));
              break;

            case 'tool_call':
              updatePlaceholder((m) => ({
                ...m,
                status: `\ud83d\udd27 ${evt.name}\u2026`,
                tool_calls: [
                  ...(m.tool_calls ?? []),
                  {
                    name: String(evt.name),
                    arguments: (evt.arguments as Record<string, unknown>) ?? {},
                  },
                ],
              }));
              break;

            case 'tool_result':
              updatePlaceholder((m) => {
                const calls = m.tool_calls ?? [];
                const idx = calls
                  .map((c, i) => ({ c, i }))
                  .reverse()
                  .find(({ c }) => c.name === evt.name && c.result === undefined);
                if (!idx) return m;
                const next = calls.slice();
                next[idx.i] = { ...next[idx.i], result: evt.result };
                return { ...m, tool_calls: next };
              });
              break;

            case 'done':
              updatePlaceholder((m) => ({ ...m, status: undefined }));
              break;

            case 'error':
              streamErrored = true;
              setError(String(evt.message ?? 'stream error'));
              break;
          }
        }
      }

      if (streamErrored) {
        // Remove the placeholder if no content was produced
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === 'assistant' && !last.content && (!last.tool_calls || last.tool_calls.length === 0)) {
            return prev.slice(0, -1);
          }
          return prev;
        });
      }
    } catch (e) {
      setError((e as Error).message || 'Network error');
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setMessages([{ role: 'assistant', content: initialGreeting }]);
    setError(null);
    refreshSuggestions();
  }

  return (
    <div className="flex h-[560px] flex-col rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {agentName} (text mode)
          </span>
        </div>
        <button
          type="button"
          onClick={reset}
          className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
        >
          Reset
        </button>
      </header>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((m, i) => (
          <MessageBubble key={i} msg={m} />
        ))}
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>

      {messages.length <= 1 && (
        <div className="border-t border-slate-200 px-4 py-3 dark:border-slate-800">
          <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
            <span>Try one of these:</span>
            <button
              type="button"
              onClick={refreshSuggestions}
              disabled={loading}
              className="rounded px-2 py-0.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              title="Show different suggestions"
            >
              🎲 New ideas
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => send(p)}
                disabled={loading}
                className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex gap-2 border-t border-slate-200 p-3 dark:border-slate-800"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={loading}
          className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';
  const showStatusBubble = !isUser && !msg.content && msg.status;
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className="max-w-[80%] space-y-2">
        {/* Tool calls render BEFORE the reply so user sees them as they fire */}
        {!isUser && msg.tool_calls && msg.tool_calls.length > 0 && (
          <ToolTrace calls={msg.tool_calls} />
        )}

        {/* Status pill (shown while tools run / before any token arrives) */}
        {showStatusBubble && (
          <div className="flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-500 dark:bg-slate-800">
            <span className="inline-flex gap-1">
              <Dot delay={0} />
              <Dot delay={150} />
              <Dot delay={300} />
            </span>
            <span className="text-xs">{msg.status}</span>
          </div>
        )}

        {/* Main content bubble (renders once tokens start arriving) */}
        {(isUser || msg.content) && (
          <div
            className={`whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm ${
              isUser
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
            }`}
          >
            {msg.content}
            {!isUser && msg.status && msg.content && (
              <span className="ml-1 inline-block animate-pulse text-slate-400">▊</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ToolTrace({
  calls,
}: {
  calls: NonNullable<Message['tool_calls']>;
}) {
  return (
    <div className="space-y-1">
      {calls.map((c, i) => (
        <details
          key={i}
          className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs dark:border-amber-900 dark:bg-amber-950"
        >
          <summary className="cursor-pointer text-amber-800 dark:text-amber-200">
            <span className="font-mono">🔧 {c.name}</span>
            <span className="ml-1 text-amber-600 dark:text-amber-400">
              ({Object.keys(c.arguments).join(', ') || 'no args'})
            </span>
            {c.result === undefined && (
              <span className="ml-2 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
            )}
          </summary>
          <div className="mt-1 space-y-1 text-amber-900 dark:text-amber-100">
            <div>
              <span className="font-semibold">args:</span>{' '}
              <code className="font-mono">{JSON.stringify(c.arguments)}</code>
            </div>
            <div>
              <span className="font-semibold">result:</span>{' '}
              {c.result === undefined ? (
                <span className="italic text-amber-700 dark:text-amber-300">running…</span>
              ) : (
                <code className="font-mono">{JSON.stringify(c.result)}</code>
              )}
            </div>
          </div>
        </details>
      ))}
    </div>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <span
      className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"
      style={{ animationDelay: `${delay}ms` }}
    />
  );
}
