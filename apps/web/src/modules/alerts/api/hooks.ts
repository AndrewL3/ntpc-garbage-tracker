import { useQuery } from "@tanstack/react-query";
import { fetchActiveAlerts } from "./fetchers";

export function useActiveAlerts() {
  return useQuery({
    queryKey: ["alerts", "active"],
    queryFn: fetchActiveAlerts,
    staleTime: 300_000, // 5 minutes
  });
}
