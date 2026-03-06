import { apiFetch } from "@/api/client";

export interface TaipeiGarbageStop {
  id: string;
  routeId: string;
  routeName: string;
  trip: string;
  rank: number;
  district: string;
  village: string;
  address: string;
  arrivalTime: string;
  departureTime: string;
  lat: number;
  lon: number;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export async function fetchTaipeiStops(
  bounds: MapBounds,
): Promise<TaipeiGarbageStop[]> {
  const params = new URLSearchParams({
    north: String(bounds.north),
    south: String(bounds.south),
    east: String(bounds.east),
    west: String(bounds.west),
  });
  const json = await apiFetch<{ ok: true; stops: TaipeiGarbageStop[] }>(
    `/api/garbage/taipei-stops?${params}`,
  );
  return json.stops;
}
