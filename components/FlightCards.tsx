import { StatusBadge } from "@/components/StatusBadge";
import { dash } from "@/lib/format";
import type { Flight } from "@/types";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-xs text-foreground">{dash(value)}</dd>
    </div>
  );
}

export function FlightCards({ flights }: { flights: Flight[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {flights.map((flight) => (
        <article
          key={flight.id}
          className="rounded-2xl border border-border bg-white p-4 shadow-[0_1px_3px_rgba(45,127,249,0.08)]"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-foreground">{flight.flightCode}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {dash(flight.origin)} <span className="text-slate-400">→</span>{" "}
                {dash(flight.destination)}
              </p>
            </div>
            <StatusBadge label={flight.statusLabel} tone={flight.statusTone} />
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
            <Field label="计划起飞" value={flight.schedTakeoff} />
            <Field label="实际起飞" value={flight.actualTakeoff} />
            <Field label="计划降落" value={flight.schedLanding} />
            <Field label="实际降落" value={flight.actualLanding} />
            <Field label="航班日期" value={flight.execDate} />
            <Field label="航空公司" value={flight.airlineName} />
          </dl>
          <details className="mt-4 border-t border-border pt-3 text-xs">
            <summary className="cursor-pointer font-medium text-primary">更多信息</summary>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
              <Field label="代理" value={flight.agent} />
              <Field label="航班任务" value={flight.flightTask} />
              <Field label="区域" value={flight.regionLabel} />
              <Field label="机型" value={flight.aircraftType} />
              <Field label="机号" value={flight.aircraftTail} />
              <Field label="机位" value={flight.stand} />
              <Field label="航站楼" value={flight.terminal} />
              <Field label="登机口" value={flight.gate} />
              <Field label="远程机位" value={flight.remoteLabel} />
              <Field label="异常状态" value={flight.statusAbnormal} />
              <Field label="异常原因" value={flight.abnormalReason} />
              <Field label="航线" value={flight.routeFull} />
            </dl>
          </details>
        </article>
      ))}
    </div>
  );
}
