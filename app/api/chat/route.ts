import { NextRequest, NextResponse } from 'next/server';
import { getVertical, type VerticalId } from '@/lib/verticals/registry';

/**
 * Multi-vertical text-chat endpoint.
 *
 * Request body:
 *   { vertical: 'hvac' | 'plumber' | 'electrician', messages: [{role, content}] }
 *
 * Flow per request:
 *   1. Look up vertical config (prompt + tools + handler).
 *   2. Prepend system prompt + local Austin time.
 *   3. Call OpenRouter with this vertical's tools.
 *   4. If LLM emits tool_calls → execute via the vertical's handler → feed
 *      results back → repeat up to MAX_ITERATIONS.
 *   5. Return the final assistant message + full tool trace.
 */

export const runtime = 'nodejs';
export const maxDuration = 30;

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MAX_ITERATIONS = 4;

type ChatMessage =
  | { role: 'user' | 'system'; content: string }
  | { role: 'assistant'; content: string | null; tool_calls?: Array<{ id: string; type: 'function'; function: { name: string; arguments: string } }> }
  | { role: 'tool'; tool_call_id: string; content: string };

type ToolTrace = {
  name: string;
  arguments: Record<string, unknown>;
  result: unknown;
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Server misconfigured: OPENROUTER_API_KEY missing.' },
      { status: 500 }
    );
  }

  let body: { vertical?: string; messages?: Array<{ role: string; content: string }> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const verticalId = (body.vertical as VerticalId) || 'hvac';
  const vertical = getVertical(verticalId);
  if (!vertical) {
    return NextResponse.json(
      { error: `Unknown vertical: ${verticalId}. Available: hvac, plumber, electrician.` },
      { status: 400 }
    );
  }

  const userHistory = Array.isArray(body.messages) ? body.messages : [];
  if (userHistory.length === 0) {
    return NextResponse.json({ error: 'messages array required' }, { status: 400 });
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

  const model = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';
  const toolTrace: ToolTrace[] = [];

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const llmResp = await callOpenRouter(apiKey, model, messages, vertical.tools);
    if (!llmResp.ok) {
      return NextResponse.json(
        { error: `LLM error: ${llmResp.status} ${llmResp.text.slice(0, 300)}` },
        { status: 502 }
      );
    }

    const choice = llmResp.data.choices?.[0];
    const assistantMsg = choice?.message;
    if (!assistantMsg) {
      return NextResponse.json({ error: 'LLM returned no message' }, { status: 502 });
    }

    if (!assistantMsg.tool_calls || assistantMsg.tool_calls.length === 0) {
      return NextResponse.json({
        reply: assistantMsg.content ?? '',
        tool_calls: toolTrace,
        iterations: i + 1,
        vertical: verticalId,
      });
    }

    messages.push({
      role: 'assistant',
      content: assistantMsg.content ?? null,
      tool_calls: assistantMsg.tool_calls,
    } as ChatMessage);

    for (const tc of assistantMsg.tool_calls) {
      const name = tc.function?.name ?? 'unknown';
      let args: Record<string, unknown> = {};
      try {
        args = JSON.parse(tc.function?.arguments || '{}');
      } catch {
        args = {};
      }
      const result = await vertical.handler(name, args);
      toolTrace.push({ name, arguments: args, result });
      messages.push({
        role: 'tool',
        tool_call_id: tc.id,
        content: JSON.stringify(result),
      });
    }
  }

  return NextResponse.json(
    {
      error: `Reached max iterations (${MAX_ITERATIONS}). The model is stuck in a tool loop.`,
      tool_calls: toolTrace,
      vertical: verticalId,
    },
    { status: 500 }
  );
}

async function callOpenRouter(
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  tools: unknown
): Promise<
  | { ok: true; data: { choices?: Array<{ message?: { content?: string | null; tool_calls?: Array<{ id: string; type: 'function'; function: { name: string; arguments: string } }> } }> } }
  | { ok: false; status: number; text: string }
> {
  const r = await fetch(OPENROUTER_URL, {
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
      tools,
      tool_choice: 'auto',
      temperature: 0.5,
    }),
  });

  if (!r.ok) {
    return { ok: false, status: r.status, text: await r.text() };
  }
  return { ok: true, data: await r.json() };
}
