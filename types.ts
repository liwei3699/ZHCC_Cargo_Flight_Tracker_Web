export type StatusTone = "neutral" | "info" | "success" | "warning" | "danger" | "muted";

export type Flight = {
  id: number | string;
  flightNo: string;
  airlineCode: string;
  flightCode: string;
  airlineName: string;
  agent: string;
  flightTask: string;
  execDate: string;
  origin: string;
  destination: string;
  routeFull: string;
  routeIata: string;
  routeIcao: string;
  routeSegment: string;
  routeSegmentIcao: string;
  ioAttr: string;
  ioLabel: string;
  region: string;
  regionLabel: string;
  schedTakeoff: string;
  estimatedTakeoff: string;
  actualTakeoff: string;
  schedLanding: string;
  estimatedLanding: string;
  actualLanding: string;
  statusNormal: string;
  statusAbnormal: string;
  statusLabel: string;
  statusTone: StatusTone;
  abnormalReason: string;
  adjustStatus: string;
  aircraftType: string;
  aircraftFamily: string;
  aircraftSubtype: string;
  aircraftTail: string;
  stand: string;
  gate: string;
  terminal: string;
  remote: string;
  remoteLabel: string;
};

export type ApiMeta = {
  syncedAt: string;
  sourceTotal: number;
  recordCount: number;
  sourcePages: number;
  stale: boolean;
  syncing: boolean;
  warning: string | null;
  refreshed?: boolean;
  cooldownSeconds?: number | null;
};

export type DatePreset =
  | "ALL"
  | "TODAY"
  | "YESTERDAY"
  | "TOMORROW"
  | "DAY_AFTER"
  | "NEXT_7"
  | "CUSTOM";

export type Filters = {
  search: string;
  flightNo: string;
  ioAttr: "ALL" | "A" | "D";
  agent: string;
  origin: string;
  destination: string;
  datePreset: DatePreset;
  dateFrom: string;
  dateTo: string;
  status: string;
  region: string;
  aircraftFamily: string;
  aircraftType: string;
};

export type SortState = { key: string; direction: "asc" | "desc" };
