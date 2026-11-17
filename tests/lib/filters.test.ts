import { describe, expect, it } from "vitest";
import { filterFlights } from "@/lib/filters";
import type { Filters } from "@/types";
import { flights } from "../fixtures";

const all: Filters = {
  search: "",
  flightNo: "",
  ioAttr: "ALL",
  agent: "",
  origin: "",
  destination: "",
  datePreset: "ALL",
  dateFrom: "",
  dateTo: "",
  status: "ALL",
  region: "ALL",
  aircraftFamily: "ALL",
  aircraftType: "ALL",
};

describe("filterFlights", () => {
  it("filters by aircraft family and subtype", () => {
    expect(
      filterFlights(flights, { ...all, aircraftFamily: "波音737" }, "2026-11-17").map(
        (flight) => flight.id,
      ),
    ).toEqual([1, 5, 6]);
    expect(
      filterFlights(
        flights,
        { ...all, aircraftFamily: "波音737", aircraftType: "B738M" },
        "2026-11-17",
      ).map((flight) => flight.id),
    ).toEqual([5]);
  });

  it("matches delayed arrivals under both 延误 and 到达", () => {
    expect(
      filterFlights(flights, { ...all, status: "延误" }, "2026-11-17").map((flight) => flight.id),
    ).toEqual([2, 3]);
    expect(
      filterFlights(flights, { ...all, status: "到达" }, "2026-11-17").map((flight) => flight.id),
    ).toEqual([1, 3]);
    expect(
      filterFlights(flights, { ...all, status: "计划" }, "2026-11-17").map((flight) => flight.id),
    ).toEqual([7, 8]);
  });

  it("combines search, airport, region and date", () => {
    expect(
      filterFlights(
        flights,
        { ...all, search: "郑州", region: "INT", datePreset: "TOMORROW" },
        "2026-11-17",
      ).map((flight) => flight.id),
    ).toEqual([2]);
  });

  it("returns all for empty filters", () => {
    expect(filterFlights(flights, all, "2026-11-17")).toHaveLength(flights.length);
  });
});
