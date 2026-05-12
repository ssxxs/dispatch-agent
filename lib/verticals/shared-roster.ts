/**
 * Shared slot-generation + matching helpers used by every vertical's
 * mock-roster. Each vertical only has to declare its technician list
 * (with skills + per-day busy offsets) and the matcher does the rest.
 */

import type { Technician, TimeSlot, Urgency } from '@/lib/types';

export interface SlotMatch {
  technicianId: string;
  technicianName: string;
  area: string;
  slotId: string;
  windowStart: string;
  windowEnd: string;
}

export function slotsForDay(date: Date, busyHours: number[] = []): TimeSlot[] {
  const slots: TimeSlot[] = [];
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

export function nextNDaysSlots(
  busyOffsets: Array<[number, number[]]> = []
): TimeSlot[] {
  const out: TimeSlot[] = [];
  for (let d = 0; d < 5; d++) {
    const day = new Date();
    day.setDate(day.getDate() + d);
    const busy = busyOffsets.find(([offset]) => offset === d)?.[1] ?? [];
    out.push(...slotsForDay(day, busy));
  }
  return out;
}

/**
 * Find the next available slot across any of the given technicians.
 * Honors urgency ("emergency" = within 4h, "same-day" = same calendar day)
 * and optional skill filters.
 */
export function findNextAvailableSlotFrom(
  technicians: Technician[],
  urgency: Urgency = 'same-day',
  skills: string[] = []
): SlotMatch | null {
  const matching = technicians.filter(
    (t) => skills.length === 0 || skills.some((s) => t.skills.includes(s))
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
