import { apiFetch } from "@/api/client";
import type { RouteDetailResponse } from "./route-types";

export async function fetchRouteDetail(
  routeId: string,
  direction: number,
  city: string,
): Promise<RouteDetailResponse> {
  const params = new URLSearchParams({
    routeId,
    direction: String(direction),
    city,
  });
  const json = await apiFetch<{ ok: true } & RouteDetailResponse>(
    `/api/transit/route?${params}`,
  );
  return { route: json.route, stops: json.stops, buses: json.buses };
}
