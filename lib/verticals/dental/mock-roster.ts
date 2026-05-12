import type { Technician, Urgency } from '@/lib/types';
import {
  findNextAvailableSlotFrom,
  nextNDaysSlots,
  type SlotMatch,
} from '@/lib/verticals/shared-roster';

export type { SlotMatch };

/**
 * Dentists at BrightSmile Dental. We reuse the `Technician` shape from
 * the shared roster — semantically `name` is the dentist, `skills` are
 * the procedures they perform, `area` is the office location (a small
 * practice has 2-3 locations).
 */
export const DENTAL_TECHNICIANS: Technician[] = [
  {
    id: 'd-001',
    name: 'Dr. Anya Reyes',
    skills: [
      'cleaning',
      'filling',
      'crown',
      'whitening',
      'emergency-toothache',
      'general',
    ],
    area: 'North Austin',
    availability: nextNDaysSlots([[0, [9, 11, 14]]]),
  },
  {
    id: 'd-002',
    name: 'Dr. Marcus Chen',
    skills: ['root-canal', 'extraction', 'oral-surgery', 'emergency-toothache'],
    area: 'South Austin',
    availability: nextNDaysSlots([[0, [10, 13]], [1, [9, 11]]]),
  },
  {
    id: 'd-003',
    name: 'Dr. Sofia Martinez',
    skills: ['pediatric', 'cleaning', 'filling', 'fluoride'],
    area: 'Cedar Park',
    availability: nextNDaysSlots([[0, [9, 10, 11, 14, 15]]]),
  },
  {
    id: 'd-004',
    name: 'Dr. Liam O\u2019Brien',
    skills: ['invisalign', 'orthodontics', 'whitening', 'crown', 'cosmetic'],
    area: 'West Austin',
    availability: nextNDaysSlots(),
  },
  {
    id: 'd-005',
    name: 'Dr. Priya Sharma',
    skills: [
      'cleaning',
      'filling',
      'crown',
      'periodontal',
      'general',
      'emergency-toothache',
    ],
    area: 'Round Rock',
    availability: nextNDaysSlots([[1, [9, 11, 14]]]),
  },
  {
    id: 'd-006',
    name: 'Dr. James Park',
    skills: ['oral-surgery', 'extraction', 'wisdom-teeth', 'implants'],
    area: 'East Austin',
    availability: nextNDaysSlots([[2, [10, 13, 15]]]),
  },
];

/**
 * Find the next dental slot matching urgency + optional procedure skills.
 * Returns null if nothing fits (caller will be put on a callback list).
 */
export function findNextAvailableSlot(
  urgency: Urgency = 'same-day',
  skills: string[] = []
): SlotMatch | null {
  return findNextAvailableSlotFrom(DENTAL_TECHNICIANS, urgency, skills);
}
