#!/usr/bin/env node
/**
 * Smoke test for /api/vapi-webhook.
 *
 * Posts realistic Vapi tool-call payloads to a running dev server and
 * verifies the business logic (slots, prices, escalations) returns sensible
 * shapes.
 *
 * Usage:
 *   npm run dev    # in another terminal
 *   npm run test:webhook
 *
 * Override target:
 *   WEBHOOK_URL=https://x.ngrok-free.app/api/vapi-webhook npm run test:webhook
 */

const URL = process.env.WEBHOOK_URL ?? 'http://localhost:3000/api/vapi-webhook';

let passed = 0;
let failed = 0;

function log(label, ok, detail = '') {
  const tag = ok ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m';
  console.log(`  ${tag} ${label}${detail ? '  — ' + detail : ''}`);
  ok ? passed++ : failed++;
}

async function callTool(name, args) {
  const payload = {
    message: {
      type: 'tool-calls',
      toolCalls: [
        {
          id: 'tc_test_' + Math.random().toString(36).slice(2, 8),
          function: { name, arguments: args },
        },
      ],
    },
  };
  const res = await fetch(URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
  const data = await res.json();
  return data.results?.[0]?.result;
}

async function run() {
  console.log(`\n→ Target: ${URL}\n`);

  // 1. check_availability — shape check, regardless of urgency outcome
  console.log('check_availability');
  try {
    const r = await callTool('check_availability', { urgency: 'emergency' });
    log('emergency returns valid shape', typeof r?.available === 'boolean');
    if (r?.available) {
      log('available emergency has slot_id', !!r.slot_id);
      log('available emergency has technician_name', typeof r.technician_name === 'string');
      log('available emergency has window_start/end', !!r.window_start && !!r.window_end);
    } else {
      log('unavailable emergency has message', typeof r?.message === 'string');
    }
  } catch (e) {
    log('check_availability emergency', false, e.message);
  }

  // 2. scheduled — should always find something within 5 days
  try {
    const r = await callTool('check_availability', { urgency: 'scheduled' });
    log('scheduled returns a slot', r?.available === true && !!r.slot_id);
    log('slot has technician_name', typeof r?.technician_name === 'string');
    log('slot has window_start/end', !!r?.window_start && !!r?.window_end);
  } catch (e) {
    log('check_availability scheduled', false, e.message);
  }

  // 3. scheduled with skill filter
  try {
    const r = await callTool('check_availability', {
      urgency: 'scheduled',
      needed_skills: ['furnace'],
    });
    log('scheduled+furnace returns valid shape', typeof r?.available === 'boolean');
  } catch (e) {
    log('check_availability scheduled+furnace', false, e.message);
  }

  // 3. book_appointment happy path — must use a real slot_id from check_availability
  //    (format: "<technicianId>|<ISO start>"). Pre-Phase-2 the handler accepted
  //    arbitrary strings; now it validates the format and looks up the technician.
  console.log('\nbook_appointment');
  try {
    const slot = await callTool('check_availability', { urgency: 'scheduled' });
    if (!slot?.slot_id) {
      log('book_appointment happy', false, 'no slot_id from check_availability');
    } else {
      const r = await callTool('book_appointment', {
        caller_name: 'Test Caller',
        caller_phone: '5125550199',
        address: '123 Main St, Austin TX 78701',
        slot_id: slot.slot_id,
        issue: 'AC blowing warm air',
        urgency: 'same-day',
      });
      log('booking returns success=true', r?.success === true);
      log(
        'booking returns AA- confirmation_number',
        typeof r?.confirmation_number === 'string' && r.confirmation_number.startsWith('AA-')
      );
      log('booking response includes technician_name', typeof r?.technician_name === 'string');
      log(
        'booking response includes persisted flag',
        typeof r?.persisted === 'boolean'
      );
    }
  } catch (e) {
    log('book_appointment happy', false, e.message);
  }

  // 4. book_appointment missing fields
  try {
    const r = await callTool('book_appointment', { caller_name: 'No Phone' });
    log('booking with missing fields returns error', typeof r?.error === 'string' && /Missing/.test(r.error));
  } catch (e) {
    log('book_appointment missing fields', false, e.message);
  }

  // 5. escalate_to_owner
  console.log('\nescalate_to_owner');
  try {
    const r = await callTool('escalate_to_owner', {
      reason: 'gas smell from furnace',
      caller_phone: '5125550199',
      caller_name: 'Worried Caller',
    });
    log('escalation returns escalated=true', r?.escalated === true);
    log('escalation includes owner_phone', typeof r?.owner_phone === 'string');
    log('escalation message mentions reason', /gas smell/i.test(r?.message ?? ''));
  } catch (e) {
    log('escalate_to_owner', false, e.message);
  }

  // 6. get_quote_range — all 6 issue types
  console.log('\nget_quote_range (6 issue types)');
  const issueTypes = [
    'ac-not-cooling',
    'furnace-not-heating',
    'leak-or-water',
    'thermostat-not-working',
    'strange-noise',
    'maintenance-tuneup',
  ];
  for (const issue of issueTypes) {
    try {
      const r = await callTool('get_quote_range', { issue_type: issue });
      const ok =
        r &&
        typeof r === 'object' &&
        typeof r.low === 'number' &&
        typeof r.high === 'number' &&
        r.low <= r.high;
      log(issue, ok, ok ? `$${r.low}–$${r.high}` : JSON.stringify(r).slice(0, 100));
    } catch (e) {
      log(issue, false, e.message);
    }
  }

  // 7. unknown tool
  console.log('\nunknown tool');
  try {
    const r = await callTool('does_not_exist', {});
    log('returns error for unknown tool', typeof r?.error === 'string' && /Unknown tool/.test(r.error));
  } catch (e) {
    log('unknown tool', false, e.message);
  }

  // Summary
  const total = passed + failed;
  console.log(`\n${'─'.repeat(50)}`);
  if (failed === 0) {
    console.log(`\x1b[32m✓ ${passed}/${total} checks passed\x1b[0m\n`);
    process.exit(0);
  } else {
    console.log(`\x1b[31m✗ ${failed}/${total} checks failed\x1b[0m`);
    console.log(`  \x1b[32m${passed}\x1b[0m passed, \x1b[31m${failed}\x1b[0m failed\n`);
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('\n❌ Test runner crashed:', err.message);
  console.error('   Is dev server running? Try `npm run dev` in another terminal.');
  process.exit(1);
});
