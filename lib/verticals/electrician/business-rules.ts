import type { QuoteRange } from '@/lib/types';

export const BUSINESS_HOURS = {
  weekday: { open: 7, close: 18 },
  saturday: { open: 8, close: 14 },
  sunday: null,
} as const;

export const EMERGENCY_KEYWORDS = [
  'sparking',
  'sparks',
  'smoke',
  'fire',
  'burning smell',
  'burning',
  'melting',
  'shock',
  'shocked',
  'electrocuted',
  'buzzing panel',
  'hot panel',
  'hot breaker',
  'no power',
  'power out',
  'panel damage',
  'meter damage',
  'mast down',
  'elderly',
  'baby',
  'newborn',
  'infant',
  'medical',
  'oxygen',
];

export const OWNER_AFTER_HOURS_PHONE = '+1-555-VOLTAGE-1';

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
  'tripping-breaker': {
    low: 150,
    high: 500,
    notes: 'Diagnose load vs faulty breaker; replace breaker low end, circuit rewire high end.',
  },
  'outlet-not-working': {
    low: 120,
    high: 350,
    notes: 'GFCI reset / outlet replacement common; wiring fault on high end.',
  },
  'flickering-lights': {
    low: 150,
    high: 600,
    notes: 'Loose connection or failing dimmer typical; neutral issue high end.',
  },
  'panel-upgrade': {
    low: 1800,
    high: 4500,
    notes: 'Permit + meter + main service. Site visit required for accurate quote.',
  },
  'ev-charger-install': {
    low: 800,
    high: 2200,
    notes: 'Dedicated 240V circuit. Distance from panel drives cost.',
  },
  'ceiling-fan-or-fixture-install': {
    low: 150,
    high: 450,
    notes: 'Existing box low end; new circuit + box on high end.',
  },
  'whole-home-inspection': {
    low: 199,
    high: 399,
    notes: 'Full panel + outlet + GFCI/AFCI compliance check.',
  },
  'maintenance-tuneup': {
    low: 99,
    high: 199,
    notes: 'Outlet tightening, breaker test, panel torque check.',
  },
};

export function getQuoteRange(issueType: string): QuoteRange {
  return (
    QUOTE_RANGES[issueType] ?? {
      low: 99,
      high: 600,
      notes: 'Diagnostic $99 weekday / $199 after-hours, repair quoted onsite.',
    }
  );
}
