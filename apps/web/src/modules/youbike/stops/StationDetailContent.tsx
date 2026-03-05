import { useTranslation } from "react-i18next";
import { Bike, ParkingSquare, MapPin, Clock } from "lucide-react";
import { getAvailabilityColor } from "../map/StationMarker";
import type { YouBikeStation } from "../api/client";

interface StationDetailContentProps {
  station: YouBikeStation;
}

export default function StationDetailContent({
  station,
}: StationDetailContentProps) {
  const { t } = useTranslation();
  const color = getAvailabilityColor(station);

  return (
    <div className="space-y-4">
      {/* Availability hero */}
      <div className="rounded-xl bg-card px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <Bike className="mt-0.5 h-6 w-6 shrink-0" style={{ color }} />
            <div>
              <p className="text-sm text-muted-foreground">
                {t("youbike.availableBikes")}
              </p>
              <p className="text-2xl font-bold tabular-nums" style={{ color }}>
                {station.availableBikes}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ParkingSquare className="mt-0.5 h-6 w-6 shrink-0 text-muted-foreground" />
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                {t("youbike.emptyDocks")}
              </p>
              <p className="text-2xl font-bold tabular-nums">
                {station.emptyDocks}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="flex items-start gap-2 px-1 text-sm text-muted-foreground">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{station.address}</span>
      </div>

      {/* Last updated */}
      <div className="flex items-center gap-2 px-1 text-xs text-muted-foreground">
        <Clock className="h-3 w-3 shrink-0" />
        <span>
          {t("youbike.lastUpdated")}: {station.updatedAt}
        </span>
      </div>
    </div>
  );
}
