import type { ReactNode } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import type { Flight } from "@/types";
import { dash } from "./format";

export type ColumnGroup = "基础" | "时间" | "机场与机位" | "航班属性" | "航空器" | "航线" | "异常";

export type ColumnDef = {
  id: string;
  label: string;
  group: ColumnGroup;
  defaultVisible: boolean;
  sortable?: boolean;
  value: (flight: Flight) => string;
  render?: (flight: Flight) => ReactNode;
  className?: string;
};

const text = (value: string) => dash(value);

export const COLUMNS: ColumnDef[] = [
  {
    id: "flightCode",
    label: "航班信息",
    group: "基础",
    defaultVisible: true,
    sortable: true,
    value: (flight) => flight.flightCode,
    render: (flight) => <span className="font-semibold text-foreground">{flight.flightCode}</span>,
  },
  {
    id: "route",
    label: "起降机场",
    group: "基础",
    defaultVisible: true,
    sortable: true,
    value: (flight) => `${flight.origin} ${flight.destination}`,
    render: (flight) => (
      <span title={`${flight.origin} → ${flight.destination}`}>
        {text(flight.origin)} <span className="text-slate-400">→</span> {text(flight.destination)}
      </span>
    ),
  },
  {
    id: "schedTakeoff",
    label: "计划起飞",
    group: "时间",
    defaultVisible: true,
    sortable: true,
    value: (flight) => flight.schedTakeoff,
    render: (flight) => <span className="font-mono tabular-nums">{text(flight.schedTakeoff)}</span>,
  },
  {
    id: "actualTakeoff",
    label: "实际起飞",
    group: "时间",
    defaultVisible: true,
    sortable: true,
    value: (flight) => flight.actualTakeoff,
    render: (flight) => <span className="font-mono tabular-nums">{text(flight.actualTakeoff)}</span>,
  },
  {
    id: "schedLanding",
    label: "计划降落",
    group: "时间",
    defaultVisible: true,
    sortable: true,
    value: (flight) => flight.schedLanding,
    render: (flight) => <span className="font-mono tabular-nums">{text(flight.schedLanding)}</span>,
  },
  {
    id: "actualLanding",
    label: "实际降落",
    group: "时间",
    defaultVisible: true,
    sortable: true,
    value: (flight) => flight.actualLanding,
    render: (flight) => <span className="font-mono tabular-nums">{text(flight.actualLanding)}</span>,
  },
  {
    id: "execDate",
    label: "航班日期",
    group: "基础",
    defaultVisible: true,
    sortable: true,
    value: (flight) => flight.execDate,
    render: (flight) => <span className="font-mono tabular-nums">{text(flight.execDate)}</span>,
  },
  {
    id: "status",
    label: "航班状态",
    group: "基础",
    defaultVisible: true,
    sortable: true,
    value: (flight) => flight.statusLabel,
    render: (flight) => <StatusBadge label={flight.statusLabel} tone={flight.statusTone} />,
  },
  {
    id: "origin",
    label: "起飞机场",
    group: "机场与机位",
    defaultVisible: false,
    sortable: true,
    value: (flight) => flight.origin,
  },
  {
    id: "destination",
    label: "降落机场",
    group: "机场与机位",
    defaultVisible: false,
    sortable: true,
    value: (flight) => flight.destination,
  },
  {
    id: "estimatedTakeoff",
    label: "预计起飞",
    group: "时间",
    defaultVisible: false,
    sortable: true,
    value: (flight) => flight.estimatedTakeoff,
  },
  {
    id: "estimatedLanding",
    label: "预计降落",
    group: "时间",
    defaultVisible: false,
    sortable: true,
    value: (flight) => flight.estimatedLanding,
  },
  {
    id: "airlineName",
    label: "航空公司",
    group: "航班属性",
    defaultVisible: false,
    sortable: true,
    value: (flight) => flight.airlineName,
  },
  {
    id: "airlineCode",
    label: "航司代码",
    group: "航班属性",
    defaultVisible: false,
    sortable: true,
    value: (flight) => flight.airlineCode,
  },
  {
    id: "agent",
    label: "代理",
    group: "航班属性",
    defaultVisible: false,
    sortable: true,
    value: (flight) => flight.agent,
  },
  {
    id: "flightTask",
    label: "航班任务",
    group: "航班属性",
    defaultVisible: false,
    sortable: true,
    value: (flight) => flight.flightTask,
  },
  {
    id: "regionLabel",
    label: "区域",
    group: "航班属性",
    defaultVisible: false,
    sortable: true,
    value: (flight) => flight.regionLabel,
  },
  {
    id: "aircraftType",
    label: "机型",
    group: "航空器",
    defaultVisible: false,
    sortable: true,
    value: (flight) => flight.aircraftType,
  },
  {
    id: "aircraftTail",
    label: "机号",
    group: "航空器",
    defaultVisible: false,
    sortable: true,
    value: (flight) => flight.aircraftTail,
  },
  {
    id: "stand",
    label: "机位",
    group: "航空器",
    defaultVisible: false,
    sortable: true,
    value: (flight) => flight.stand,
  },
  {
    id: "terminal",
    label: "航站楼",
    group: "航空器",
    defaultVisible: false,
    sortable: true,
    value: (flight) => flight.terminal,
  },
  {
    id: "gate",
    label: "登机口",
    group: "航空器",
    defaultVisible: false,
    sortable: true,
    value: (flight) => flight.gate,
  },
  {
    id: "remoteLabel",
    label: "远程机位",
    group: "航空器",
    defaultVisible: false,
    sortable: true,
    value: (flight) => flight.remoteLabel,
  },
  {
    id: "statusAbnormal",
    label: "异常状态",
    group: "异常",
    defaultVisible: false,
    sortable: true,
    value: (flight) => flight.statusAbnormal,
  },
  {
    id: "abnormalReason",
    label: "异常原因",
    group: "异常",
    defaultVisible: false,
    sortable: true,
    value: (flight) => flight.abnormalReason,
  },
  {
    id: "adjustStatus",
    label: "调整状态",
    group: "异常",
    defaultVisible: false,
    sortable: true,
    value: (flight) => flight.adjustStatus,
  },
  {
    id: "routeFull",
    label: "航线（中文）",
    group: "航线",
    defaultVisible: false,
    sortable: true,
    value: (flight) => flight.routeFull,
  },
  {
    id: "routeIata",
    label: "航线三字码",
    group: "航线",
    defaultVisible: false,
    sortable: true,
    value: (flight) => flight.routeIata,
  },
  {
    id: "routeIcao",
    label: "航线四字码",
    group: "航线",
    defaultVisible: false,
    sortable: true,
    value: (flight) => flight.routeIcao,
  },
  {
    id: "routeSegment",
    label: "航段（中文）",
    group: "航线",
    defaultVisible: false,
    sortable: true,
    value: (flight) => flight.routeSegment,
  },
  {
    id: "routeSegmentIcao",
    label: "航段四字码",
    group: "航线",
    defaultVisible: false,
    sortable: true,
    value: (flight) => flight.routeSegmentIcao,
  },
];

export const DEFAULT_VISIBLE_COLUMNS = COLUMNS.filter((column) => column.defaultVisible).map(
  (column) => column.id,
);
