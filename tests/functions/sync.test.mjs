// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { fetchAllFlightPages } from "../../functions/lib/source.mjs";
import { performSync } from "../../functions/lib/sync.mjs";

const raw = (id) => ({
  id,
  flightNo: "6376",
  agencyCd: "GI",
  agency: "机场",
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
});

function jsonResponse(payload) {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

function pagePayload(page, pages, records) {
  return {
    code: 200,
    data: { current: page, pages, total: pages, size: 11, records },
  };
}

describe("fetchAllFlightPages", () => {
  it("fetches every page with the source page count", async () => {
    const fetchImpl = vi.fn(async (_url, init) => {
      const page = Number(new URLSearchParams(init.body).get("current"));
      return jsonResponse(pagePayload(page, 3, [raw(page)]));
    });
    const result = await fetchAllFlightPages({ fetchImpl });
    expect(result.pages).toBe(3);
    expect(result.total).toBe(3);
    expect(result.records.map((record) => record.id)).toEqual([1, 2, 3]);
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });

  it("retries a transient page failure", async () => {
    let failures = 1;
    const fetchImpl = vi.fn(async (_url, init) => {
      if (failures-- > 0) throw new Error("network");
      const page = Number(new URLSearchParams(init.body).get("current"));
      return jsonResponse(pagePayload(page, 1, [raw(1)]));
    });
    const result = await fetchAllFlightPages({ fetchImpl });
    expect(result.records).toHaveLength(1);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("rejects when a page keeps failing", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error("network");
    });
    await expect(fetchAllFlightPages({ fetchImpl })).rejects.toThrow("network");
  });
});

describe("performSync", () => {
  it("dedupes, normalizes and keeps airline map", async () => {
    const fetchImpl = vi.fn(async (url, init) => {
      if (url.includes("/airline/airlineTwo")) {
        return jsonResponse({
          code: 200,
          data: { pages: 1, total: 1, size: 11, records: [{ code: "GI", name: "龙浩航空" }] },
        });
      }
      const page = Number(new URLSearchParams(init.body).get("current"));
      return jsonResponse(pagePayload(page, 1, [raw(1), raw(1), raw(2)]));
    });
    const result = await performSync({
      fetchImpl,
      airlineMap: {},
      airlinesSyncedAt: null,
      now: () => Date.parse("2026-11-17T12:00:00Z"),
    });
    expect(result.recordCount).toBe(2);
    expect(result.flights[0].airlineName).toBe("龙浩航空");
    expect(result.sourcePages).toBe(1);
  });

  it("continues when the airline map fails", async () => {
    const fetchImpl = vi.fn(async (url, init) => {
      if (url.includes("/airline/airlineTwo")) throw new Error("airline down");
      const page = Number(new URLSearchParams(init.body).get("current"));
      return jsonResponse(pagePayload(page, 1, [raw(1)]));
    });
    const result = await performSync({ fetchImpl, airlineMap: null, airlinesSyncedAt: null });
    expect(result.flights[0].airlineName).toBe("GI");
  });
});
