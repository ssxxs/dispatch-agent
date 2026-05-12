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
  examplePrompts: string[];
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
    examplePrompts: [
      'My AC stopped cooling. When can someone come?',
      'How much would a leaking unit cost to fix?',
      "There's water flooding from my unit, this is an emergency!",
    ],
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
    examplePrompts: [
      'My kitchen drain is completely clogged.',
      'How much to replace a water heater?',
      'Sewage is backing up into my bathtub right now!',
    ],
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
    examplePrompts: [
      'A breaker keeps tripping when I run the microwave.',
      'How much to install a Tesla charger in my garage?',
      'My outlet is sparking and I smell burning plastic!',
    ],
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
  examplePrompts: string[];
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

export function listVerticalsMeta(): VerticalMeta[] {
  return (Object.keys(VERTICALS) as VerticalId[]).map(getVerticalMeta);
}
