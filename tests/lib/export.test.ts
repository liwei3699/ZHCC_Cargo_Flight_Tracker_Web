// @vitest-environment node
import { describe, expect, it } from "vitest";
import { buildWorkbook } from "@/lib/export";
import { flights } from "../fixtures";

const meta = {
  syncedAt: "2026-11-17T21:32:01+08:00",
  sourceTotal: 9,
  recordCount: 9,
  sourcePages: 1,
  stale: false,
  syncing: false,
  warning: null,
};

describe("buildWorkbook", () => {
  it("writes 30 columns in the specified order", () => {
    const wb = buildWorkbook(flights, meta);
    const ws = wb.getWorksheet("航班动态")!;
    expect(ws.getRow(1).cellCount).toBe(30);
    expect(ws.getCell("A1").value).toBe("航班信息");
    expect(ws.getCell("I1").value).toBe("航班状态");
    expect(ws.getCell("AD1").value).toBe("远程机位");
  });

  it("writes native time and date values", () => {
    const wb = buildWorkbook([flights[0]], meta);
    const ws = wb.getWorksheet("航班动态")!;
    expect(ws.getCell("D2").value).toBe(0.875);
    expect(ws.getCell("D2").numFmt).toBe("hh:mm");
    expect(ws.getCell("H2").value).toBe(46343);
    expect(ws.getCell("H2").numFmt).toBe("m/d/yyyy");
  });

  it("keeps missing values empty and includes all filtered rows", () => {
    const wb = buildWorkbook([flights[0], flights[1]], meta);
    const ws = wb.getWorksheet("航班动态")!;
    expect(ws.rowCount).toBe(3);
    expect(ws.getCell("U2").value).toBe(null);
    expect(ws.autoFilter).toEqual({ from: "A1", to: "AD3" });
  });
});
