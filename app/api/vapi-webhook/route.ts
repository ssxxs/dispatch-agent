import { NextRequest, NextResponse } from 'next/server';
import { findNextAvailableSlot } from '@/lib/verticals/hvac/mock-roster';
import { getQuoteRange, OWNER_AFTER_HOURS_PHONE } from '@/lib/verticals/hvac/business-rules';

/**
 * Vapi tool-call webhook.
 *
 * Vapi posts payloads of various message types here. We handle:
 * - `tool-calls` (current) — array of function invocations
 * - `function-call` (legacy single-call format)
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
        const result = await handleTool(name, params);
        return { toolCallId: tc.id, result };
      })
    );
    return NextResponse.json({ results });
  }

  // Format 2 (legacy): single function-call
  if (message.type === 'function-call' && message.functionCall) {
    const { name, parameters } = message.functionCall;
    const result = await handleTool(name, parameters ?? {});
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

async function handleTool(name: string, params: Record<string, unknown>): Promise<unknown> {
  const entry: CallLogEntry = { ts: new Date().toISOString(), tool: name, params, result: null };

  try {
    switch (name) {
      case 'check_availability': {
        const urgency = (params.urgency as any) ?? 'same-day';
        const skills = (params.needed_skills as string[] | undefined) ?? [];
        const match = findNextAvailableSlot(urgency, skills);
        entry.result = match
          ? {
              available: true,
              slot_id: match.slotId,
              technician_name: match.technicianName,
              window_start: match.windowStart,
              window_end: match.windowEnd,
              area: match.area,
            }
          : {
              available: false,
              message: 'No matching slots in the next 5 days. Suggest owner callback or alternate urgency.',
            };
        break;
      }

      case 'book_appointment': {
        const required = ['caller_name', 'caller_phone', 'address', 'slot_id', 'issue', 'urgency'];
        const missing = required.filter((k) => !params[k]);
        if (missing.length) {
          entry.result = { error: `Missing required fields: ${missing.join(', ')}` };
          break;
        }
        const confirmation = 'AA-' + Date.now().toString(36).toUpperCase().slice(-6);
        entry.result = {
          success: true,
          confirmation_number: confirmation,
          message: `Booked ${params.caller_name} (${params.urgency}) for ${params.slot_id} re: ${params.issue}. SMS confirmation to ${params.caller_phone} in ~60s.`,
        };
        break;
      }

      case 'escalate_to_owner': {
        const reason = params.reason ?? 'unspecified emergency';
        const callerPhone = params.caller_phone ?? 'unknown';
        const callerName = params.caller_name ?? 'caller';
        entry.result = {
          escalated: true,
          owner_phone: OWNER_AFTER_HOURS_PHONE,
          message: `Owner notified. Will call ${callerName} at ${callerPhone} within 5 minutes. Reason: ${reason}`,
        };
        break;
      }

      case 'get_quote_range': {
        const issueType = (params.issue_type as string) ?? 'unknown';
        entry.result = getQuoteRange(issueType);
        break;
      }

      default:
        entry.result = { error: `Unknown tool: ${name}` };
    }
  } catch (err: any) {
    entry.result = { error: err?.message ?? 'Tool execution failed' };
  }

  CALL_LOG.push(entry);
  // keep log small
  if (CALL_LOG.length > 200) CALL_LOG.splice(0, CALL_LOG.length - 200);

  return entry.result;
}
