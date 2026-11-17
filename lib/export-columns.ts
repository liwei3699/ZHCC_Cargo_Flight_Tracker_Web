import type { Flight } from "@/types";

export type ExportFormat = "text" | "time" | "date";
export type ExportColumn = { header: string; field: keyof Flight; format: ExportFormat };

export const EXPORT_COLUMNS: ExportColumn[] = [
  { header: "航班信息", field: "flightCode", format: "text" },
  { header: "起飞机场", field: "origin", format: "text" },
  { header: "降落机场", field: "destination", format: "text" },
  { header: "计划起飞时间", field: "schedTakeoff", format: "time" },
  { header: "实际起飞时间", field: "actualTakeoff", format: "time" },
  { header: "计划降落时间", field: "schedLanding", format: "time" },
  { header: "实际降落时间", field: "actualLanding", format: "time" },
  { header: "航班日期", field: "execDate", format: "date" },
  { header: "航班状态", field: "statusLabel", format: "text" },
  { header: "预计起飞时间", field: "estimatedTakeoff", format: "time" },
  { header: "预计降落时间", field: "estimatedLanding", format: "time" },
  { header: "航空公司", field: "airlineName", format: "text" },
  { header: "航司代码", field: "airlineCode", format: "text" },
  { header: "航班任务", field: "flightTask", format: "text" },
  { header: "区域", field: "regionLabel", format: "text" },
  { header: "代理", field: "agent", format: "text" },
  { header: "机型", field: "aircraftType", format: "text" },
  { header: "机号", field: "aircraftTail", format: "text" },
  { header: "机位", field: "stand", format: "text" },
  { header: "航站楼", field: "terminal", format: "text" },
  { header: "登机口", field: "gate", format: "text" },
  { header: "异常状态", field: "statusAbnormal", format: "text" },
  { header: "异常原因", field: "abnormalReason", format: "text" },
  { header: "调整状态", field: "adjustStatus", format: "text" },
  { header: "航线（中文）", field: "routeFull", format: "text" },
  { header: "航线三字码", field: "routeIata", format: "text" },
  { header: "航线四字码", field: "routeIcao", format: "text" },
  { header: "航段（中文）", field: "routeSegment", format: "text" },
  { header: "航段四字码", field: "routeSegmentIcao", format: "text" },
  { header: "远程机位", field: "remoteLabel", format: "text" },
];
