import {
  CACHE_TTL_MS,
  FAILURE_BACKOFF_MS,
  MANUAL_COOLDOWN_MS,
  WAIT_FOR_SYNC_MS,
  WAIT_POLL_MS,
} from "./lib/constants.mjs";
import {
  acquireLease,
  ensureBootstrap,
  hasValidSnapshot,
  readCurrent,
  releaseLease,
  writeSnapshot,
} from "./lib/store.mjs";
import { performSync } from "./lib/sync.mjs";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const json = (body, status = 200) =>
  Response.json(body, { status, headers: { "cache-control": "no-store" } });
const error = (code, message, status) => json({ ok: false, error: { code, message } }, status);

function response(snapshot, state, overrides = {}) {
  const meta = {
    syncedAt: snapshot.synced_at,
    sourceTotal: snapshot.source_total,
    recordCount: snapshot.record_count,
    sourcePages: snapshot.source_pages,
    stale: false,
    syncing: false,
    warning: null,
    ...overrides,
  };
  return json({ ok: true, data: { flights: snapshot.payload || [], meta } });
}

export function application({
  db,
  fetchImpl = globalThis.fetch,
  now = () => Date.now(),
  waitForSyncMs = WAIT_FOR_SYNC_MS,
}) {
  const nowMs = () => now();

  async function waitForNewSnapshot(initialSyncedAt) {
    const deadline = nowMs() + waitForSyncMs;
    while (nowMs() < deadline) {
      await sleep(WAIT_POLL_MS);
      const current = await readCurrent(db);
      if (hasValidSnapshot(current.snapshot) && current.snapshot.synced_at !== initialSyncedAt) {
        return current;
      }
    }
    return null;
  }

  async function runSync({ manual, snapshot }) {
    const lease = await acquireLease(db, { nowMs: nowMs(), manual });
    if (!lease.acquired) {
      const waited = await waitForNewSnapshot(snapshot?.synced_at);
      const current = waited || (await readCurrent(db));
      if (hasValidSnapshot(current.snapshot)) {
        const syncing = !waited;
        return response(current.snapshot, current.state, {
          stale: syncing,
          syncing,
          warning: null,
        });
      }
      return error("upstream_unavailable", "源站暂时不可用", 503);
    }

    try {
      const result = await performSync({
        fetchImpl,
        airlineMap: snapshot?.airlines || {},
        airlinesSyncedAt: snapshot?.airlines_synced_at || null,
        now,
      });
      const syncedAt = new Date(nowMs()).toISOString();
      await writeSnapshot(db, result, syncedAt);
      const current = await readCurrent(db);
      await releaseLease(db, lease.token, { ok: true, nowMs: nowMs() });
      return response(current.snapshot, current.state, {
        refreshed: true,
        stale: false,
        syncing: false,
        warning: null,
        ...(manual ? { cooldownSeconds: 0 } : {}),
      });
    } catch (syncError) {
      const code = syncError?.message === "sync_timeout" ? "sync_timeout" : "upstream_unavailable";
      await releaseLease(db, lease.token, { ok: false, error: code, nowMs: nowMs() });
      const current = await readCurrent(db);
      if (hasValidSnapshot(current.snapshot)) {
        return response(current.snapshot, current.state, {
          refreshed: false,
          stale: true,
          syncing: false,
          warning: code,
        });
      }
      return error("upstream_unavailable", "源站暂时不可用", 503);
    }
  }

  return async ({ request }) => {
    const path =
      new URL(request.url).pathname.match(
        /^\/(?:functions\/v1\/)?(?:app|app-d[0-9a-f]{32})(\/.*)?$/,
      )?.[1] || "/";
    const method = request.method;

    try {
      const { snapshot, state } = await ensureBootstrap(db);

      if (path === "/api/health") {
        if (method !== "GET") return error("method_not_allowed", "方法不允许", 405);
        const valid = hasValidSnapshot(snapshot);
        return json({
          ok: true,
          data: {
            database: true,
            hasSnapshot: valid,
            syncedAt: valid ? snapshot.synced_at : null,
            snapshotAgeSeconds: valid
              ? Math.max(0, Math.floor((nowMs() - Date.parse(snapshot.synced_at)) / 1000))
              : null,
            recordCount: snapshot.record_count,
            lastError: state.last_error,
          },
        });
      }

      if (path === "/api/flights") {
        if (method !== "GET") return error("method_not_allowed", "方法不允许", 405);
        const valid = hasValidSnapshot(snapshot);
        const age = valid ? nowMs() - Date.parse(snapshot.synced_at) : Infinity;
        if (valid && age < CACHE_TTL_MS) return response(snapshot, state);

        const attempt = state.last_attempt_at ? Date.parse(state.last_attempt_at) : 0;
        if (valid && state.last_error && nowMs() - attempt < FAILURE_BACKOFF_MS) {
          return response(snapshot, state, { stale: true, warning: "upstream_backoff" });
        }
        return runSync({ manual: false, snapshot: valid ? snapshot : null });
      }

      if (path === "/api/refresh") {
        if (method !== "POST") return error("method_not_allowed", "方法不允许", 405);
        const valid = hasValidSnapshot(snapshot);
        const lastManual = state.last_manual_at ? Date.parse(state.last_manual_at) : 0;
        const cooldownSeconds = valid
          ? Math.max(0, Math.ceil((MANUAL_COOLDOWN_MS - (nowMs() - lastManual)) / 1000))
          : 0;
        if (cooldownSeconds > 0) {
          return response(snapshot, state, { refreshed: false, cooldownSeconds });
        }
        return runSync({ manual: true, snapshot: valid ? snapshot : null });
      }

      return error("not_found", "未找到接口", 404);
    } catch {
      return error("database_unavailable", "数据服务暂时不可用", 503);
    }
  };
}
