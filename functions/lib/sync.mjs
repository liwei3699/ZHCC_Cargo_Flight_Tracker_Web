import { AIRLINE_REFRESH_MS, SYNC_DEADLINE_MS } from "./constants.mjs";
import { dedupeRecords, normalizeRecord } from "./normalize.mjs";
import { fetchAirlines, fetchAllFlightPages } from "./source.mjs";

export async function performSync({
  fetchImpl = globalThis.fetch,
  airlineMap = null,
  airlinesSyncedAt = null,
  now = () => Date.now(),
} = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SYNC_DEADLINE_MS);
  try {
    let airlines = airlineMap;
    let airlinesAt = airlinesSyncedAt;
    const airlineAge = airlinesAt ? now() - Date.parse(airlinesAt) : Infinity;
    if (!airlines || airlineAge > AIRLINE_REFRESH_MS) {
      try {
        airlines = await fetchAirlines({ fetchImpl });
        airlinesAt = new Date(now()).toISOString();
      } catch {
        airlines = airlines || {};
        airlinesAt = airlinesAt || null;
      }
    }

    const { records, pages, total } = await fetchAllFlightPages({
      fetchImpl,
      signal: controller.signal,
    });
    const unique = dedupeRecords(records);
    if (!unique.length) throw new Error("empty_source");
    const flights = unique.map((record) => normalizeRecord(record, airlines || {}));
    return {
      flights,
      sourceTotal: total,
      sourcePages: pages,
      recordCount: flights.length,
      airlines: airlines || {},
      airlinesSyncedAt: airlinesAt,
    };
  } catch (error) {
    controller.abort();
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
