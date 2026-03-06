import { useQuery } from "@tanstack/react-query";
import { fetchRouteDetail } from "./route-fetchers";

export function useRouteDetail(
  routeId: string | undefined,
  direction: number,
  city: string,
) {
  return useQuery({
    queryKey: ["bus-route", routeId, direction, city],
    queryFn: () => fetchRouteDetail(routeId!, direction, city),
    enabled: routeId !== undefined,
    staleTime: 15_000,
    refetchInterval: 20_000,
  });
}
