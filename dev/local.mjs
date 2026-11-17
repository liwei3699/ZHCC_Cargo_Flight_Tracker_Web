import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { application } from "../functions/routes.mjs";
import { createFakeDb } from "./fake-db.mjs";

const fixture = JSON.parse(
  await readFile(new URL("./fixtures/flights.sample.json", import.meta.url), "utf8"),
);
const db = createFakeDb();
db.tables.flight_snapshots.push({
  id: 1,
  payload: fixture.flights,
  synced_at: new Date().toISOString(),
  source_total: fixture.flights.length,
  source_pages: 1,
  record_count: fixture.flights.length,
  airlines: {},
  airlines_synced_at: null,
});
db.tables.flight_sync_state.push({
  id: 1,
  refresh_started_at: null,
  refresh_token: "",
  last_attempt_at: null,
  last_error: null,
  last_manual_at: null,
});
const handle = application({ db });

const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://127.0.0.1:8000");
  if (!url.pathname.startsWith("/functions/v1/app")) {
    res.writeHead(404);
    res.end();
    return;
  }
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const request = new Request(url, {
    method: req.method,
    headers: req.headers,
    body: ["GET", "HEAD"].includes(req.method) ? undefined : Buffer.concat(chunks),
  });
  try {
    const response = await handle({ request });
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch {
    res.writeHead(500, { "content-type": "application/json" });
    res.end(
      JSON.stringify({ ok: false, error: { code: "local_failure", message: "本地服务失败" } }),
    );
  }
});

server.listen(8000, "127.0.0.1", () => {
  console.log("Local API: http://127.0.0.1:8000");
});
