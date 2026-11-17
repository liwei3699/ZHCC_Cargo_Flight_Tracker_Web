import type { Filters, Flight } from "@/types";
import { dateRangeForPreset } from "./format";

const text = (value: string) => value.trim().toLowerCase();
const includes = (value: string, query: string) => value.toLowerCase().includes(query);

const NORMAL_STATUSES = [
  "前方起飞",
  "正在值机",
  "值机截止",
  "登机",
  "过站登机",
  "催促登机",
  "登机结束",
  "起飞",
  "到达",
];
const ABNORMAL_STATUSES = ["延误", "取消"];
const KNOWN_STATUSES = new Set([...NORMAL_STATUSES, ...ABNORMAL_STATUSES]);

export const DEFAULT_FILTERS: Filters = {
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

export function filterFlights(flights: Flight[], filters: Filters, today: string) {
  const search = text(filters.search);
  const flightNo = text(filters.flightNo);
  const origin = text(filters.origin);
  const destination = text(filters.destination);
  const range =
    filters.datePreset === "CUSTOM"
      ? { from: filters.dateFrom, to: filters.dateTo }
      : dateRangeForPreset(filters.datePreset, today);

  return flights.filter((flight) => {
    if (search) {
      const haystack = [
        flight.flightCode,
        flight.flightNo,
        flight.airlineName,
        flight.airlineCode,
        flight.agent,
        flight.origin,
        flight.destination,
        flight.aircraftType,
        flight.aircraftFamily,
        flight.aircraftSubtype,
        flight.aircraftTail,
        flight.stand,
        flight.terminal,
        flight.routeFull,
        flight.routeIata,
        flight.routeIcao,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    if (
      flightNo &&
      !includes(flight.flightCode, flightNo) &&
      !includes(flight.flightNo, flightNo)
    ) {
      return false;
    }
    if (filters.ioAttr !== "ALL" && flight.ioAttr !== filters.ioAttr) return false;
    if (filters.agent && flight.agent !== filters.agent) return false;
    if (origin && !includes(flight.origin, origin)) return false;
    if (destination && !includes(flight.destination, destination)) return false;
    if (range.from && flight.execDate < range.from) return false;
    if (range.to && flight.execDate > range.to) return false;
    if (filters.status !== "ALL") {
      if (filters.status === "计划") {
        if (flight.statusNormal || flight.statusAbnormal) return false;
      } else if (ABNORMAL_STATUSES.includes(filters.status)) {
        if (flight.statusAbnormal !== filters.status) return false;
      } else if (NORMAL_STATUSES.includes(filters.status)) {
        if (flight.statusNormal !== filters.status) return false;
      } else if (filters.status === "其他") {
        if (
          flight.statusLabel === "计划" ||
          KNOWN_STATUSES.has(flight.statusNormal) ||
          KNOWN_STATUSES.has(flight.statusAbnormal)
        ) {
          return false;
        }
      }
    }
    if (filters.region !== "ALL" && flight.region !== filters.region) return false;
    if (filters.aircraftFamily !== "ALL" && flight.aircraftFamily !== filters.aircraftFamily) {
      return false;
    }
    if (filters.aircraftType !== "ALL" && flight.aircraftType !== filters.aircraftType) {
      return false;
    }
    return true;
  });
}
