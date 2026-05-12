/**
 * Vertical registry — single import surface for the chat API and demo UI.
 *
 * To add a new vertical:
 *   1. Create lib/verticals/<id>/{prompt,business-rules,mock-roster,tools}.ts
 *      following the HVAC pattern.
 *   2. Import its prompt + tools + handler here.
 *   3. Add an entry to VERTICALS below.
 *
 * The demo UI auto-discovers available verticals from this map.
 */

import { HVAC_SYSTEM_PROMPT } from './hvac/prompt';
import { HVAC_TOOLS, handleHvacTool } from './hvac/tools';
import { QUOTE_RANGES as HVAC_QUOTE_RANGES } from './hvac/business-rules';

import { PLUMBER_SYSTEM_PROMPT } from './plumber/prompt';
import { PLUMBER_TOOLS, handlePlumberTool } from './plumber/tools';
import { QUOTE_RANGES as PLUMBER_QUOTE_RANGES } from './plumber/business-rules';

import { ELECTRICIAN_SYSTEM_PROMPT } from './electrician/prompt';
import { ELECTRICIAN_TOOLS, handleElectricianTool } from './electrician/tools';
import { QUOTE_RANGES as ELECTRICIAN_QUOTE_RANGES } from './electrician/business-rules';

import type { BuiltVertical } from './build-tools';

export type VerticalId = 'hvac' | 'plumber' | 'electrician';

/**
 * Example prompts grouped by the product capability they exercise.
 * Categorized random pick = visitors always see one of each on every
 * page load, so they discover the three core flows without random
 * 3-quote-prompt accidents.
 */
export interface ExamplePromptCategories {
  emergency: string[];   // exercises escalate_to_owner safety branch
  quote: string[];       // exercises get_quote_range
  scheduling: string[];  // exercises check_availability + book_appointment
}

export interface VerticalConfig {
  id: VerticalId;
  label: string;
  emoji: string;
  businessName: string;
  agentName: string;
  greeting: string;
  systemPrompt: string;
  tools: BuiltVertical['tools'];
  handler: BuiltVertical['handler'];
  /** Whether voice mode (Vapi assistant) is configured. */
  voiceAvailable: boolean;
  /** Optional Vapi assistant id if voiceAvailable. */
  vapiAssistantIdEnv?: string;
  examplePrompts: ExamplePromptCategories;
  /** Allowed issue_type enum for get_quote_range. */
  quoteIssueTypes: string[];
}

export const VERTICALS: Record<VerticalId, VerticalConfig> = {
  hvac: {
    id: 'hvac',
    label: 'HVAC',
    emoji: '🔥',
    businessName: 'AustinAir HVAC',
    agentName: 'Riley',
    greeting: 'Thanks for calling AustinAir, this is Riley. How can I help today?',
    systemPrompt: HVAC_SYSTEM_PROMPT,
    tools: HVAC_TOOLS,
    handler: handleHvacTool,
    voiceAvailable: true,
    vapiAssistantIdEnv: 'NEXT_PUBLIC_VAPI_HVAC_ASSISTANT_ID',
    examplePrompts: {
      emergency: [
        "There's water flooding from my unit, this is an emergency!",
        "Carbon monoxide detector is going off, I think it's the furnace!",
        'Furnace just started smoking, what do I do?',
        'My elderly mom has no heat and it\u2019s freezing in here!',
      ],
      quote: [
        'How much would a leaking unit cost to fix?',
        'How much for a tune-up before summer?',
        'Need a quote on replacing a 15-year-old condenser.',
        'What does a full HVAC inspection cost for a new home buyer?',
      ],
      scheduling: [
        'My AC stopped cooling. When can someone come?',
        'Thermostat screen is blank, can someone take a look?',
        'Can someone come out tomorrow morning?',
        "AC works but it's blowing warm air upstairs only.",
      ],
    },
    quoteIssueTypes: Object.keys(HVAC_QUOTE_RANGES),
  },
  plumber: {
    id: 'plumber',
    label: 'Plumbing',
    emoji: '🚰',
    businessName: 'HillCountry Plumbing',
    agentName: 'Sam',
    greeting: "Thanks for calling HillCountry Plumbing, this is Sam. What's going on?",
    systemPrompt: PLUMBER_SYSTEM_PROMPT,
    tools: PLUMBER_TOOLS,
    handler: handlePlumberTool,
    voiceAvailable: false,
    examplePrompts: {
      emergency: [
        'Sewage is backing up into my bathtub right now!',
        'I smell gas near the water heater \u2014 emergency?',
        'Burst pipe in the wall, I shut off the main valve!',
        "There's a leak under the sink and water is everywhere!",
      ],
      quote: [
        'How much to replace a water heater?',
        'Need a quote to install a new dishwasher line.',
        'Want to upgrade to a tankless water heater, ballpark cost?',
        'How much typically for snaking a tree-root drain blockage?',
      ],
      scheduling: [
        'My kitchen drain is completely clogged.',
        'Toilet keeps running, water bill is crazy.',
        'Garbage disposal making a humming sound, no grinding.',
        'Low water pressure in the whole house since this morning.',
      ],
    },
    quoteIssueTypes: Object.keys(PLUMBER_QUOTE_RANGES),
  },
  electrician: {
    id: 'electrician',
    label: 'Electrical',
    emoji: '⚡',
    businessName: 'BoltCity Electric',
    agentName: 'Alex',
    greeting: 'Thanks for calling BoltCity Electric, this is Alex. How can I help?',
    systemPrompt: ELECTRICIAN_SYSTEM_PROMPT,
    tools: ELECTRICIAN_TOOLS,
    handler: handleElectricianTool,
    voiceAvailable: false,
    examplePrompts: {
      emergency: [
        'My outlet is sparking and I smell burning plastic!',
        'Burning smell from the electrical panel right now!',
        'Half the house just lost power, kids are home alone!',
        'I got a shock from the dryer, is that an emergency?',
      ],
      quote: [
        'How much to install a Tesla charger in my garage?',
        'Quote to upgrade my 100A panel to 200A please.',
        'How much to wire up a new hot tub on the back porch?',
        'Need an electrician to install 6 recessed lights, ballpark?',
      ],
      scheduling: [
        'A breaker keeps tripping when I run the microwave.',
        "Ceiling fan stopped working, didn't trip the breaker.",
        'Lights flickering throughout the house all evening.',
        'Want to add a 240V outlet for a new oven \u2014 schedule?',
      ],
    },
    quoteIssueTypes: Object.keys(ELECTRICIAN_QUOTE_RANGES),
  },
};

export function getVertical(id: string): VerticalConfig | null {
  return (VERTICALS as Record<string, VerticalConfig>)[id] ?? null;
}

/** Lightweight metadata for client-side use (no prompts/handlers). */
export interface VerticalMeta {
  id: VerticalId;
  label: string;
  emoji: string;
  businessName: string;
  agentName: string;
  greeting: string;
  voiceAvailable: boolean;
  examplePrompts: ExamplePromptCategories;
}

export function getVerticalMeta(id: VerticalId): VerticalMeta {
  const v = VERTICALS[id];
  return {
    id: v.id,
    label: v.label,
    emoji: v.emoji,
    businessName: v.businessName,
    agentName: v.agentName,
    greeting: v.greeting,
    voiceAvailable: v.voiceAvailable,
    examplePrompts: v.examplePrompts,
  };
}

/** Flatten the categorized prompts into a single array (for fallback / display). */
export function flattenExamplePrompts(p: ExamplePromptCategories): string[] {
  return [...p.emergency, ...p.quote, ...p.scheduling];
}

export function listVerticalsMeta(): VerticalMeta[] {
  return (Object.keys(VERTICALS) as VerticalId[]).map(getVerticalMeta);
}
