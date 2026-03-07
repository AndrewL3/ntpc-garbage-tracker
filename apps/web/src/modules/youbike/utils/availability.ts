import type { YouBikeStation } from "../api/client";

export function getAvailabilityColor(station: YouBikeStation): string {
  if (station.status === "inactive") return "#9ca3af";
  if (station.availableBikes >= 5) return "#22c55e";
  if (station.availableBikes >= 1) return "#f59e0b";
  return "#ef4444";
}
