#!/usr/bin/env node
/**
 * End-to-end check that Phase-2 persistence actually persists.
 *
 * Run with:
 *   node --env-file=.env.local scripts/test-supabase.mjs
 *
 * What it does:
 *   1. Connects via service_role (bypasses RLS).
 *   2. INSERTs a synthetic appointment.
 *   3. SELECTs upcoming bookings for the same vertical to confirm
 *      check_availability would now hide that slot.
 *   4. DELETEs the synthetic row so we don't pollute real demo data.
 *
 * No LLM, no Vapi, no dev server — purely the DB layer.
 */

import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('\u274c Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  console.error('   Verify .env.local then re-run with --env-file=.env.local.');
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const VERTICAL = 'hvac';
const TECH_ID = 't-001';
const TECH_NAME = 'Mike Sullivan';

// Fake slot 1h from now, 2h duration.
const slotStart = new Date(Date.now() + 60 * 60 * 1000);
const slotEnd = new Date(slotStart.getTime() + 2 * 60 * 60 * 1000);

console.log('\u2192 Running Phase 2 persistence smoke test\n');
console.log(`  url:        ${url}`);
console.log(`  vertical:   ${VERTICAL}`);
console.log(`  technician: ${TECH_ID} (${TECH_NAME})`);
console.log(`  slot:       ${slotStart.toISOString()}\n`);

// 1. INSERT
console.log('1/4 INSERT appointment\u2026');
const insertRes = await supabase
  .from('appointments')
  .insert({
    vertical_id: VERTICAL,
    technician_id: TECH_ID,
    technician_name: TECH_NAME,
    slot_start: slotStart.toISOString(),
    slot_end: slotEnd.toISOString(),
    caller_name: 'SMOKE TEST CALLER (delete me)',
    caller_phone: '5125550101',
    address: '1 Test St, Austin TX',
    issue: 'Phase 2 e2e test',
    urgency: 'scheduled',
  })
  .select('id, created_at')
  .single();

if (insertRes.error || !insertRes.data) {
  console.error('  \u274c INSERT failed:', insertRes.error?.message);
  process.exit(1);
}
const rowId = insertRes.data.id;
console.log(`  \u2705 inserted row id=${rowId}, created_at=${insertRes.data.created_at}\n`);

// 2. SELECT (mirrors fetchBookedSlotIds query)
console.log('2/4 SELECT upcoming booked slots for vertical=hvac\u2026');
const now = new Date();
const fiveDaysOut = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
const selectRes = await supabase
  .from('appointments')
  .select('id, technician_id, slot_start, caller_name')
  .eq('vertical_id', VERTICAL)
  .eq('status', 'booked')
  .gte('slot_start', now.toISOString())
  .lte('slot_start', fiveDaysOut.toISOString());

if (selectRes.error) {
  console.error('  \u274c SELECT failed:', selectRes.error.message);
  process.exit(1);
}
const ours = selectRes.data?.find((r) => r.id === rowId);
console.log(`  \u2705 returned ${selectRes.data?.length ?? 0} row(s); ours present: ${!!ours}\n`);

// 3. Verify the slot id format would match the one check_availability filters.
//    Mirrors the production normalization in lib/supabase.ts:fetchBookedSlotIds.
const expectedSlotId = `${TECH_ID}|${slotStart.toISOString()}`;
const dbSlotId = ours
  ? `${ours.technician_id}|${new Date(ours.slot_start).toISOString()}`
  : '<missing>';
const slotIdMatches = dbSlotId === expectedSlotId;
console.log('3/4 Slot id format check (after normalization)\u2026');
console.log(`  expected: ${expectedSlotId}`);
console.log(`  fromDB:   ${dbSlotId}`);
console.log(`  match:    ${slotIdMatches ? '\u2705 yes (check_availability would hide it)' : '\u274c MISMATCH \u2014 slot would still be offered!'}\n`);

// 4. CLEANUP
console.log('4/4 DELETE synthetic row\u2026');
const delRes = await supabase.from('appointments').delete().eq('id', rowId);
if (delRes.error) {
  console.error('  \u26a0\ufe0f  cleanup failed:', delRes.error.message);
  console.error('     manually delete row id=' + rowId);
} else {
  console.log('  \u2705 deleted\n');
}

console.log('\u2500'.repeat(50));
const allPassed = !!ours && slotIdMatches;
console.log(
  allPassed
    ? '\u2705 Phase 2 persistence works end-to-end.'
    : '\u274c Persistence is BROKEN \u2014 see failures above.'
);
process.exit(allPassed ? 0 : 1);
