import type { Flight } from "@/types";

export type AircraftFamilyOption = {
  label: string;
  types: { value: string; label: string }[];
};

export function deriveFilterOptions(flights: Flight[]) {
  const agents = [...new Set(flights.map((flight) => flight.agent).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "zh-CN"),
  );
  const origins = [...new Set(flights.map((flight) => flight.origin).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "zh-CN"),
  );
  const destinations = [
    ...new Set(flights.map((flight) => flight.destination).filter(Boolean)),
  ].sort((a, b) => a.localeCompare(b, "zh-CN"));

  const families = new Map<string, { value: string; label: string }[]>();
  for (const flight of flights) {
    const list = families.get(flight.aircraftFamily) ?? [];
    if (!list.some((item) => item.value === flight.aircraftType)) {
      list.push({ value: flight.aircraftType, label: flight.aircraftSubtype });
    }
    families.set(flight.aircraftFamily, list);
  }

  const order = [
    "波音737",
    "波音747",
    "波音757",
    "波音767",
    "波音777",
    "波音787",
    "空客A320",
    "空客A330",
    "空客A350",
    "空客A380",
    "中国商飞",
    "其他机型",
  ];
  const aircraftFamilies = order
    .filter((label) => families.has(label))
    .map((label) => ({
      label,
      types: families.get(label)!.sort((a, b) => a.value.localeCompare(b.value)),
    }));

  return { agents, origins, destinations, aircraftFamilies };
}
