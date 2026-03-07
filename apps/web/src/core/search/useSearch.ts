import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/api/client";

export interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  lat: number;
  lon: number;
  moduleId: string;
}

async function fetchSearch(query: string): Promise<SearchResult[]> {
  const json = await apiFetch<{ ok: true; results: SearchResult[] }>(
    `/api/search?q=${encodeURIComponent(query)}`,
  );
  return json.results;
}

export function useSearch(query: string) {
  return useQuery({
    queryKey: ["search", query],
    queryFn: () => fetchSearch(query),
    enabled: query.length >= 1,
    staleTime: 30_000,
  });
}
