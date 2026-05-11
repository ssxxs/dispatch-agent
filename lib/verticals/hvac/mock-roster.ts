import type { Technician, TimeSlot, Urgency } from '@/lib/types';

function slotsForDay(date: Date, busyHours: number[] = []): TimeSlot[] {
  const slots: TimeSlot[] = [];
  // 2-hour windows from 8am to 6pm
  for (let hour = 8; hour < 18; hour += 2) {
    const start = new Date(date);
    start.setHours(hour, 0, 0, 0);
    const end = new Date(start);
    end.setHours(hour + 2);
    slots.push({
      start: start.toISOString(),
      end: end.toISOString(),
      booked: busyHours.includes(hour),
    });
  }
  return slots;
}

function nextNDaysSlots(busyOffsets: Array<[number, number[]]> = []): TimeSlot[] {
  const out: TimeSlot[] = [];
  for (let d = 0; d < 5; d++) {
    const day = new Date();
    day.setDate(day.getDate() + d);
    const busy = busyOffsets.find(([offset]) => offset === d)?.[1] ?? [];
    out.push(...slotsForDay(day, busy));
  }
  return out;
}

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

export interface SlotMatch {
  technicianId: string;
  technicianName: string;
  area: string;
  slotId: string;
  windowStart: string;
  windowEnd: string;
}

/**
 * Find the next available slot matching urgency + optional skills.
 * Returns null if nothing fits within scope.
 */
export function findNextAvailableSlot(
  urgency: Urgency = 'same-day',
  skills: string[] = []
): SlotMatch | null {
  const matching = HVAC_TECHNICIANS.filter((t) =>
    skills.length === 0 || skills.some((s) => t.skills.includes(s))
  );

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const fourHoursMs = 4 * 60 * 60 * 1000;

  for (const tech of matching) {
    for (const slot of tech.availability) {
      if (slot.booked) continue;
      const slotStart = new Date(slot.start);
      if (slotStart < now) continue;
      if (urgency === 'same-day' && !slot.start.startsWith(todayStr)) continue;
      if (urgency === 'emergency' && slotStart.getTime() - now.getTime() > fourHoursMs) continue;

      return {
        technicianId: tech.id,
        technicianName: tech.name,
        area: tech.area,
        slotId: `${tech.id}|${slot.start}`,
        windowStart: slot.start,
        windowEnd: slot.end,
      };
    }
  }

  return null;
}
