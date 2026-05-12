'use client';

import { useState, useRef, useEffect } from 'react';

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
  tool_calls?: Array<{
    name: string;
    arguments: Record<string, unknown>;
    result: unknown;
  }>;
}

export interface TextChatProps {
  verticalId: string;
  agentName: string;
  greeting: string;
  examplePrompts: string[];
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

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setError(null);

    const next: Message[] = [...messages, { role: 'user', content: trimmed }];
    setMessages(next);
    setInput('');
    setLoading(true);

    try {
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          vertical: verticalId,
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await r.json();
      if (!r.ok || data.error) {
        setError(data.error || `HTTP ${r.status}`);
        setMessages(next); // keep user message visible
        return;
      }
      setMessages([
        ...next,
        {
          role: 'assistant',
          content: data.reply || '(no reply)',
          tool_calls: data.tool_calls,
        },
      ]);
    } catch (e) {
      setError((e as Error).message || 'Network error');
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setMessages([{ role: 'assistant', content: initialGreeting }]);
    setError(null);
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
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-500 dark:bg-slate-800">
              <span className="inline-flex gap-1">
                <Dot delay={0} />
                <Dot delay={150} />
                <Dot delay={300} />
              </span>
            </div>
          </div>
        )}
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>

      {messages.length <= 1 && (
        <div className="border-t border-slate-200 px-4 py-3 dark:border-slate-800">
          <div className="mb-2 text-xs text-slate-500">Try one of these:</div>
          <div className="flex flex-wrap gap-2">
            {examplePrompts.map((p) => (
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
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className="max-w-[80%] space-y-2">
        <div
          className={`whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm ${
            isUser
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
          }`}
        >
          {msg.content}
        </div>
        {msg.tool_calls && msg.tool_calls.length > 0 && (
          <ToolTrace calls={msg.tool_calls} />
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
          </summary>
          <div className="mt-1 space-y-1 text-amber-900 dark:text-amber-100">
            <div>
              <span className="font-semibold">args:</span>{' '}
              <code className="font-mono">{JSON.stringify(c.arguments)}</code>
            </div>
            <div>
              <span className="font-semibold">result:</span>{' '}
              <code className="font-mono">{JSON.stringify(c.result)}</code>
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
