export type Vertical = 'hvac' | 'dental' | 'beauty' | 'legal' | 'moving';

export type Urgency = 'emergency' | 'same-day' | 'scheduled';

export interface TimeSlot {
  start: string; // ISO 8601
  end: string;
  booked: boolean;
  bookedBy?: string;
}

export interface Technician {
  id: string;
  name: string;
  skills: string[];
  area: string;
  availability: TimeSlot[];
}

export interface BookingRequest {
  callerName: string;
  callerPhone: string;
  address: string;
  issue: string;
  urgency: Urgency;
  slotId: string;
}

export interface BookingResult {
  confirmationNumber: string;
  technicianName: string;
  windowStart: string;
  windowEnd: string;
}

export interface QuoteRange {
  low: number;
  high: number;
  notes: string;
  currency?: 'USD';
}

export interface TranscriptEntry {
  role: 'user' | 'assistant';
  /** Words that have been finalized (will not change). */
  finalText: string;
  /** Current in-progress segment from STT (partial). Replaced on each partial event. */
  partialText: string;
  /**
   * When true, this bubble will never receive new chunks. A bubble is sealed
   * when the OTHER speaker emits a final transcript (signaling that this turn
   * is over). User finals also self-seal since user messages are atomic.
   */
  sealed: boolean;
  ts?: string;
}
