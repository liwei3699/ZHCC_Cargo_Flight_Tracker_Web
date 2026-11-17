import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";
import { useFlights } from "@/hooks/use-flights";

vi.mock("sonner", () => ({ toast: { info: vi.fn() } }));

const flight = { id: 1 } as never;
const meta = {
  syncedAt: "2026-11-17T21:32:01+08:00",
  sourceTotal: 1,
  recordCount: 1,
  sourcePages: 1,
  stale: false,
  syncing: false,
  warning: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  globalThis.fetch = vi.fn(
    async () =>
      new Response(JSON.stringify({ ok: true, data: { flights: [flight], meta } }), {
        status: 200,
      }),
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useFlights", () => {
  it("loads on mount and exposes data", async () => {
    const { result } = renderHook(() => useFlights());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.flights).toEqual([flight]);
    expect(result.current.meta?.recordCount).toBe(1);
  });

  it("refreshes manually", async () => {
    const { result } = renderHook(() => useFlights());
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.refresh();
    });
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/functions/v1/app/api/refresh",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("shows the cooldown message on a throttled manual refresh", async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true, data: { flights: [flight], meta } }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            ok: true,
            data: {
              flights: [flight],
              meta: { ...meta, refreshed: false, cooldownSeconds: 20 },
            },
          }),
          { status: 200 },
        ),
      );

    const { result } = renderHook(() => useFlights());
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.refresh();
    });
    expect(toast.info).toHaveBeenCalledWith("刚刚已同步，请 20 秒后再试");
  });

  it("schedules a 30-minute auto refresh", async () => {
    const spy = vi.spyOn(globalThis, "setInterval");
    const { result } = renderHook(() => useFlights());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(spy).toHaveBeenCalledWith(expect.any(Function), 30 * 60 * 1000);
  });
});
