import type { QuoteRange } from '@/lib/types';

export const BUSINESS_HOURS = {
  weekday: { open: 7, close: 19 },
  saturday: { open: 8, close: 16 },
  sunday: null,
} as const;

export const EMERGENCY_KEYWORDS = [
  'flooding',
  'flood',
  'sewage',
  'sewage backup',
  'burst pipe',
  'pipe burst',
  'gas smell',
  'gas leak',
  'no water',
  'water everywhere',
  'water heater leak',
  'elderly',
  'baby',
  'newborn',
  'infant',
  'medical',
];

export const OWNER_AFTER_HOURS_PHONE = '+1-555-PLUMBER-9';

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
  'clogged-drain': {
    low: 150,
    high: 450,
    notes: 'Snake/auger common; hydro-jet for severe blockages.',
  },
  'leaking-faucet-or-fixture': {
    low: 120,
    high: 350,
    notes: 'Cartridge/washer replacement; full faucet swap higher end.',
  },
  'running-or-leaking-toilet': {
    low: 130,
    high: 400,
    notes: 'Flapper/fill-valve typical; full rebuild or wax ring on high end.',
  },
  'water-heater-issue': {
    low: 250,
    high: 1800,
    notes: 'Element/thermostat repair vs full tank replacement spans range.',
  },
  'pipe-leak': {
    low: 200,
    high: 1500,
    notes: 'Accessible pinhole patch low end; behind-wall / under-slab high end.',
  },
  'low-water-pressure': {
    low: 150,
    high: 600,
    notes: 'Aerator/regulator first; main-line investigation high end.',
  },
  'sewer-or-septic-issue': {
    low: 350,
    high: 4000,
    notes: 'Camera scope $250-$400; main line snake $400-$800; spot repair $1500+.',
  },
  'maintenance-tuneup': {
    low: 89,
    high: 199,
    notes: 'Whole-home plumbing inspection + minor adjustments.',
  },
};

export function getQuoteRange(issueType: string): QuoteRange {
  return (
    QUOTE_RANGES[issueType] ?? {
      low: 89,
      high: 600,
      notes: 'Diagnostic visit $89 weekday / $159 after-hours, repair quoted onsite.',
    }
  );
}
