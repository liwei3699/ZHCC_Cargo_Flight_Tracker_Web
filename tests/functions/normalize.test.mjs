// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  classifyAircraft,
  dedupeRecords,
  mergeStatus,
  normalizeRecord,
  normalizeTerminal,
} from "../../functions/lib/normalize.mjs";

const raw = {
  id: 1,
  flightNo: "6376",
  agencyCd: "CZ",
  airlinesIataCd: "CZ",
  agency: "南航",
  flightTaskCn: "正班",
  execDate: "2026-11-17",
  startStationCn: "乌鲁木齐",
  terminalStationCn: "郑州",
  airrouteCn: "乌鲁木齐-郑州",
  airrouteIataCd: "URC-CGO",
  airrouteIcaoCd: "ZWWW-ZHCC",
  airrouteSingleCn: "乌鲁木齐",
  airrouteSingleIcaoCd: "ZWWW",
  ioAttr: "A",
  regionAttr: "DOM",
  scheTakeOffTime: "21:00",
  estmTakeOffTime: "",
  actlTakeOffTime: "21:12",
  scheLandingTime: "00:50",
  estmLandingTime: "2026-11-17 00:45",
  actlLandingTime: "00:40",
  normalStateCn: "到达",
  abnormalStateCn: "",
  absreasonCn: "",
  adjustStatus: "",
  craftType: "B738",
  craftNo: "B1400",
  stand: "223",
  lastStand: "223",
  gate: "",
  terminal: ",T2",
  isremote: "N",
};

describe("normalizeRecord", () => {
  it("combines airline code and flight number and normalizes fields", () => {
    const f = normalizeRecord(raw, { CZ: "中国南方航空" });
    expect(f.flightCode).toBe("CZ6376");
    expect(f.airlineName).toBe("中国南方航空");
    expect(f.origin).toBe("乌鲁木齐");
    expect(f.destination).toBe("郑州");
    expect(f.aircraftType).toBe("B738");
    expect(f.aircraftFamily).toBe("波音737");
    expect(f.aircraftSubtype).toBe("738");
    expect(f.terminal).toBe("T2");
    expect(f.estimatedLanding).toBe("00:45");
    expect(f.statusLabel).toBe("到达");
    expect(f.remoteLabel).toBe("否");
  });

  it("keeps missing values empty for export", () => {
    const f = normalizeRecord({ ...raw, gate: "", absreasonCn: "", adjustStatus: "" }, {});
    expect(f.gate).toBe("");
    expect(f.abnormalReason).toBe("");
    expect(f.adjustStatus).toBe("");
  });

  it("merges abnormal and normal status", () => {
    expect(mergeStatus("到达", "延误")).toBe("延误 · 到达");
    expect(mergeStatus("", "取消")).toBe("取消");
    expect(mergeStatus("起飞", "")).toBe("起飞");
    expect(mergeStatus("", "")).toBe("计划");
  });

  it("falls back to code when airline is not in the source map", () => {
    expect(normalizeRecord({ ...raw, agencyCd: "GI" }, {}).airlineName).toBe("GI");
  });
});

describe("classifyAircraft", () => {
  it.each([
    ["B733", "波音737", "733"],
    ["B738", "波音737", "738"],
    ["B739", "波音737", "739"],
    ["B744", "波音747", "744"],
    ["B752", "波音757", "752"],
    ["B763", "波音767", "763"],
    ["B772LR", "波音777", "772LR"],
    ["B789", "波音787", "789"],
    ["A319NEO", "空客A320", "319NEO"],
    ["A320NEO", "空客A320", "320NEO"],
    ["A333", "空客A330", "333"],
    ["ARJ217", "中国商飞", "ARJ217"],
    ["C919", "中国商飞", "C919"],
    ["IL76", "其他机型", "IL76"],
    ["", "其他机型", "未知"],
  ])("classifies %s as %s/%s", (code, family, subtype) => {
    expect(classifyAircraft(code)).toMatchObject({ family, subtype });
  });
});

describe("helpers", () => {
  it("normalizes terminal commas and duplicates", () => {
    expect(normalizeTerminal(",T2")).toBe("T2");
    expect(normalizeTerminal("T2,T2")).toBe("T2");
    expect(normalizeTerminal("T1,T2")).toBe("T1/T2");
  });

  it("dedupes by id", () => {
    expect(dedupeRecords([{ id: 1 }, { id: 1 }, { id: 2 }])).toHaveLength(2);
  });
});
