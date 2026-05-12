#!/usr/bin/env node
/**
 * Idempotent Vapi assistant config sync.
 *
 * Reads:
 *   - VAPI_PRIVATE_KEY from env (set in .env.local)
 *   - NEXT_PUBLIC_VAPI_HVAC_ASSISTANT_ID from env
 *   - NEXT_PUBLIC_APP_URL from env (for serverUrl)
 *   - Local source of truth: lib/verticals/hvac/prompt.ts
 *   - Local source of truth: voice/vapi-config/hvac-assistant.json
 *
 * Run with:
 *   node --env-file=.env.local scripts/sync-vapi-assistant.mjs
 *
 * Or via npm:
 *   npm run sync:hvac
 *
 * Safe to run repeatedly. Always overwrites Vapi-side config with local truth.
 */

import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

const VAPI_PRIVATE_KEY = process.env.VAPI_PRIVATE_KEY;
const ASSISTANT_ID = process.env.NEXT_PUBLIC_VAPI_HVAC_ASSISTANT_ID;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
const SERVER_URL_OVERRIDE = process.env.VAPI_SERVER_URL; // optional explicit webhook URL (e.g. ngrok)

if (!VAPI_PRIVATE_KEY) {
  console.error('❌ VAPI_PRIVATE_KEY not set. Add it to .env.local then re-run.');
  process.exit(1);
}
if (!ASSISTANT_ID) {
  console.error('❌ NEXT_PUBLIC_VAPI_HVAC_ASSISTANT_ID not set in .env.local');
  process.exit(1);
}

/** Extract the HVAC_SYSTEM_PROMPT string literal from prompt.ts. */
async function loadSystemPrompt() {
  const path = resolve(projectRoot, 'lib/verticals/hvac/prompt.ts');
  const src = await readFile(path, 'utf-8');
  const match = src.match(/export const HVAC_SYSTEM_PROMPT\s*=\s*`([\s\S]*?)`;/);
  if (!match) {
    throw new Error('Could not extract HVAC_SYSTEM_PROMPT from prompt.ts');
  }
  return match[1];
}

/** Tool definitions in Vapi's expected format. */
function buildTools(serverUrl) {
  return [
    {
      type: 'function',
      function: {
        name: 'check_availability',
        description:
          'Find the next available HVAC appointment slot matching urgency and required skills.',
        parameters: {
          type: 'object',
          properties: {
            urgency: {
              type: 'string',
              enum: ['emergency', 'same-day', 'scheduled'],
              description: 'How quickly the caller needs service.',
            },
            needed_skills: {
              type: 'array',
              items: { type: 'string' },
              description: "Optional technician skills (e.g. ['ac-repair', 'furnace']).",
            },
          },
          required: ['urgency'],
        },
      },
      server: { url: serverUrl },
    },
    {
      type: 'function',
      function: {
        name: 'book_appointment',
        description: 'Book a confirmed HVAC appointment for the caller.',
        parameters: {
          type: 'object',
          properties: {
            caller_name: { type: 'string' },
            caller_phone: {
              type: 'string',
              description: 'Best callback number including area code.',
            },
            address: { type: 'string', description: 'Service address including ZIP.' },
            slot_id: { type: 'string', description: 'From check_availability result.' },
            issue: { type: 'string', description: 'Short description of the problem.' },
            urgency: {
              type: 'string',
              enum: ['emergency', 'same-day', 'scheduled'],
            },
          },
          required: ['caller_name', 'caller_phone', 'address', 'slot_id', 'issue', 'urgency'],
        },
      },
      server: { url: serverUrl },
    },
    {
      type: 'function',
      function: {
        name: 'escalate_to_owner',
        description:
          "EMERGENCY ONLY — gas smell, fire, sparking, no heat with vulnerable person, flooding, etc. Transfers caller to owner's mobile.",
        parameters: {
          type: 'object',
          properties: {
            reason: {
              type: 'string',
              description:
                "Precise emergency reason so the owner knows what they're walking into.",
            },
            caller_phone: { type: 'string' },
            caller_name: { type: 'string' },
          },
          required: ['reason', 'caller_phone'],
        },
      },
      server: { url: serverUrl },
    },
    {
      type: 'function',
      function: {
        name: 'get_quote_range',
        description:
          "Provide rough price range for a common HVAC issue. Always say 'approximate, technician confirms onsite'.",
        parameters: {
          type: 'object',
          properties: {
            issue_type: {
              type: 'string',
              enum: [
                'ac-not-cooling',
                'furnace-not-heating',
                'leak-or-water',
                'thermostat-not-working',
                'strange-noise',
                'maintenance-tuneup',
              ],
            },
          },
          required: ['issue_type'],
        },
      },
      server: { url: serverUrl },
    },
  ];
}

async function main() {
  const systemPrompt = await loadSystemPrompt();
  const serverUrl = SERVER_URL_OVERRIDE ?? `${APP_URL}/api/vapi-webhook`;

  if (!serverUrl.startsWith('https://') && !SERVER_URL_OVERRIDE) {
    console.warn(
      `⚠️  serverUrl is ${serverUrl} — not HTTPS. Vapi can reach localhost only if you tunnel with ngrok and set VAPI_SERVER_URL=https://<your-ngrok>.ngrok-free.app/api/vapi-webhook`
    );
  }

  const payload = {
    name: 'AustinAir HVAC Receptionist - Test',
    firstMessage: 'Thanks for calling AustinAir, this is Riley. How can I help today?',
    model: {
      provider: 'openrouter',
      model: 'openrouter/free',
      temperature: 0.5,
      messages: [{ role: 'system', content: systemPrompt }],
      tools: buildTools(serverUrl),
    },
    voice: {
      provider: 'vapi',
      voiceId: 'Elliot',
    },
    transcriber: {
      provider: 'deepgram',
      model: 'nova-2',
      language: 'en',
    },
    endCallMessage: 'Have a great day!',
    silenceTimeoutSeconds: 30,
    maxDurationSeconds: 360,
  };

  console.log(`→ PATCH https://api.vapi.ai/assistant/${ASSISTANT_ID}`);
  console.log(`  serverUrl: ${serverUrl}`);
  console.log(`  prompt length: ${systemPrompt.length} chars`);
  console.log(`  tools: ${payload.model.tools.length}`);

  const res = await fetch(`https://api.vapi.ai/assistant/${ASSISTANT_ID}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${VAPI_PRIVATE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  if (!res.ok) {
    console.error(`❌ HTTP ${res.status}`);
    console.error(text.slice(0, 1500));
    process.exit(1);
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    console.log('✓ HTTP', res.status, '(non-JSON response)');
    return;
  }

  console.log('✅ Synced.');
  console.log({
    provider: data.model?.provider,
    model: data.model?.model,
    temperature: data.model?.temperature,
    tools_count: data.model?.tools?.length ?? 0,
    first_message: data.firstMessage,
    voice: data.voice?.voiceId,
    system_msg_length: data.model?.messages?.[0]?.content?.length ?? 0,
  });
}

main().catch((err) => {
  console.error('❌ Sync failed:', err);
  process.exit(1);
});
