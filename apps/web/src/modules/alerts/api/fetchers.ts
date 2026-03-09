import { apiFetch } from "@/api/client";
import type { ActiveAlert } from "./types";

export async function fetchActiveAlerts(): Promise<ActiveAlert[]> {
  const data = await apiFetch<{ ok: boolean; alerts: ActiveAlert[] }>(
    "/api/alerts/active",
  );
  return data.alerts;
}
