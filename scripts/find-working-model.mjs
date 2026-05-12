#!/usr/bin/env node
/**
 * Find a working free OpenRouter model for the chat demo.
 *
 * Why: the default `openrouter/free` auto-router has been picking models
 * hosted by Venice (z-ai/glm-4.5-air, meta-llama/llama-3.3-70b) which
 * are currently rate-limited. We want a free model on a DIFFERENT
 * provider that:
 *   1. Returns a non-429 response
 *   2. Supports tool calling (function calls)
 *   3. Responds reasonably fast for the demo
 *
 * Run:
 *   node --env-file=.env.local scripts/find-working-model.mjs
 */

const KEY = process.env.OPENROUTER_API_KEY;
if (!KEY) {
  console.error('Missing OPENROUTER_API_KEY in env. Run with --env-file=.env.local');
  process.exit(1);
}

// Candidates spanning different upstream providers, ordered by likely demo quality.
const candidates = [
  'openai/gpt-oss-120b:free',
  'openai/gpt-oss-20b:free',
  'google/gemma-4-31b-it:free',
  'qwen/qwen3-next-80b-a3b-instruct:free',
  'nvidia/nemotron-nano-9b-v2:free',
  'minimax/minimax-m2.5:free',
  'baidu/cobuddy:free',
];

// A minimal tool-calling smoke test: prompt that should trigger the tool.
const tool = {
  type: 'function',
  function: {
    name: 'get_quote_range',
    description: 'Provide a rough price range for a known service issue.',
    parameters: {
      type: 'object',
      properties: {
        issue_type: {
          type: 'string',
          enum: ['water-heater-issue', 'ac-not-cooling', 'tripping-breaker'],
        },
      },
      required: ['issue_type'],
    },
  },
};

const messages = [
  { role: 'system', content: 'You are a service-business receptionist. When asked about pricing, call get_quote_range.' },
  { role: 'user', content: 'How much to replace a water heater?' },
];

async function probe(model) {
  const t0 = Date.now();
  let res, text;
  try {
    res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        tools: [tool],
        max_tokens: 60,
      }),
      signal: AbortSignal.timeout(25_000),
    });
    text = await res.text();
  } catch (e) {
    return { model, status: 'NETWORK_ERR', ms: Date.now() - t0, err: e.message };
  }
  const ms = Date.now() - t0;

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return { model, status: res.status, ms, err: text.slice(0, 120) };
  }

  if (data.error) {
    const code = data.error.code ?? res.status;
    const raw = data.error?.metadata?.raw ?? '';
    return {
      model,
      status: code,
      ms,
      provider: data.error?.metadata?.provider_name,
      err: data.error.message?.slice(0, 80),
      raw: raw.slice(0, 100),
    };
  }

  const choice = data.choices?.[0]?.message;
  const toolCalls = choice?.tool_calls ?? [];
  const content = choice?.content ?? '';
  return {
    model,
    status: 'OK',
    ms,
    toolFired: toolCalls.length > 0 ? toolCalls[0].function?.name : null,
    contentPreview: content.slice(0, 60),
  };
}

console.log(`Probing ${candidates.length} free tool-capable models…\n`);
const results = [];
for (const m of candidates) {
  process.stdout.write(`  ${m.padEnd(50)} `);
  const r = await probe(m);
  results.push(r);
  if (r.status === 'OK') {
    console.log(`✅ ${r.ms}ms  tool=${r.toolFired ?? '(none, plain reply)'}`);
  } else {
    const why = r.raw || r.err || '';
    console.log(`❌ ${r.status} ${r.ms}ms  ${why.slice(0, 80)}`);
  }
}

console.log('\n──── Summary ────');
const working = results.filter((r) => r.status === 'OK');
console.log(`Working: ${working.length}/${results.length}`);
if (working.length === 0) {
  console.log('All probed models are unavailable right now. Wait and retry, or top up OpenRouter.');
  process.exit(1);
}
const fastest = working.sort((a, b) => a.ms - b.ms)[0];
const withTool = working.filter((r) => r.toolFired);
console.log(`Fastest:          ${fastest.model} (${fastest.ms}ms)`);
if (withTool.length) {
  const fastestTool = withTool.sort((a, b) => a.ms - b.ms)[0];
  console.log(`Fastest w/ tool:  ${fastestTool.model} (${fastestTool.ms}ms)`);
  console.log(`\nRecommended OPENROUTER_MODEL=${fastestTool.model}`);
} else {
  console.log('⚠️  None of the working models actually fired the tool on this prompt.');
  console.log(`    Best bet anyway: ${fastest.model}`);
  console.log(`\nOPENROUTER_MODEL=${fastest.model}  (manual tool-fire verification needed)`);
}
