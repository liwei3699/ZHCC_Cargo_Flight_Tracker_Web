import { describe, expect, it } from "vitest";
import { dateRangeForPreset, dateToSerial, timeToFraction } from "@/lib/format";

describe("format", () => {
  it("converts times to Excel fractions", () => {
    expect(timeToFraction("21:00")).toBe(0.875);
    expect(timeToFraction("00:50")).toBeCloseTo(50 / 1440);
  });

  it("converts dates to Excel serials", () => {
    expect(dateToSerial("2026-11-05")).toBe(46331);
  });

  it("builds date presets", () => {
    expect(dateRangeForPreset("TODAY", "2026-11-17")).toEqual({
      from: "2026-11-17",
      to: "2026-11-17",
    });
    expect(dateRangeForPreset("NEXT_7", "2026-11-17")).toEqual({
      from: "2026-11-17",
      to: "2026-11-23",
    });
  });
});
