import type { DatePreset } from "@/types";

const pad = (value: number) => String(value).padStart(2, "0");

export function dash(value: string) {
  return value?.trim() ? value : "—";
}

export function timeToFraction(value: string) {
  const match = value.match(/^(\d{2}):(\d{2})$/);
  if (!match) return null;
  return (Number(match[1]) * 60 + Number(match[2])) / 1440;
}

export function dateToSerial(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const utc = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Math.round((utc - Date.UTC(1899, 11, 30)) / 86400000);
}

export function todayShanghai(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function addDays(date: string, days: number) {
  const [year, month, day] = date.split("-").map(Number);
  const value = new Date(Date.UTC(year, month - 1, day + days));
  return `${value.getUTCFullYear()}-${pad(value.getUTCMonth() + 1)}-${pad(value.getUTCDate())}`;
}

export function dateRangeForPreset(preset: DatePreset, today: string) {
  switch (preset) {
    case "TODAY":
      return { from: today, to: today };
    case "YESTERDAY":
      return { from: addDays(today, -1), to: addDays(today, -1) };
    case "TOMORROW":
      return { from: addDays(today, 1), to: addDays(today, 1) };
    case "DAY_AFTER":
      return { from: addDays(today, 2), to: addDays(today, 2) };
    case "NEXT_7":
      return { from: today, to: addDays(today, 6) };
    case "CUSTOM":
      return { from: "", to: "" };
    default:
      return { from: "", to: "" };
  }
}

export function formatShanghaiTime(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

export function exportFileName(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "00";
  return `郑州新郑国际机场货运航班动态_${get("year")}${get("month")}${get("day")}_${get("hour")}${get("minute")}.xlsx`;
}
