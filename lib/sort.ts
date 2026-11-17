import type { Flight, SortState } from "@/types";

const STATUS_ORDER = [
  "延误",
  "取消",
  "计划",
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
const rank = (flight: Flight) =>
  STATUS_ORDER.indexOf(flight.statusAbnormal || flight.statusNormal);

function value(flight: Flight, key: string): string | number {
  if (key === "status") return rank(flight);
  if (key === "route") return `${flight.origin} ${flight.destination}`;
  const field = (flight as unknown as Record<string, unknown>)[key];
  return typeof field === "number" ? field : String(field ?? "");
}

export function sortFlights(flights: Flight[], sort: SortState) {
  const copy = [...flights];
  if (sort.key === "default") {
    copy.sort(
      (a, b) =>
        b.execDate.localeCompare(a.execDate) ||
        a.schedTakeoff.localeCompare(b.schedTakeoff) ||
        String(a.id).localeCompare(String(b.id)),
    );
    return copy;
  }
  const factor = sort.direction === "asc" ? 1 : -1;
  copy.sort((a, b) => {
    const av = value(a, sort.key);
    const bv = value(b, sort.key);
    const primary =
      typeof av === "number" && typeof bv === "number"
        ? av - bv
        : String(av).localeCompare(String(bv), "zh-CN");
    return (
      primary * factor ||
      b.execDate.localeCompare(a.execDate) ||
      a.schedTakeoff.localeCompare(b.schedTakeoff)
    );
  });
  return copy;
}
