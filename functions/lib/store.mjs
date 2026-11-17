import { LEASE_TTL_MS } from "./constants.mjs";

const SNAPSHOT = "flight_snapshots";
const STATE = "flight_sync_state";
const ID = 1;
const EPOCH = "1970-01-01T00:00:00.000Z";

export async function readRow(db, table) {
  const { data, error } = await db.from(table).select("*").eq("id", ID).limit(1);
  if (error) throw new Error("database_unavailable");
  return Array.isArray(data) && data.length ? data[0] : null;
}

export async function ensureBootstrap(db) {
  let snapshot = await readRow(db, SNAPSHOT);
  if (!snapshot) {
    try {
      await db.from(SNAPSHOT).insert({
        id: ID,
        payload: [],
        synced_at: EPOCH,
        source_total: 0,
        source_pages: 0,
        record_count: 0,
        airlines: {},
        airlines_synced_at: null,
      });
    } catch {
      // Another request may have inserted the bootstrap row.
    }
    snapshot = await readRow(db, SNAPSHOT);
  }

  let state = await readRow(db, STATE);
  if (!state) {
    try {
      await db.from(STATE).insert({
        id: ID,
        refresh_started_at: null,
        refresh_token: "",
        last_attempt_at: null,
        last_error: null,
        last_manual_at: null,
      });
    } catch {
      // Another request may have inserted the bootstrap row.
    }
    state = await readRow(db, STATE);
  }

  if (!snapshot || !state) throw new Error("database_unavailable");
  return { snapshot, state };
}

export async function readCurrent(db) {
  const [snapshot, state] = await Promise.all([readRow(db, SNAPSHOT), readRow(db, STATE)]);
  return { snapshot, state };
}

export function hasValidSnapshot(snapshot) {
  return Boolean(
    snapshot &&
      snapshot.record_count > 0 &&
      snapshot.synced_at &&
      Date.parse(snapshot.synced_at) > 0,
  );
}

export async function writeSnapshot(db, result, syncedAt) {
  const { data, error } = await db
    .from(SNAPSHOT)
    .update({
      payload: result.flights,
      synced_at: syncedAt,
      source_total: result.sourceTotal,
      source_pages: result.sourcePages,
      record_count: result.recordCount,
      airlines: result.airlines,
      airlines_synced_at: result.airlinesSyncedAt,
    })
    .eq("id", ID)
    .select("id");
  if (error || !Array.isArray(data) || !data.length) throw new Error("database_unavailable");
}

async function updateState(db, patch, expectedToken) {
  let query = db.from(STATE).update(patch).eq("id", ID);
  if (expectedToken !== undefined) query = query.eq("refresh_token", expectedToken);
  const { data, error } = await query.select("id");
  if (error) throw new Error("database_unavailable");
  return Array.isArray(data) && data.length > 0;
}

export async function acquireLease(db, { nowMs, manual }) {
  const { state } = await ensureBootstrap(db);
  const started = state.refresh_started_at ? Date.parse(state.refresh_started_at) : 0;
  if (started && nowMs - started < LEASE_TTL_MS) {
    return { acquired: false, state, token: null };
  }
  const token = crypto.randomUUID();
  const patch = {
    refresh_started_at: new Date(nowMs).toISOString(),
    refresh_token: token,
    last_attempt_at: new Date(nowMs).toISOString(),
  };
  if (manual) patch.last_manual_at = new Date(nowMs).toISOString();
  const acquired = await updateState(db, patch, state.refresh_token || "");
  return { acquired, state, token };
}

export async function releaseLease(db, token, { ok, error, nowMs }) {
  try {
    await updateState(
      db,
      {
        refresh_started_at: null,
        refresh_token: "",
        last_attempt_at: new Date(nowMs).toISOString(),
        last_error: ok ? null : error,
      },
      token,
    );
  } catch {
    // The lease will expire; a successful snapshot must not be reported as a failure.
  }
}
