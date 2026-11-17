import type { ApiMeta, Flight } from "@/types";

export class ApiError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: { accept: "application/json", ...(init?.headers ?? {}) },
    });
  } catch {
    throw new ApiError("network_error", "网络请求失败");
  }
  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.ok) {
    throw new ApiError(body?.error?.code ?? "request_failed", body?.error?.message ?? "请求失败");
  }
  return body as T;
}

function validate(data: { flights?: unknown; meta?: unknown }) {
  if (!Array.isArray(data.flights) || !data.meta || typeof data.meta !== "object") {
    throw new ApiError("invalid_response", "数据格式异常");
  }
  return data as { flights: Flight[]; meta: ApiMeta };
}

export async function fetchFlights(signal?: AbortSignal) {
  const body = await request<{ ok: true; data: { flights: Flight[]; meta: ApiMeta } }>(
    "/functions/v1/app/api/flights",
    { signal },
  );
  return validate(body.data);
}

export async function refreshFlights(signal?: AbortSignal) {
  const body = await request<{ ok: true; data: { flights: Flight[]; meta: ApiMeta } }>(
    "/functions/v1/app/api/refresh",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}",
      signal,
    },
  );
  return validate(body.data);
}

export function warningText(warning: string | null) {
  switch (warning) {
    case "upstream_unavailable":
      return "源站暂时不可用，当前显示缓存数据。";
    case "upstream_backoff":
      return "源站同步失败，稍后会自动重试。";
    case "sync_timeout":
      return "源站同步超时，当前显示缓存数据。";
    default:
      return "";
  }
}
