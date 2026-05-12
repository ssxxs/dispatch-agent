/**
 * Supabase server-side client + persistence helpers.
 *
 * The chat / webhook handlers query Supabase to read existing bookings
 * and insert new ones. Service-role key bypasses RLS, which is correct
 * for trusted server code.
 *
 * Persistence is **opt-in**: if SUPABASE_SERVICE_ROLE_KEY +
 * NEXT_PUBLIC_SUPABASE_URL aren't set, the rest of the system falls
 * back to in-memory behavior (good for local dev without a DB).
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import type { VerticalId } from './verticals/registry';

let _client: SupabaseClient<Database> | null = null;

function readEnv(name: string): string | undefined {
  const v = process.env[name];
  return v && v.length > 0 ? v : undefined;
}

/** True when the server has enough config to actually persist appointments. */
export function isSupabaseConfigured(): boolean {
  return !!(readEnv('NEXT_PUBLIC_SUPABASE_URL') && readEnv('SUPABASE_SERVICE_ROLE_KEY'));
}

/**
 * Lazily-built service-role client. Returns null when env vars are missing
 * so callers can gracefully degrade to in-memory behavior.
 */
export function getAdminClient(): SupabaseClient<Database> | null {
  if (_client) return _client;
  const url = readEnv('NEXT_PUBLIC_SUPABASE_URL');
  const key = readEnv('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) return null;

  _client = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { 'X-Client-Info': 'dispatch-agent-server' } },
  });
  return _client;
}

/**
 * Slot id format used in tool calls + DB rows: `${technicianId}|${ISO timestamp}`.
 * Splitting it gives us the two columns we need to upsert/lookup.
 */
export function parseSlotId(slotId: string): { technicianId: string; slotStartISO: string } | null {
  const idx = slotId.indexOf('|');
  if (idx === -1) return null;
  return {
    technicianId: slotId.slice(0, idx),
    slotStartISO: slotId.slice(idx + 1),
  };
}

/**
 * Read all currently-booked slot ids for a vertical, in the upcoming
 * 5-day window. Returned as a Set for O(1) lookup during slot matching.
 *
 * Returns an empty set if Supabase isn't configured — callers should
 * treat that as "no DB-side bookings to filter against".
 */
export async function fetchBookedSlotIds(verticalId: VerticalId): Promise<Set<string>> {
  const supabase = getAdminClient();
  if (!supabase) return new Set();

  const now = new Date();
  const fiveDaysOut = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

  const { data, error } = await supabase
    .from('appointments')
    .select('technician_id, slot_start')
    .eq('vertical_id', verticalId)
    .eq('status', 'booked')
    .gte('slot_start', now.toISOString())
    .lte('slot_start', fiveDaysOut.toISOString());

  if (error) {
    // Fail open: log and return empty so the demo doesn't 500. The booking
    // step will still hit a unique-violation if someone double-books.
    console.error('[supabase] fetchBookedSlotIds failed:', error.message);
    return new Set();
  }

  // Postgres serializes `timestamptz` with "+00:00" offset, but the in-roster
  // slot ids are produced via `Date.toISOString()` which always emits "Z".
  // Round-trip through Date so both sides use the same canonical form;
  // otherwise the Set lookup would miss and DB-booked slots would still be
  // offered to the next caller.
  return new Set(
    data.map((row) => `${row.technician_id}|${new Date(row.slot_start).toISOString()}`)
  );
}

export interface BookAppointmentInput {
  verticalId: VerticalId;
  technicianId: string;
  technicianName: string;
  slotStartISO: string;
  slotEndISO: string;
  callerName: string;
  callerPhone: string;
  address: string | null;
  issue: string;
  urgency: 'emergency' | 'same-day' | 'scheduled';
}

export interface BookAppointmentResult {
  /** Stable confirmation id derived from the row UUID. */
  confirmationNumber: string;
  /** Raw row id for follow-up writes (cancel, reschedule). */
  rowId: string;
  /** Whether persistence actually happened (false = in-memory fallback). */
  persisted: boolean;
}

/**
 * Insert a confirmed booking. When Supabase isn't configured, returns
 * a synthetic confirmation id so callers can keep their UX flow intact.
 */
export async function persistBooking(
  input: BookAppointmentInput
): Promise<BookAppointmentResult> {
  const supabase = getAdminClient();
  if (!supabase) {
    // In-memory fallback: synthesize a confirmation number from current time.
    const synthetic = Date.now().toString(36).toUpperCase().slice(-6);
    return {
      confirmationNumber: synthetic,
      rowId: `mem-${synthetic}`,
      persisted: false,
    };
  }

  const { data, error } = await supabase
    .from('appointments')
    .insert({
      vertical_id: input.verticalId,
      technician_id: input.technicianId,
      technician_name: input.technicianName,
      slot_start: input.slotStartISO,
      slot_end: input.slotEndISO,
      caller_name: input.callerName,
      caller_phone: input.callerPhone,
      address: input.address,
      issue: input.issue,
      urgency: input.urgency,
    })
    .select('id')
    .single();

  if (error || !data) {
    throw new Error(`Supabase insert failed: ${error?.message ?? 'no row returned'}`);
  }

  // Confirmation id = first 6 hex chars of UUID, uppercased — stable + readable.
  const confirmationNumber = data.id.replace(/-/g, '').slice(0, 6).toUpperCase();
  return {
    confirmationNumber,
    rowId: data.id,
    persisted: true,
  };
}
