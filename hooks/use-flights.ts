import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ApiError, fetchFlights, refreshFlights } from "@/lib/api";
import type { ApiMeta, Flight } from "@/types";

const AUTO_REFRESH_MS = 30 * 60 * 1000;

export function useFlights() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [meta, setMeta] = useState<ApiMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(0);
  const lastUpdatedRef = useRef(0);
  const controller = useRef<AbortController | null>(null);

  const load = useCallback(async (mode: "initial" | "auto" | "manual") => {
    controller.current?.abort();
    const next = new AbortController();
    controller.current = next;
    if (mode === "initial") setLoading(true);
    if (mode === "manual") setRefreshing(true);
    setError(null);
    try {
      const data =
        mode === "manual" ? await refreshFlights(next.signal) : await fetchFlights(next.signal);
      setFlights(data.flights);
      setMeta(data.meta);
      const now = Date.now();
      setLastUpdated(now);
      lastUpdatedRef.current = now;
      if (
        mode === "manual" &&
        data.meta.refreshed === false &&
        (data.meta.cooldownSeconds ?? 0) > 0
      ) {
        toast.info(`刚刚已同步，请 ${data.meta.cooldownSeconds} 秒后再试`);
      }
      if (data.meta.syncing) {
        setTimeout(() => {
          void load("auto");
        }, 2000);
      }
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === "AbortError") return;
      const message =
        cause instanceof ApiError
          ? cause.code === "network_error"
            ? "网络请求失败，请检查连接。"
            : cause.message
          : "数据加载失败，请稍后重试。";
      setError(message);
    } finally {
      if (mode === "initial") setLoading(false);
      if (mode === "manual") setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load("initial");
    const timer = setInterval(() => {
      if (!document.hidden) void load("auto");
    }, AUTO_REFRESH_MS);
    const onVisible = () => {
      if (!document.hidden && Date.now() - lastUpdatedRef.current > AUTO_REFRESH_MS) {
        void load("auto");
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
      controller.current?.abort();
    };
  }, [load]);

  return {
    flights,
    meta,
    loading,
    refreshing,
    error,
    lastUpdated,
    refresh: () => load("manual"),
  };
}
