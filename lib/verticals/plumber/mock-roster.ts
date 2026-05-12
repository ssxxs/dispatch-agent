import type { Technician, Urgency } from '@/lib/types';
import {
  findNextAvailableSlotFrom,
  nextNDaysSlots,
  type SlotMatch,
} from '@/lib/verticals/shared-roster';

export type { SlotMatch };

export const PLUMBER_TECHNICIANS: Technician[] = [
  {
    id: 'p-001',
    name: 'Diego Hernandez',
    skills: ['drain-cleaning', 'sewer', 'hydro-jet', 'emergency-after-hours'],
    area: 'North Austin',
    availability: nextNDaysSlots([[0, [10, 14]]]),
  },
  {
    id: 'p-002',
    name: 'Megan O\'Brien',
    skills: ['water-heater', 'tankless', 'gas-line', 'residential'],
    area: 'South Austin',
    availability: nextNDaysSlots([[0, [8, 12, 16]]]),
  },
  {
    id: 'p-003',
    name: 'Tom Becker',
    skills: ['repipe', 'slab-leak', 'commercial', 'emergency-after-hours'],
    area: 'East Austin',
    availability: nextNDaysSlots([[1, [10, 12]], [2, [8]]]),
  },
  {
    id: 'p-004',
    name: 'Aisha Khan',
    skills: ['fixture-install', 'remodel', 'residential', 'leak-repair'],
    area: 'West Austin',
    availability: nextNDaysSlots(),
  },
  {
    id: 'p-005',
    name: 'Ryan Caldwell',
    skills: ['septic', 'sewer', 'main-line', 'emergency-after-hours'],
    area: 'Round Rock',
    availability: nextNDaysSlots([[0, [8, 10, 12, 14, 16]]]),
  },
];

export function findNextAvailableSlot(
  urgency: Urgency = 'same-day',
  skills: string[] = [],
  externalBookedIds: Set<string> = new Set()
): SlotMatch | null {
  return findNextAvailableSlotFrom(PLUMBER_TECHNICIANS, urgency, skills, externalBookedIds);
}
