import type { Technician, Urgency } from '@/lib/types';
import {
  findNextAvailableSlotFrom,
  nextNDaysSlots,
  type SlotMatch,
} from '@/lib/verticals/shared-roster';

export type { SlotMatch };

export const HVAC_TECHNICIANS: Technician[] = [
  {
    id: 't-001',
    name: 'Mike Sullivan',
    skills: ['ac-repair', 'emergency-after-hours', 'commercial', 'heat-pumps'],
    area: 'North Austin',
    availability: nextNDaysSlots([[0, [8, 10, 14]]]),
  },
  {
    id: 't-002',
    name: 'Linda Park',
    skills: ['furnace', 'duct-cleaning', 'residential', 'mini-splits'],
    area: 'South Austin',
    availability: nextNDaysSlots([[0, [8, 12]], [1, [10]]]),
  },
  {
    id: 't-003',
    name: 'Carlos Mendez',
    skills: ['refrigeration', 'commercial', 'emergency-after-hours'],
    area: 'East Austin',
    availability: nextNDaysSlots([[0, [8, 10, 12, 14, 16]]]),
  },
  {
    id: 't-004',
    name: 'Sarah Chen',
    skills: ['thermostat', 'smart-home', 'residential', 'ac-repair'],
    area: 'West Austin',
    availability: nextNDaysSlots(),
  },
  {
    id: 't-005',
    name: 'James Wright',
    skills: ['heat-pumps', 'gas-furnace', 'emergency-after-hours', 'furnace'],
    area: 'Round Rock',
    availability: nextNDaysSlots([[2, [8, 10, 12]]]),
  },
  {
    id: 't-006',
    name: 'Priya Patel',
    skills: ['indoor-air-quality', 'humidifier', 'duct-cleaning'],
    area: 'Cedar Park',
    availability: nextNDaysSlots([[1, [14, 16]]]),
  },
];

/**
 * Find the next available HVAC slot matching urgency + optional skills.
 * Returns null if nothing fits within scope.
 */
export function findNextAvailableSlot(
  urgency: Urgency = 'same-day',
  skills: string[] = [],
  externalBookedIds: Set<string> = new Set()
): SlotMatch | null {
  return findNextAvailableSlotFrom(HVAC_TECHNICIANS, urgency, skills, externalBookedIds);
}
