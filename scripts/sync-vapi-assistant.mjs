#!/usr/bin/env node
/**
 * Idempotent Vapi assistant config sync — supports all four verticals.
 *
 * Usage:
 *   npm run sync:hvac
 *   npm run sync:plumber
 *   npm run sync:electrician
 *   npm run sync:dental
 *
 * Or directly:
 *   node --env-file=.env.local scripts/sync-vapi-assistant.mjs <vertical>
 *
 * Behavior:
 *   - If NEXT_PUBLIC_VAPI_<VERTICAL>_ASSISTANT_ID is set → PATCH that assistant.
 *   - If not set → POST /assistant to create one, then print the new id for
 *     you to paste into .env.local + your hosting provider env.
 *
 * Requires:
 *   VAPI_PRIVATE_KEY           in .env.local
 *   NEXT_PUBLIC_APP_URL        optional; defaults to http://localhost:3000
 *   VAPI_SERVER_URL            optional; explicit webhook URL (e.g. ngrok tunnel)
 *
 * Sources of truth:
 *   - lib/verticals/<id>/prompt.ts          → system prompt
 *   - lib/verticals/<id>/business-rules.ts  → QUOTE_RANGES keys for the
 *                                              get_quote_range tool enum
 */

import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

// ───────────────────────────────────────────────────────────────────────────
// Per-vertical metadata. The script can't import the TS registry directly
// (it's an .mjs), so we keep a small mirror here. Keep in sync with
// lib/verticals/registry.ts when verticals are added or renamed.
// ───────────────────────────────────────────────────────────────────────────

const VERTICALS = {
  hvac: {
    label: 'HVAC',
    businessName: 'AustinAir HVAC',
    agentName: 'Riley',
    firstMessage: 'Thanks for calling AustinAir, this is Riley. How can I help today?',
    voiceProvider: 'vapi',
    voiceId: 'Elliot',
    promptVar: 'HVAC_SYSTEM_PROMPT',
    promptPath: 'lib/verticals/hvac/prompt.ts',
    rulesPath: 'lib/verticals/hvac/business-rules.ts',
    assistantIdEnv: 'NEXT_PUBLIC_VAPI_HVAC_ASSISTANT_ID',
    serviceWord: 'HVAC',
    technicianWord: 'technician',
    emergencyExamples:
      'gas smell, fire, sparking, no heat with vulnerable person, flooding',
  },
  plumber: {
    label: 'Plumbing',
    businessName: 'HillCountry Plumbing',
    agentName: 'Sam',
    firstMessage: "Thanks for calling HillCountry Plumbing, this is Sam. What's going on?",
    voiceProvider: 'vapi',
    voiceId: 'Cole',
    promptVar: 'PLUMBER_SYSTEM_PROMPT',
    promptPath: 'lib/verticals/plumber/prompt.ts',
    rulesPath: 'lib/verticals/plumber/business-rules.ts',
    assistantIdEnv: 'NEXT_PUBLIC_VAPI_PLUMBER_ASSISTANT_ID',
    serviceWord: 'plumbing',
    technicianWord: 'plumber',
    emergencyExamples: 'gas leak, sewage backup, burst pipe, major flooding',
  },
  electrician: {
    label: 'Electrical',
    businessName: 'BoltCity Electric',
    agentName: 'Alex',
    firstMessage: 'Thanks for calling BoltCity Electric, this is Alex. How can I help?',
    voiceProvider: 'vapi',
    voiceId: 'Harry',
    promptVar: 'ELECTRICIAN_SYSTEM_PROMPT',
    promptPath: 'lib/verticals/electrician/prompt.ts',
    rulesPath: 'lib/verticals/electrician/business-rules.ts',
    assistantIdEnv: 'NEXT_PUBLIC_VAPI_ELECTRICIAN_ASSISTANT_ID',
    serviceWord: 'electrical',
    technicianWord: 'electrician',
    emergencyExamples:
      'sparking outlet, burning smell from panel, electrical shock, panel fire',
  },
  dental: {
    label: 'Dental',
    businessName: 'BrightSmile Dental',
    agentName: 'Jordan',
    firstMessage:
      'Thanks for calling BrightSmile Dental, this is Jordan. How can I help today?',
    voiceProvider: 'vapi',
    voiceId: 'Lily',
    promptVar: 'DENTAL_SYSTEM_PROMPT',
    promptPath: 'lib/verticals/dental/prompt.ts',
    rulesPath: 'lib/verticals/dental/business-rules.ts',
    assistantIdEnv: 'NEXT_PUBLIC_VAPI_DENTAL_ASSISTANT_ID',
    serviceWord: 'dental',
    technicianWord: 'dentist',
    emergencyExamples:
      'knocked-out tooth, severe facial swelling, uncontrolled bleeding, jaw trauma',
  },
};

// ───────────────────────────────────────────────────────────────────────────
// Argument parsing
// ───────────────────────────────────────────────────────────────────────────

const verticalArg = process.argv[2] ?? 'hvac';
const cfg = VERTICALS[verticalArg];

if (!cfg) {
  console.error(
    `\u274c Unknown vertical: "${verticalArg}". Valid options: ${Object.keys(VERTICALS).join(', ')}`
  );
  process.exit(1);
}

const VAPI_PRIVATE_KEY = process.env.VAPI_PRIVATE_KEY;
const ASSISTANT_ID = process.env[cfg.assistantIdEnv];
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
const SERVER_URL_OVERRIDE = process.env.VAPI_SERVER_URL;

if (!VAPI_PRIVATE_KEY) {
  console.error('\u274c VAPI_PRIVATE_KEY not set. Add it to .env.local then re-run.');
  process.exit(1);
}

// ───────────────────────────────────────────────────────────────────────────
// Source extraction (prompt + quote issue types from TS files)
// ───────────────────────────────────────────────────────────────────────────

async function loadSystemPrompt() {
  const path = resolve(projectRoot, cfg.promptPath);
  const src = await readFile(path, 'utf-8');
  const re = new RegExp(`export const ${cfg.promptVar}\\s*=\\s*\`([\\s\\S]*?)\`;`);
  const match = src.match(re);
  if (!match) {
    throw new Error(`Could not extract ${cfg.promptVar} from ${cfg.promptPath}`);
  }
  return match[1];
}

async function loadQuoteIssueTypes() {
  const path = resolve(projectRoot, cfg.rulesPath);
  const src = await readFile(path, 'utf-8');
  // Match the QUOTE_RANGES object literal block
  const block = src.match(/export const QUOTE_RANGES[^=]*=\s*\{([\s\S]*?)\};/);
  if (!block) {
    throw new Error(`Could not find QUOTE_RANGES block in ${cfg.rulesPath}`);
  }
  // Extract single-quoted keys (e.g. 'ac-not-cooling':)
  const keys = [...block[1].matchAll(/['"]([\w-]+)['"]\s*:/g)].map((m) => m[1]);
  if (keys.length === 0) {
    throw new Error(`No issue type keys parsed from QUOTE_RANGES in ${cfg.rulesPath}`);
  }
  return keys;
}

// ───────────────────────────────────────────────────────────────────────────
// Tool definitions (vertical-specific descriptions, shared schema shape)
// ───────────────────────────────────────────────────────────────────────────

function buildTools(serverUrl, quoteIssueTypes) {
  const { serviceWord, technicianWord, emergencyExamples } = cfg;
  return [
    {
      type: 'function',
      function: {
        name: 'check_availability',
        description: `Find the next available ${serviceWord} appointment slot matching urgency and required skills.`,
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
              description: `Optional ${technicianWord} skills.`,
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
        description: `Book a confirmed ${serviceWord} appointment for the caller.`,
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
        description: `EMERGENCY ONLY \u2014 ${emergencyExamples}, etc. Transfers caller to owner's mobile. You MUST collect caller_name and caller_phone BEFORE calling this tool \u2014 never invent a name.`,
        parameters: {
          type: 'object',
          properties: {
            reason: {
              type: 'string',
              description:
                "Precise emergency reason so the owner knows what they're walking into.",
            },
            caller_phone: { type: 'string' },
            caller_name: {
              type: 'string',
              description:
                "The caller's name as they provided it. Required. Do NOT invent or guess a name \u2014 ask the caller first if you don't have it.",
            },
          },
          required: ['reason', 'caller_phone', 'caller_name'],
        },
      },
      server: { url: serverUrl },
    },
    {
      type: 'function',
      function: {
        name: 'get_quote_range',
        description: `Provide rough price range for a common ${serviceWord} issue. Always say 'approximate, ${technicianWord} confirms onsite'.`,
        parameters: {
          type: 'object',
          properties: {
            issue_type: {
              type: 'string',
              enum: quoteIssueTypes,
            },
          },
          required: ['issue_type'],
        },
      },
      server: { url: serverUrl },
    },
  ];
}

// ───────────────────────────────────────────────────────────────────────────
// Main
// ───────────────────────────────────────────────────────────────────────────

async function main() {
  const [systemPrompt, quoteIssueTypes] = await Promise.all([
    loadSystemPrompt(),
    loadQuoteIssueTypes(),
  ]);
  const serverUrl = SERVER_URL_OVERRIDE ?? `${APP_URL}/api/vapi-webhook`;

  if (!serverUrl.startsWith('https://') && !SERVER_URL_OVERRIDE) {
    console.warn(
      `\u26a0\ufe0f  serverUrl is ${serverUrl} \u2014 not HTTPS. Vapi can reach localhost only via an ngrok tunnel; set VAPI_SERVER_URL=https://<your-ngrok>.ngrok-free.app/api/vapi-webhook`
    );
  }

  const payload = {
    name: `${cfg.businessName} Receptionist`,
    firstMessage: cfg.firstMessage,
    model: {
      provider: 'groq',
      // Groq LPU: ultra-low latency, native function calling, free tier.
      // Vapi calls Groq from its own US servers — no geo-block issue.
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
      messages: [{ role: 'system', content: systemPrompt }],
      tools: buildTools(serverUrl, quoteIssueTypes),
    },
    voice: {
      provider: cfg.voiceProvider,
      voiceId: cfg.voiceId,
    },
    transcriber: {
      provider: 'deepgram',
      model: 'nova-2',
      language: 'en',
    },
    endCallMessage: 'Have a great day!',
    // Production default 30s. Override via env when recording demos so injected
    // messages have time to flow without Vapi ejecting on silence.
    silenceTimeoutSeconds: Number(process.env.VAPI_SILENCE_TIMEOUT_SECONDS ?? 30),
    maxDurationSeconds: Number(process.env.VAPI_MAX_DURATION_SECONDS ?? 360),
  };

  const isCreate = !ASSISTANT_ID;
  const url = isCreate
    ? 'https://api.vapi.ai/assistant'
    : `https://api.vapi.ai/assistant/${ASSISTANT_ID}`;
  const method = isCreate ? 'POST' : 'PATCH';

  console.log(
    `\u2192 ${method} ${url}` +
      (isCreate ? ' (CREATE \u2014 no assistant id env var set)' : '')
  );
  console.log(`  vertical:      ${verticalArg} (${cfg.label})`);
  console.log(`  serverUrl:     ${serverUrl}`);
  console.log(`  voice:         ${cfg.voiceProvider}/${cfg.voiceId}`);
  console.log(`  prompt length: ${systemPrompt.length} chars`);
  console.log(`  tools:         ${payload.model.tools.length}`);
  console.log(`  quote issues:  ${quoteIssueTypes.length} (${quoteIssueTypes.slice(0, 3).join(', ')}\u2026)`);

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${VAPI_PRIVATE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  if (!res.ok) {
    console.error(`\u274c HTTP ${res.status}`);
    console.error(text.slice(0, 1500));
    process.exit(1);
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    console.log('\u2713 HTTP', res.status, '(non-JSON response)');
    return;
  }

  if (isCreate) {
    console.log('\n\u2705 Created assistant.');
    console.log(`\nAdd this line to .env.local AND your Vercel env vars:`);
    console.log(`  ${cfg.assistantIdEnv}=${data.id}\n`);
    console.log(`Then redeploy and the ${cfg.label} demo voice tab will light up.`);
  } else {
    console.log('\u2705 Synced.');
  }

  console.log({
    id: data.id,
    name: data.name,
    provider: data.model?.provider,
    model: data.model?.model,
    temperature: data.model?.temperature,
    tools_count: data.model?.tools?.length ?? 0,
    first_message: data.firstMessage,
    voice: `${data.voice?.provider}/${data.voice?.voiceId}`,
    system_msg_length: data.model?.messages?.[0]?.content?.length ?? 0,
  });
}

main().catch((err) => {
  console.error('\u274c Sync failed:', err);
  process.exit(1);
});
