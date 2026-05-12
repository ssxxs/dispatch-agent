/**
 * Electrician tool definitions + handlers — thin wrapper around the
 * shared `buildVerticalTools` factory.
 */

import { buildVerticalTools, type ToolResult } from '../build-tools';
import { findNextAvailableSlot } from './mock-roster';
import {
  getQuoteRange,
  OWNER_AFTER_HOURS_PHONE,
  QUOTE_RANGES,
} from './business-rules';

const built = buildVerticalTools({
  findNextAvailableSlot,
  getQuoteRange,
  ownerPhone: OWNER_AFTER_HOURS_PHONE,
  quoteIssueTypes: Object.keys(QUOTE_RANGES),
  confirmationPrefix: 'BC',
});

export const ELECTRICIAN_TOOLS = built.tools;
export const handleElectricianTool = built.handler;
export type { ToolResult };
