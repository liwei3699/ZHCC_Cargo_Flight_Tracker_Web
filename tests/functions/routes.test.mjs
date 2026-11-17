// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { createFakeDb } from "../../dev/fake-db.mjs";
import { application } from "../../functions/routes.mjs";

const flight = {
  id: 1,
  flightNo: "6376",
  airlineCode: "CZ",
  flightCode: "CZ6376",
  airlineName: "中国南方航空",
  agent: "南航",
  flightTask: "正班",
  execDate: "2026-11-17",
  origin: "乌鲁木齐",
  destination: "郑州",
  routeFull: "",
  routeIata: "",
  routeIcao: "",
  routeSegment: "",
  routeSegmentIcao: "",
  ioAttr: "A",
  ioLabel: "进港",
  region: "DOM",
  regionLabel: "国内",
  schedTakeoff: "21:00",
  estimatedTakeoff: "",
  actualTakeoff: "",
  schedLanding: "00:50",
  estimatedLanding: "",
  actualLanding: "",
  statusNormal: "到达",
  statusAbnormal: "",
  statusLabel: "到达",
  statusTone: "success",
  abnormalReason: "",
  adjustStatus: "",
  aircraftType: "B738",
  aircraftFamily: "波音737",
  aircraftSubtype: "738",
  aircraftTail: "B1400",
  stand: "223",
  gate: "",
  terminal: "T2",
  remote: "N",
  remoteLabel: "否",
};

function jsonResponse(payload) {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

function seed(db, overrides = {}) {
  db.tables.flight_snapshots.push({
    id: 1,
    payload: [flight],
    synced_at: new Date().toISOString(),
    source_total: 1,
    source_pages: 1,
    record_count: 1,
    airlines: {},
    airlines_synced_at: null,
    ...overrides,
  });
  db.tables.flight_sync_state.push({
    id: 1,
    refresh_started_at: null,
    refresh_token: "",
    last_attempt_at: null,
    last_error: null,
    last_manual_at: null,
  });
}

function fetchPages() {
  return vi.fn(async (url, init) => {
    if (url.includes("/airline/airlineTwo")) {
      return jsonResponse({
        code: 200,
        data: { pages: 1, total: 1, records: [{ code: "CZ", name: "中国南方航空" }] },
      });
    }
    const page = Number(new URLSearchParams(init.body).get("current"));
    return jsonResponse({
      code: 200,
      data: {
        current: page,
        pages: 1,
        total: 1,
        size: 11,
        records: [
          {
            id: 1,
            flightNo: "6376",
            agencyCd: "CZ",
            agency: "南航",
            flightTaskCn: "正班",
            execDate: "2026-11-17",
            startStationCn: "乌鲁木齐",
            terminalStationCn: "郑州",
            ioAttr: "A",
            regionAttr: "DOM",
            scheTakeOffTime: "21:00",
            scheLandingTime: "00:50",
            normalStateCn: "到达",
            craftType: "B738",
            terminal: "T2",
            isremote: "N",
          },
        ],
      },
    });
  });
}

const request = (path, method = "GET") =>
  new Request(`http://127.0.0.1:8000/functions/v1/app${path}`, { method });

describe("routes", () => {
  it("returns fresh snapshot without fetching source", async () => {
    const db = createFakeDb();
    seed(db);
    const fetchImpl = vi.fn();
    const handle = application({ db, fetchImpl, now: () => Date.now(), waitForSyncMs: 10 });
    const response = await handle({ request: request("/api/flights") });
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data.flights).toHaveLength(1);
    expect(body.data.meta.stale).toBe(false);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("syncs a stale snapshot and returns new data", async () => {
    const db = createFakeDb();
    seed(db, { synced_at: new Date(Date.now() - 31 * 60 * 1000).toISOString() });
    const fetchImpl = fetchPages();
    const handle = application({ db, fetchImpl, now: () => Date.now(), waitForSyncMs: 10 });
    const response = await handle({ request: request("/api/flights") });
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.data.meta.stale).toBe(false);
    expect(fetchImpl).toHaveBeenCalled();
  });

  it("respects manual cooldown", async () => {
    const db = createFakeDb();
    seed(db);
    db.tables.flight_sync_state[0].last_manual_at = new Date(Date.now() - 5000).toISOString();
    const fetchImpl = vi.fn();
    const handle = application({ db, fetchImpl, now: () => Date.now(), waitForSyncMs: 10 });
    const response = await handle({ request: request("/api/refresh", "POST") });
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.data.meta.refreshed).toBe(false);
    expect(body.data.meta.cooldownSeconds).toBeGreaterThan(0);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("returns stale data when source fails with a snapshot", async () => {
    const db = createFakeDb();
    seed(db, { synced_at: new Date(Date.now() - 31 * 60 * 1000).toISOString() });
    const fetchImpl = vi.fn(async () => {
      throw new Error("network");
    });
    const handle = application({ db, fetchImpl, now: () => Date.now(), waitForSyncMs: 10 });
    const response = await handle({ request: request("/api/flights") });
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.data.meta.stale).toBe(true);
    expect(body.data.meta.warning).toBe("upstream_unavailable");
  });

  it("returns 503 when source fails without a snapshot", async () => {
    const db = createFakeDb();
    const fetchImpl = vi.fn(async () => {
      throw new Error("network");
    });
    const handle = application({ db, fetchImpl, now: () => Date.now(), waitForSyncMs: 10 });
    const response = await handle({ request: request("/api/flights") });
    expect(response.status).toBe(503);
  });

  it("serves health without touching source", async () => {
    const db = createFakeDb();
    seed(db);
    const handle = application({
      db,
      fetchImpl: vi.fn(),
      now: () => Date.now(),
      waitForSyncMs: 10,
    });
    const response = await handle({ request: request("/api/health") });
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.data.hasSnapshot).toBe(true);
  });

  it("rejects unknown paths and methods", async () => {
    const db = createFakeDb();
    seed(db);
    const handle = application({
      db,
      fetchImpl: vi.fn(),
      now: () => Date.now(),
      waitForSyncMs: 10,
    });
    expect((await handle({ request: request("/api/nope") })).status).toBe(404);
    expect((await handle({ request: request("/api/flights", "POST") })).status).toBe(405);
  });
});
