# HVAC Knowledge Base (Riley — AustinAir)

> Source material for the AI receptionist. Phase 1 keeps it as a single Markdown file. Phase 2 ingests into pgvector for RAG.

## Common issues — caller-side phrasing → likely cause

### No cooling / weak airflow
- Filter clogged → recommend filter change before dispatch (free fix attempt).
- Refrigerant leak → licensed tech required ($250-1500).
- Capacitor failure → typically a quick fix ($120-300).
- Compressor failure → expensive, sometimes replace unit ($2000-7000).

### No heating
- Pilot light out (gas) → owner can relight (free).
- Igniter (electric/gas) → tech replacement ($200-400).
- Blower motor → tech ($400-900).
- Cracked heat exchanger → DANGER. Recommend immediate replacement; safety risk.

### Water around indoor unit
- Clogged condensate drain → $100-200 clean.
- Frozen evaporator coil → check filter first; tech $200-500 to thaw and diagnose.
- Damaged drain pan → $300-600 replacement.

### Strange noises
- Banging → loose part, motor mount.
- Hissing → refrigerant leak (urgent).
- Squealing → belt or motor bearing.
- Buzzing → electrical, contactor.

## Triage priorities

| Symptom | Urgency | Action |
|---|---|---|
| Gas smell | EMERGENCY | escalate_to_owner immediately; do NOT book |
| No heat + vulnerable person + temp < 60°F | EMERGENCY | escalate_to_owner |
| No A/C + temp > 95°F | SAME-DAY | book within 4 hours |
| Water dripping inside | SAME-DAY | book within 8 hours |
| Annoying sound, system still running | SCHEDULED | book within 3 days |
| Maintenance / tune-up | SCHEDULED | any open slot |

## Business hours

- Mon-Fri 8am-6pm
- Sat 9am-2pm
- Sun closed (emergency line routes to owner mobile)

## After-hours emergency protocol

- Caller mentions an emergency keyword OR temperature threshold breached.
- AI escalates: "I'm transferring you to the owner directly, please stay on the line."
- `escalate_to_owner` tool fires with reason + caller info.
