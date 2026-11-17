import fs from "node:fs";
import { normalizeRecord } from "../functions/lib/normalize.mjs";

const source = process.env.ZZC_SNAPSHOT;
if (!source) throw new Error("Set ZZC_SNAPSHOT to the saved zzcargo-snapshot.json path");
const raw = JSON.parse(fs.readFileSync(source, "utf8"));
const flights = raw.records.slice(0, 40).map((record) => normalizeRecord(record, {}));
fs.mkdirSync("dev/fixtures", { recursive: true });
fs.writeFileSync("dev/fixtures/flights.sample.json", JSON.stringify({ flights }, null, 2));
console.log(`Wrote ${flights.length} sample flights`);
