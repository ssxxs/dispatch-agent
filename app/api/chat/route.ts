import { NextRequest } from 'next/server';
import { getVertical, type VerticalId } from '@/lib/verticals/registry';

/**
 * Multi-vertical text-chat endpoint with **server-sent event streaming**.
 *
 * Why stream? An agentic loop can take 8-15s end-to-end (LLM → tool →
 * LLM → final reply). Without streaming the UI shows a "..." for the full
 * duration. With streaming the user sees:
 *   - "Thinking..." within 100ms
 *   - "🔧 check_availability(...)" as soon as the LLM decides
 *   - Tool result as soon as it returns (instant for our mock tools)
 *   - Reply tokens flowing in word-by-word
 *
 * Event types (one JSON object per `data:` line, ending with `\n\n`):
 *   { type: 'status', message: string }                          // human-readable phase tag
 *   { type: 'tool_call', name, arguments }                       // LLM decided to call a tool
 *   { type: 'tool_result', name, arguments, result }             // tool returned
 *   { type: 'token', token: string }                             // streaming reply chunk
 *   { type: 'done', iterations: number }                         // final
 *   { type: 'error', message: string }                           // fatal error mid-stream
 */

// Edge runtime: V8 isolate + native Web streams = no Vercel CDN
// buffering between chunks. Node runtime collects chunks in 8KB-ish
// batches before flushing, which makes SSE look "smooth then suddenly
// dumps a big block". Edge fixes this; we use only Web APIs anyway.
export const runtime = 'edge';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MAX_ITERATIONS = 4;

type ChatMessage =
  | { role: 'user' | 'system'; content: string }
  | {
      role: 'assistant';
      content: string | null;
      tool_calls?: Array<{
        id: string;
        type: 'function';
        function: { name: string; arguments: string };
      }>;
    }
  | { role: 'tool'; tool_call_id: string; content: string };

interface AccumulatedToolCall {
  id: string;
  name: string;
  arguments: string;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return jsonError('Server misconfigured: OPENROUTER_API_KEY missing.', 500);
  }

  let body: { vertical?: string; messages?: Array<{ role: string; content: string }> };
  try {
    body = await req.json();
  } catch {
    return jsonError('invalid json', 400);
  }

  const verticalId = (body.vertical as VerticalId) || 'hvac';
  const vertical = getVertical(verticalId);
  if (!vertical) {
    return jsonError(
      `Unknown vertical: ${verticalId}. Available: hvac, plumber, electrician.`,
      400
    );
  }

  const userHistory = Array.isArray(body.messages) ? body.messages : [];
  if (userHistory.length === 0) {
    return jsonError('messages array required', 400);
  }

  const austinTime = new Date().toLocaleString('en-US', {
    timeZone: 'America/Chicago',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });

  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `${vertical.systemPrompt}\n\n# Current local time (Austin, TX)\n${austinTime}\n\n# Channel\nThis is a TEXT chat (not a phone call). You may use slightly longer responses than voice (still concise — under ~80 words).`,
    },
    ...userHistory.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: String(m.content),
    })),
  ];

  const model = process.env.OPENROUTER_MODEL || 'openrouter/free';

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const enc = new TextEncoder();
      const send = (obj: Record<string, unknown>) => {
        controller.enqueue(enc.encode(`data: ${JSON.stringify(obj)}\n\n`));
      };

      try {
        send({ type: 'status', message: 'Thinking...' });

        for (let i = 0; i < MAX_ITERATIONS; i++) {
          const upstream = await fetch(OPENROUTER_URL, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://dispatch-agent-seven.vercel.app',
              'X-Title': 'Dispatch Agent - Multi-Vertical Receptionist',
            },
            body: JSON.stringify({
              model,
              messages,
              tools: vertical.tools,
              tool_choice: 'auto',
              temperature: 0.5,
              stream: true,
            }),
          });

          if (!upstream.ok || !upstream.body) {
            const txt = upstream.body ? await upstream.text() : '(no body)';
            send({
              type: 'error',
              message: `LLM error: ${upstream.status} ${txt.slice(0, 300)}`,
            });
            controller.close();
            return;
          }

          // Parse SSE stream from OpenRouter, accumulate tool calls + emit tokens
          const reader = upstream.body.getReader();
          const dec = new TextDecoder();
          let buffer = '';
          let assistantContent = '';
          const accumulated: AccumulatedToolCall[] = [];

          // eslint-disable-next-line no-constant-condition
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += dec.decode(value, { stream: true });

            // SSE messages are separated by \n\n
            const parts = buffer.split('\n\n');
            buffer = parts.pop() ?? '';

            for (const part of parts) {
              const dataLine = part
                .split('\n')
                .find((l) => l.startsWith('data:'));
              if (!dataLine) continue;
              const dataStr = dataLine.slice(5).trim();
              if (!dataStr || dataStr === '[DONE]') continue;

              let chunk: {
                choices?: Array<{
                  delta?: {
                    content?: string;
                    tool_calls?: Array<{
                      index: number;
                      id?: string;
                      function?: { name?: string; arguments?: string };
                    }>;
                  };
                }>;
              };
              try {
                chunk = JSON.parse(dataStr);
              } catch {
                continue;
              }

              const delta = chunk.choices?.[0]?.delta;
              if (!delta) continue;

              if (delta.content) {
                assistantContent += delta.content;
                send({ type: 'token', token: delta.content });
              }

              if (delta.tool_calls) {
                for (const tc of delta.tool_calls) {
                  const idx = tc.index;
                  if (!accumulated[idx]) {
                    accumulated[idx] = { id: tc.id ?? `tc-${idx}`, name: '', arguments: '' };
                  }
                  if (tc.id && !accumulated[idx].id) {
                    accumulated[idx].id = tc.id;
                  }
                  if (tc.function?.name) {
                    accumulated[idx].name += tc.function.name;
                  }
                  if (tc.function?.arguments) {
                    accumulated[idx].arguments += tc.function.arguments;
                  }
                }
              }
            }
          }

          // Stream of this round finished
          if (accumulated.length === 0) {
            // No tools called → we're done
            send({ type: 'done', iterations: i + 1 });
            controller.close();
            return;
          }

          // Push the assistant turn with its tool_calls into the running history
          messages.push({
            role: 'assistant',
            content: assistantContent || null,
            tool_calls: accumulated.map((a) => ({
              id: a.id,
              type: 'function' as const,
              function: { name: a.name, arguments: a.arguments },
            })),
          });

          // Execute each tool and emit progress events
          for (const tc of accumulated) {
            let args: Record<string, unknown> = {};
            try {
              args = JSON.parse(tc.arguments || '{}');
            } catch {
              args = {};
            }
            send({ type: 'tool_call', name: tc.name, arguments: args });

            const result = await vertical.handler(tc.name, args);
            send({ type: 'tool_result', name: tc.name, arguments: args, result });

            messages.push({
              role: 'tool',
              tool_call_id: tc.id,
              content: JSON.stringify(result),
            });
          }

          send({ type: 'status', message: 'Composing reply...' });
          // Loop continues — next iteration calls LLM again with tool results
        }

        send({
          type: 'error',
          message: `Reached max iterations (${MAX_ITERATIONS}). Model stuck in tool loop.`,
        });
        controller.close();
      } catch (err) {
        send({ type: 'error', message: (err as Error).message || 'stream failed' });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // disable nginx buffering on Vercel edge
    },
  });
}

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
