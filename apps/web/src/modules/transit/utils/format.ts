import type { TFunction } from "i18next";

export function formatEta(
  minutes: number | null,
  stopStatus: number,
  t: TFunction,
): string {
  if (stopStatus === 4) return t("transit.notOperating");
  if (stopStatus === 1) return t("transit.notDeparted");
  if (stopStatus === 3) return t("transit.lastBusLeft");
  if (minutes == null) return "--";
  if (minutes <= 0) return t("transit.arriving");
  return `${minutes} ${t("transit.min")}`;
}

export function etaColor(minutes: number | null, stopStatus: number): string {
  if (stopStatus !== 0 || minutes == null) return "text-muted-foreground";
  if (minutes <= 1) return "text-red-500";
  if (minutes <= 5) return "text-amber-500";
  return "text-foreground";
}
