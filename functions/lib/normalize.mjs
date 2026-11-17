import { AIRCRAFT_PATTERNS, FALLBACK_AIRLINES, REGION_LABELS } from "./constants.mjs";

const text = (value) => (typeof value === "string" ? value.trim() : value == null ? "" : String(value).trim());

const timeOf = (value) => {
  const match = text(value).match(/(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}` : "";
};

export function normalizeTerminal(value) {
  return [...new Set(text(value).split(",").map((item) => item.trim()).filter(Boolean))].join("/");
}

export function classifyAircraft(value) {
  const code = text(value).toUpperCase();
  const subtype = code.replace(/^[BA](?=\d)/, "") || "未知";
  const rule = AIRCRAFT_PATTERNS.find((item) => item.test.test(code));
  return { family: rule?.family ?? "其他机型", subtype };
}

export function mergeStatus(normal, abnormal) {
  if (abnormal && normal && abnormal !== normal) return `${abnormal} · ${normal}`;
  if (abnormal) return abnormal;
  if (normal) return normal;
  return "计划";
}

export function statusTone(normal, abnormal) {
  if (abnormal === "取消") return "danger";
  if (abnormal === "延误") return "warning";
  if (normal === "到达") return "success";
  if (["起飞", "前方起飞", "登机", "过站登机", "催促登机", "登机结束"].includes(normal)) return "info";
  if (["正在值机", "值机截止"].includes(normal)) return "neutral";
  if (!normal && !abnormal) return "neutral";
  return "muted";
}

export function normalizeRecord(record, airlineMap = {}) {
  const airlineCode = text(record.agencyCd) || text(record.airlinesIataCd);
  const flightNo = text(record.flightNo);
  const normal = text(record.normalStateCn);
  const abnormal = text(record.abnormalStateCn);
  const aircraft = classifyAircraft(record.craftType);
  const region = text(record.regionAttr).toUpperCase();
  const remote = text(record.isremote).toUpperCase();
  return {
    id: record.id ?? record.flightId ?? record.dataKey ?? `${airlineCode}${flightNo}${text(record.execDate)}`,
    flightNo,
    airlineCode,
    flightCode: `${airlineCode}${flightNo}`.trim(),
    airlineName: airlineMap[airlineCode] || FALLBACK_AIRLINES[airlineCode] || airlineCode || "",
    agent: text(record.agency),
    flightTask: text(record.flightTaskCn),
    execDate: text(record.execDate),
    origin: text(record.startStationCn),
    destination: text(record.terminalStationCn),
    routeFull: text(record.airrouteCn),
    routeIata: text(record.airrouteIataCd),
    routeIcao: text(record.airrouteIcaoCd),
    routeSegment: text(record.airrouteSingleCn),
    routeSegmentIcao: text(record.airrouteSingleIcaoCd),
    ioAttr: text(record.ioAttr),
    ioLabel: text(record.ioAttr) === "A" ? "进港" : text(record.ioAttr) === "D" ? "出港" : "",
    region: REGION_LABELS[region] ? region : "UNKNOWN",
    regionLabel: REGION_LABELS[region] || "未知",
    schedTakeoff: timeOf(record.scheTakeOffTime),
    estimatedTakeoff: timeOf(record.estmTakeOffTime),
    actualTakeoff: timeOf(record.actlTakeOffTime),
    schedLanding: timeOf(record.scheLandingTime),
    estimatedLanding: timeOf(record.estmLandingTime),
    actualLanding: timeOf(record.actlLandingTime),
    statusNormal: normal,
    statusAbnormal: abnormal,
    statusLabel: mergeStatus(normal, abnormal),
    statusTone: statusTone(normal, abnormal),
    abnormalReason: text(record.absreasonCn),
    adjustStatus: text(record.adjustStatus),
    aircraftType: text(record.craftType).toUpperCase(),
    aircraftFamily: aircraft.family,
    aircraftSubtype: aircraft.subtype,
    aircraftTail: text(record.craftNo),
    stand: text(record.stand) || text(record.lastStand),
    gate: text(record.gate),
    terminal: normalizeTerminal(record.terminal),
    remote,
    remoteLabel: remote === "Y" ? "是" : remote === "N" ? "否" : "",
  };
}

export function dedupeRecords(records) {
  const seen = new Set();
  return records.filter((record) => {
    const key = record.id ?? record.flightId ?? record.dataKey;
    if (key == null || seen.has(String(key))) return false;
    seen.add(String(key));
    return true;
  });
}
