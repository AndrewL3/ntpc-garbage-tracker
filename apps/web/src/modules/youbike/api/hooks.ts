import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchYouBikeStations, type MapBounds } from "./client";

/** Round to 3 decimals (~111m) to prevent cache key explosion on map pan */
function snap(n: number): number {
  return Math.round(n * 1_000) / 1_000;
}

export function useYouBikeStations(bounds: MapBounds | null) {
  const snapped = bounds
    ? {
        north: snap(bounds.north),
        south: snap(bounds.south),
        east: snap(bounds.east),
        west: snap(bounds.west),
      }
    : null;

  return useQuery({
    queryKey: ["youbike-stations", snapped],
    queryFn: () => fetchYouBikeStations(snapped!),
    enabled: snapped !== null,
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}
