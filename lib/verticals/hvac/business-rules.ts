import type { QuoteRange } from '@/lib/types';

export const BUSINESS_HOURS = {
  weekday: { open: 8, close: 18 },
  saturday: { open: 9, close: 14 },
  sunday: null, // closed, emergencies only
} as const;

export const EMERGENCY_KEYWORDS = [
  'gas smell',
  'gas leak',
  'carbon monoxide',
  'sparking',
  'smoke',
  'fire',
  'burning smell',
  'water leak',
  'water leaking',
  'flooding',
  'elderly',
  'baby',
  'newborn',
  'infant',
  'medical',
];

export const OWNER_AFTER_HOURS_PHONE = '+1-555-OWNER-01'; // mocked for demo

export function detectsEmergency(text: string): boolean {
  const lower = text.toLowerCase();
  return EMERGENCY_KEYWORDS.some((kw) => lower.includes(kw));
}

export function isWithinBusinessHours(date: Date = new Date()): boolean {
  const day = date.getDay();
  const hour = date.getHours();
  if (day === 0) return false;
  if (day === 6) {
    return hour >= BUSINESS_HOURS.saturday.open && hour < BUSINESS_HOURS.saturday.close;
  }
  return hour >= BUSINESS_HOURS.weekday.open && hour < BUSINESS_HOURS.weekday.close;
}

export const QUOTE_RANGES: Record<string, QuoteRange> = {
  'ac-not-cooling': {
    low: 150,
    high: 600,
    notes: 'Diagnostic $99, parts and labor vary by cause.',
  },
  'furnace-not-heating': {
    low: 200,
    high: 800,
    notes: 'Igniter ~$300, blower motor ~$700.',
  },
  'leak-or-water': {
    low: 250,
    high: 1500,
    notes: 'Condensate clog cheap; coil leak repair vs replacement spans range.',
  },
  'thermostat-not-working': {
    low: 120,
    high: 400,
    notes: 'Basic replacement ~$150; smart thermostat ~$300.',
  },
  'strange-noise': {
    low: 150,
    high: 700,
    notes: 'Diagnostic visit + likely capacitor or motor.',
  },
  'maintenance-tuneup': {
    low: 99,
    high: 199,
    notes: 'Seasonal service, single system.',
  },
};

export function getQuoteRange(issueType: string): QuoteRange {
  return (
    QUOTE_RANGES[issueType] ?? {
      low: 99,
      high: 500,
      notes: 'Diagnostic visit $99, repair quoted onsite by technician.',
    }
  );
}
