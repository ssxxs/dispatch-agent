/**
 * Dental tool definitions + handlers — thin wrapper around the shared
 * `buildVerticalTools` factory. Used by both `/api/vapi-webhook` and
 * `/api/chat`.
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
  confirmationPrefix: 'BS',
});

export const DENTAL_TOOLS = built.tools;
export const handleDentalTool = built.handler;
export type { ToolResult };
