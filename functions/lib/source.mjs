import {
  AIRLINE_PATH,
  AIRLINE_TIMEOUT_MS,
  FLIGHT_PATH,
  PAGE_CONCURRENCY,
  PAGE_RETRIES,
  PAGE_TIMEOUT_MS,
  SOURCE_BASE,
  SOURCE_HEADERS,
  SYNC_DEADLINE_MS,
} from "./constants.mjs";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function requestJson(url, body, { fetchImpl, signal, timeoutMs }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const abort = () => controller.abort();
  signal?.addEventListener("abort", abort, { once: true });
  try {
    const response = await fetchImpl(url, {
      method: "POST",
      headers: SOURCE_HEADERS,
      body,
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`http_${response.status}`);
    const json = await response.json();
    if (json?.code !== 200 || !json.data || !Array.isArray(json.data.records)) {
      throw new Error("invalid_payload");
    }
    return json.data;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", abort);
  }
}

export async function fetchFlightPage(page, { fetchImpl, signal }) {
  const body = new URLSearchParams({
    current: String(page),
    flightNo: "",
    execDate: "",
    ioAttr: "",
    agency: "",
    startStationCn: "",
    terminalStationCn: "",
  }).toString();
  let lastError;
  for (let attempt = 0; attempt <= PAGE_RETRIES; attempt += 1) {
    try {
      return await requestJson(`${SOURCE_BASE}${FLIGHT_PATH}?jstime=${Date.now()}`, body, {
        fetchImpl,
        signal,
        timeoutMs: PAGE_TIMEOUT_MS,
      });
    } catch (error) {
      lastError = error;
      if (attempt < PAGE_RETRIES) await sleep(500 * (attempt + 1));
    }
  }
  throw lastError;
}

export async function fetchAllFlightPages({ fetchImpl, signal }) {
  const deadline = Date.now() + SYNC_DEADLINE_MS;
  const first = await fetchFlightPage(1, { fetchImpl, signal });
  const pages = Number(first.pages);
  if (!Number.isInteger(pages) || pages < 1) throw new Error("invalid_pages");
  const results = new Map([[1, first]]);
  const queue = Array.from({ length: pages - 1 }, (_, index) => index + 2);

  async function worker() {
    while (queue.length) {
      if (Date.now() > deadline) throw new Error("sync_timeout");
      const page = queue.shift();
      results.set(page, await fetchFlightPage(page, { fetchImpl, signal }));
    }
  }

  await Promise.all(Array.from({ length: Math.min(PAGE_CONCURRENCY, queue.length) }, worker));
  return {
    pages,
    total: Number(first.total) || 0,
    records: Array.from({ length: pages }, (_, index) => results.get(index + 1)).flatMap((data) => data.records),
  };
}

async function fetchAirlinePage(page, { fetchImpl, signal }) {
  return requestJson(
    `${SOURCE_BASE}${AIRLINE_PATH}?jstime=${Date.now()}`,
    new URLSearchParams({ current: String(page) }).toString(),
    { fetchImpl, signal, timeoutMs: AIRLINE_TIMEOUT_MS },
  );
}

export async function fetchAirlines({ fetchImpl } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AIRLINE_TIMEOUT_MS);
  try {
    const first = await fetchAirlinePage(1, { fetchImpl, signal: controller.signal });
    const pages = Number(first.pages) || 1;
    const all = [...(first.records || [])];
    for (let page = 2; page <= pages; page += 1) {
      const data = await fetchAirlinePage(page, { fetchImpl, signal: controller.signal });
      all.push(...(data.records || []));
    }
    return Object.fromEntries(
      all
        .map((item) => [String(item.code || "").trim(), String(item.name || "").trim()])
        .filter(([code, name]) => code && name),
    );
  } finally {
    clearTimeout(timer);
  }
}
