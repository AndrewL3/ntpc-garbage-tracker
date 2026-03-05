import { Popup } from "react-leaflet";
import StationDetailContent from "../stops/StationDetailContent";
import type { YouBikeStation } from "../api/client";

interface StationPopupProps {
  station: YouBikeStation;
  onClose: () => void;
}

export default function StationPopup({ station, onClose }: StationPopupProps) {
  return (
    <Popup
      position={[station.lat, station.lon]}
      offset={[0, -8]}
      closeButton
      eventHandlers={{ remove: onClose }}
      className="station-popup"
    >
      <div className="min-w-64 max-w-80">
        <div className="mb-3">
          <h3 className="text-foreground text-base font-bold leading-tight">
            {station.name}
          </h3>
          <p className="text-muted-foreground text-sm">{station.nameEn}</p>
        </div>
        <StationDetailContent station={station} />
      </div>
    </Popup>
  );
}
