/**
 * HVAC tool definitions + handlers — thin wrapper around the shared
 * `buildVerticalTools` factory. Used by both `/api/vapi-webhook` and
 * `/api/chat`.
 */

import { buildVerticalTools, type ToolResult } from '../build-tools';
import { findNextAvailableSlot, HVAC_TECHNICIANS } from './mock-roster';
import {
  getQuoteRange,
  OWNER_AFTER_HOURS_PHONE,
  QUOTE_RANGES,
} from './business-rules';

const built = buildVerticalTools({
  verticalId: 'hvac',
  roster: HVAC_TECHNICIANS,
  findNextAvailableSlot,
  getQuoteRange,
  ownerPhone: OWNER_AFTER_HOURS_PHONE,
  quoteIssueTypes: Object.keys(QUOTE_RANGES),
  confirmationPrefix: 'AA',
});

export const HVAC_TOOLS = built.tools;
export const handleHvacTool = built.handler;
export type { ToolResult };
