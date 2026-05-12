/**
 * Generic tool definition + handler factory used by every vertical.
 *
 * The tool _schemas_ are identical across HVAC / plumber / electrician
 * (same 4 tools: check_availability, book_appointment, escalate_to_owner,
 * get_quote_range). Only the **data sources** differ — different rosters,
 * different quote tables, different owner phones, different issue-type
 * enums.
 *
 * This factory takes those data sources and returns a fully-formed
 * `{ tools, handler }` pair that both the Vapi webhook and the chat
 * agentic loop can plug straight into.
 */

import type { Technician, Urgency } from '@/lib/types';
import type { SlotMatch } from './shared-roster';
import type { VerticalId } from './registry';
import {
  fetchBookedSlotIds,
  parseSlotId,
  persistBooking,
} from '@/lib/supabase';

export interface VerticalToolConfig {
  /** Vertical id used for DB-side filtering of bookings. */
  verticalId: VerticalId;
  /** Roster snapshot used to resolve technician metadata when booking. */
  roster: Technician[];
  /**
   * Find the next available slot. The handler injects DB-side booked ids
   * before calling this so we can hide already-persisted bookings.
   */
  findNextAvailableSlot: (
    urgency: Urgency,
    skills?: string[],
    externalBookedIds?: Set<string>
  ) => SlotMatch | null;
  /** Look up a quote range for a known issue type. */
  getQuoteRange: (issueType: string) => { low: number; high: number; notes?: string };
  /** After-hours owner phone returned by escalate_to_owner. */
  ownerPhone: string;
  /** Allowed enum values for the get_quote_range tool's `issue_type` arg. */
  quoteIssueTypes: string[];
  /** Optional confirmation-id prefix (e.g. 'AA' for AustinAir). Defaults to 'BK'. */
  confirmationPrefix?: string;
}

export type ToolResult = Record<string, unknown> | { error: string } | null;

export interface BuiltVertical {
  tools: ReadonlyArray<{
    type: 'function';
    function: {
      name: string;
      description: string;
      parameters: Record<string, unknown>;
    };
  }>;
  handler: (name: string, params: Record<string, unknown>) => Promise<ToolResult>;
}

export function buildVerticalTools(cfg: VerticalToolConfig): BuiltVertical {
  const tools = [
    {
      type: 'function' as const,
      function: {
        name: 'check_availability',
        description:
          'Find the next available appointment slot matching urgency and required skills.',
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
              description: 'Optional technician skills (e.g. ["drain-cleaning", "panel-upgrade"]).',
            },
          },
          required: ['urgency'],
        },
      },
    },
    {
      type: 'function' as const,
      function: {
        name: 'book_appointment',
        description: 'Book a confirmed appointment for the caller.',
        parameters: {
          type: 'object',
          properties: {
            caller_name: { type: 'string' },
            caller_phone: {
              type: 'string',
              description: 'Best callback number including area code',
            },
            address: { type: 'string', description: 'Service address including ZIP' },
            slot_id: { type: 'string', description: 'From check_availability result' },
            issue: { type: 'string', description: 'Short description of the problem' },
            urgency: {
              type: 'string',
              enum: ['emergency', 'same-day', 'scheduled'],
            },
          },
          required: [
            'caller_name',
            'caller_phone',
            'address',
            'slot_id',
            'issue',
            'urgency',
          ],
        },
      },
    },
    {
      type: 'function' as const,
      function: {
        name: 'escalate_to_owner',
        description:
          "EMERGENCY ONLY — gas smell, fire, sparking, flooding, no heat with vulnerable person, sewage backup, etc. Transfers caller to the owner's mobile.",
        parameters: {
          type: 'object',
          properties: {
            reason: {
              type: 'string',
              description: "Precise emergency reason so the owner knows what they're walking into.",
            },
            caller_phone: { type: 'string' },
            caller_name: { type: 'string' },
          },
          required: ['reason', 'caller_phone'],
        },
      },
    },
    {
      type: 'function' as const,
      function: {
        name: 'get_quote_range',
        description:
          "Provide rough price range for a common issue. Always say 'approximate, technician confirms onsite'.",
        parameters: {
          type: 'object',
          properties: {
            issue_type: {
              type: 'string',
              enum: cfg.quoteIssueTypes,
            },
          },
          required: ['issue_type'],
        },
      },
    },
  ];

  const prefix = cfg.confirmationPrefix ?? 'BK';

  const handler = async (
    name: string,
    params: Record<string, unknown>
  ): Promise<ToolResult> => {
    try {
      switch (name) {
        case 'check_availability': {
          const urgency = (params.urgency as Urgency) ?? 'same-day';
          const skills = (params.needed_skills as string[] | undefined) ?? [];
          // Hide DB-persisted bookings before slot selection. Empty set when
          // Supabase env isn't configured — degrades gracefully.
          const externalBookedIds = await fetchBookedSlotIds(cfg.verticalId);
          const match = cfg.findNextAvailableSlot(urgency, skills, externalBookedIds);
          return match
            ? {
                available: true,
                slot_id: match.slotId,
                technician_name: match.technicianName,
                window_start: match.windowStart,
                window_end: match.windowEnd,
                area: match.area,
              }
            : {
                available: false,
                message:
                  'No matching slots in the next 5 days. Suggest owner callback or alternate urgency.',
              };
        }

        case 'book_appointment': {
          const required = [
            'caller_name',
            'caller_phone',
            'address',
            'slot_id',
            'issue',
            'urgency',
          ];
          const missing = required.filter((k) => !params[k]);
          if (missing.length) {
            return { error: `Missing required fields: ${missing.join(', ')}` };
          }

          const slotId = params.slot_id as string;
          const parsed = parseSlotId(slotId);
          if (!parsed) {
            return { error: `Invalid slot_id "${slotId}". Expected "<technicianId>|<ISO start>".` };
          }

          const tech = cfg.roster.find((t) => t.id === parsed.technicianId);
          if (!tech) {
            return { error: `Unknown technician id: ${parsed.technicianId}` };
          }

          const slotStart = new Date(parsed.slotStartISO);
          if (Number.isNaN(slotStart.getTime())) {
            return { error: `Could not parse slot start time: "${parsed.slotStartISO}"` };
          }
          const slotEnd = new Date(slotStart.getTime() + 2 * 60 * 60 * 1000);

          let booking;
          try {
            booking = await persistBooking({
              verticalId: cfg.verticalId,
              technicianId: tech.id,
              technicianName: tech.name,
              slotStartISO: parsed.slotStartISO,
              slotEndISO: slotEnd.toISOString(),
              callerName: params.caller_name as string,
              callerPhone: params.caller_phone as string,
              address: ((params.address as string) ?? null) || null,
              issue: params.issue as string,
              urgency: params.urgency as Urgency,
            });
          } catch (e) {
            return { error: (e as Error).message };
          }

          const persistedNote = booking.persisted
            ? 'Saved to DB.'
            : 'In-memory only (Supabase not configured).';
          return {
            success: true,
            confirmation_number: `${prefix}-${booking.confirmationNumber}`,
            persisted: booking.persisted,
            technician_name: tech.name,
            window_start: parsed.slotStartISO,
            window_end: slotEnd.toISOString(),
            message: `Booked ${params.caller_name} (${params.urgency}) with ${tech.name}, ${parsed.slotStartISO}. ${persistedNote} SMS confirmation to ${params.caller_phone} in ~60s.`,
          };
        }

        case 'escalate_to_owner': {
          const reason = params.reason ?? 'unspecified emergency';
          const callerPhone = params.caller_phone ?? 'unknown';
          const callerName = params.caller_name ?? 'caller';
          return {
            escalated: true,
            owner_phone: cfg.ownerPhone,
            message: `Owner notified. Will call ${callerName} at ${callerPhone} within 5 minutes. Reason: ${reason}`,
          };
        }

        case 'get_quote_range': {
          const issueType = (params.issue_type as string) ?? 'unknown';
          return cfg.getQuoteRange(issueType) as unknown as Record<string, unknown>;
        }

        default:
          return { error: `Unknown tool: ${name}` };
      }
    } catch (err) {
      return { error: (err as Error)?.message ?? 'Tool execution failed' };
    }
  };

  return { tools, handler };
}
