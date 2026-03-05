import { apiFetch } from "@/api/client";

export interface YouBikeStation {
  id: string;
  name: string;
  nameEn: string;
  district: string;
  lat: number;
  lon: number;
  totalDocks: number;
  availableBikes: number;
  emptyDocks: number;
  status: "active" | "inactive";
  address: string;
  city: "ntc" | "tpe";
  updatedAt: string;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export async function fetchYouBikeStations(
  bounds: MapBounds,
): Promise<YouBikeStation[]> {
  const params = new URLSearchParams({
    north: String(bounds.north),
    south: String(bounds.south),
    east: String(bounds.east),
    west: String(bounds.west),
  });
  const json = await apiFetch<{ ok: true; stations: YouBikeStation[] }>(
    `/api/youbike/stations?${params}`,
  );
  return json.stations;
}
