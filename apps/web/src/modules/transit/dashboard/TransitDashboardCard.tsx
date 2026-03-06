import { useTranslation } from "react-i18next";
import { Bus } from "lucide-react";
import { useNavigate } from "react-router";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useBusStations } from "../api/hooks";

export default function TransitDashboardCard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { position, located } = useGeolocation();

  const bounds = located
    ? {
        north: position.lat + 0.003,
        south: position.lat - 0.003,
        east: position.lon + 0.003,
        west: position.lon - 0.003,
      }
    : null;

  const { data: stations, isLoading, isError } = useBusStations(bounds);
  const nearby = stations?.slice(0, 3);

  return (
    <div className="rounded-xl bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-semibold">
            {t("dashboard.transit.title")}
          </h3>
        </div>
        <button
          onClick={() => navigate("/map")}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          {t("dashboard.viewOnMap")}
        </button>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-8 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      )}

      {!isLoading && nearby && nearby.length > 0 && (
        <div className="space-y-2">
          {nearby.map((station) => (
            <div
              key={station.stationId}
              className="flex items-center justify-between text-sm"
            >
              <span className="truncate font-medium">{station.name}</span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {station.routes.length} {t("transit.routesServed")}
              </span>
            </div>
          ))}
        </div>
      )}

      {!isLoading && (!nearby || nearby.length === 0 || isError) && (
        <p className="text-sm text-muted-foreground">
          {t("dashboard.transit.noStops")}
        </p>
      )}
    </div>
  );
}
