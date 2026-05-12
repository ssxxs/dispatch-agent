import type { QuoteRange } from '@/lib/types';

export const BUSINESS_HOURS = {
  weekday: { open: 8, close: 17 },
  saturday: { open: 9, close: 13 },
  sunday: null, // closed, dental emergencies route to on-call doc
} as const;

/**
 * Dental emergency keywords. Triggers `escalate_to_owner` (which in
 * dental = the on-call dentist). We err on the side of caution because
 * delayed dental trauma (knocked-out tooth, abscess) has time-critical
 * outcomes.
 */
export const EMERGENCY_KEYWORDS = [
  'knocked out',
  'knocked-out',
  'tooth fell out',
  'severe pain',
  'unbearable pain',
  'swollen face',
  'facial swelling',
  'jaw swelling',
  "bleeding won't stop",
  'bleeding wont stop',
  'abscess',
  'infection',
  'jaw broken',
  'broken jaw',
  'trauma',
  'child injury',
  'kid hit',
  'pus',
  'fever and tooth',
];

export const OWNER_AFTER_HOURS_PHONE = '+1-555-DENTIST-1'; // on-call dentist, mocked

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

/**
 * Quote ranges for common dental services. These are deliberately
 * **without insurance** — we don't have the caller's plan details on a
 * cold call. The receptionist always caveats "before insurance".
 */
export const QUOTE_RANGES: Record<string, QuoteRange> = {
  'routine-cleaning': {
    low: 80,
    high: 150,
    notes: 'Adult prophy + exam. Most insurance covers 100% twice a year.',
  },
  'filling': {
    low: 150,
    high: 450,
    notes: 'Composite filling, depends on tooth and surfaces (1-3).',
  },
  'root-canal': {
    low: 800,
    high: 1500,
    notes: 'Anterior tooth ~$800; molar ~$1500. Crown usually follows.',
  },
  'extraction': {
    low: 150,
    high: 650,
    notes: 'Simple ~$150-300; surgical / wisdom ~$400-650.',
  },
  'crown': {
    low: 800,
    high: 1500,
    notes: 'Porcelain crown, typically 2 visits.',
  },
  'emergency-visit': {
    low: 95,
    high: 300,
    notes: 'Emergency exam + xray. Treatment quoted after diagnosis.',
  },
  'whitening': {
    low: 300,
    high: 650,
    notes: 'In-office Zoom whitening or take-home trays.',
  },
  'invisalign-consult': {
    low: 0,
    high: 0,
    notes: 'Initial Invisalign consult is complimentary. Treatment typically $3000-7000.',
  },
  'pediatric-checkup': {
    low: 80,
    high: 150,
    notes: 'Kids exam + cleaning + fluoride. Most insurance covers fully.',
  },
};

export function getQuoteRange(issueType: string): QuoteRange {
  return (
    QUOTE_RANGES[issueType] ?? {
      low: 95,
      high: 300,
      notes: 'Emergency exam $95-150. Specific treatment quoted after the doctor sees you.',
    }
  );
}
