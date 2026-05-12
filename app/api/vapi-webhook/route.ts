import { NextRequest, NextResponse } from 'next/server';
import { handleHvacTool } from '@/lib/verticals/hvac/tools';

/**
 * Vapi tool-call webhook.
 *
 * Vapi posts payloads of various message types here. We handle:
 * - `tool-calls` (current) — array of function invocations
 * - `function-call` (legacy single-call format)
 *
 * Business logic lives in `lib/verticals/hvac/tools.ts` so the text-chat
 * fallback (`/api/chat`) can reuse the exact same handlers.
 *
 * For Phase 1 we use an in-memory call log (resets on cold start).
 * Phase 2 will persist to Supabase.
 */

interface CallLogEntry {
  ts: string;
  tool: string;
  params: Record<string, unknown>;
  result: unknown;
}

const CALL_LOG: CallLogEntry[] = [];

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const message = body.message ?? body;

  // Format 1 (current): tool-calls array
  if (message.type === 'tool-calls' && Array.isArray(message.toolCalls)) {
    const results = await Promise.all(
      message.toolCalls.map(async (tc: any) => {
        const name = tc.function?.name ?? tc.name;
        const rawArgs = tc.function?.arguments ?? tc.arguments ?? {};
        const params = typeof rawArgs === 'string' ? safeJsonParse(rawArgs) : rawArgs;
        const result = await handleHvacTool(name, params);
        logCall(name, params, result);
        return { toolCallId: tc.id, result };
      })
    );
    return NextResponse.json({ results });
  }

  // Format 2 (legacy): single function-call
  if (message.type === 'function-call' && message.functionCall) {
    const { name, parameters } = message.functionCall;
    const result = await handleHvacTool(name, parameters ?? {});
    logCall(name, parameters ?? {}, result);
    return NextResponse.json({ result });
  }

  // Other event types (status-update, transcript, end-of-call-report) — ack only
  return NextResponse.json({ ok: true });
}

/**
 * GET — small inspection endpoint for local debugging.
 * Visit /api/vapi-webhook to see the last 50 tool calls.
 */
export async function GET() {
  return NextResponse.json({ recent: CALL_LOG.slice(-50) });
}

function safeJsonParse(s: string): Record<string, unknown> {
  try {
    return JSON.parse(s);
  } catch {
    return {};
  }
}

function logCall(tool: string, params: Record<string, unknown>, result: unknown) {
  CALL_LOG.push({ ts: new Date().toISOString(), tool, params, result });
  if (CALL_LOG.length > 200) CALL_LOG.splice(0, CALL_LOG.length - 200);
}
