/**
 * Plumber tool definitions + handlers — thin wrapper around the shared
 * `buildVerticalTools` factory.
 */

import { buildVerticalTools, type ToolResult } from '../build-tools';
import { findNextAvailableSlot, PLUMBER_TECHNICIANS } from './mock-roster';
import {
  getQuoteRange,
  OWNER_AFTER_HOURS_PHONE,
  QUOTE_RANGES,
} from './business-rules';

const built = buildVerticalTools({
  verticalId: 'plumber',
  roster: PLUMBER_TECHNICIANS,
  findNextAvailableSlot,
  getQuoteRange,
  ownerPhone: OWNER_AFTER_HOURS_PHONE,
  quoteIssueTypes: Object.keys(QUOTE_RANGES),
  confirmationPrefix: 'HC',
});

export const PLUMBER_TOOLS = built.tools;
export const handlePlumberTool = built.handler;
export type { ToolResult };
