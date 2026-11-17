import { performSync } from "../functions/lib/sync.mjs";

const result = await performSync({ fetchImpl: globalThis.fetch });
const statuses = new Map();
const families = new Map();
for (const flight of result.flights) {
  statuses.set(flight.statusLabel, (statuses.get(flight.statusLabel) || 0) + 1);
  families.set(flight.aircraftFamily, (families.get(flight.aircraftFamily) || 0) + 1);
}
const dates = result.flights.map((flight) => flight.execDate).filter(Boolean).sort();

console.log(
  JSON.stringify(
    {
      sourceTotal: result.sourceTotal,
      sourcePages: result.sourcePages,
      recordCount: result.recordCount,
      dates: [dates[0] ?? null, dates[dates.length - 1] ?? null],
      statuses: Object.fromEntries(statuses),
      families: Object.fromEntries(families),
    },
    null,
    2,
  ),
);

if (result.recordCount < 1 || result.sourcePages < 1) process.exit(1);
