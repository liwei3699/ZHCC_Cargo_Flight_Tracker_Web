import { describe, expect, it } from "vitest";
import { sortFlights } from "@/lib/sort";
import { flights } from "../fixtures";

describe("sortFlights", () => {
  it("defaults to date desc and scheduled takeoff asc", () => {
    expect(
      sortFlights(flights, { key: "default", direction: "asc" }).map((flight) => flight.id),
    ).toEqual([7, 8, 2, 9, 1, 3, 4, 5, 6]);
  });

  it("sorts by flight code ascending", () => {
    expect(sortFlights(flights, { key: "flightCode", direction: "asc" })[0].flightCode).toBe(
      "3U6738",
    );
  });
});
