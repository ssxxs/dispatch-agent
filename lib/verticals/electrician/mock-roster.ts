import type { Technician, Urgency } from '@/lib/types';
import {
  findNextAvailableSlotFrom,
  nextNDaysSlots,
  type SlotMatch,
} from '@/lib/verticals/shared-roster';

export type { SlotMatch };

export const ELECTRICIAN_TECHNICIANS: Technician[] = [
  {
    id: 'e-001',
    name: 'David Kim',
    skills: ['panel-upgrade', 'service-entrance', 'commercial', 'emergency-after-hours'],
    area: 'North Austin',
    availability: nextNDaysSlots([[0, [10, 12]]]),
  },
  {
    id: 'e-002',
    name: 'Rachel Foster',
    skills: ['ev-charger', 'tesla-certified', 'residential', 'smart-home'],
    area: 'South Austin',
    availability: nextNDaysSlots([[0, [8, 14, 16]], [1, [12]]]),
  },
  {
    id: 'e-003',
    name: 'Marcus Johnson',
    skills: ['troubleshooting', 'outlets', 'lighting', 'emergency-after-hours'],
    area: 'East Austin',
    availability: nextNDaysSlots(),
  },
  {
    id: 'e-004',
    name: 'Emma Liu',
    skills: ['fixtures', 'ceiling-fans', 'residential', 'remodel'],
    area: 'West Austin',
    availability: nextNDaysSlots([[1, [10, 14]]]),
  },
  {
    id: 'e-005',
    name: 'Hector Ruiz',
    skills: ['generator', 'transfer-switch', 'commercial', 'emergency-after-hours'],
    area: 'Round Rock',
    availability: nextNDaysSlots([[0, [8, 10, 12, 14, 16]]]),
  },
];

export function findNextAvailableSlot(
  urgency: Urgency = 'same-day',
  skills: string[] = []
): SlotMatch | null {
  return findNextAvailableSlotFrom(ELECTRICIAN_TECHNICIANS, urgency, skills);
}
