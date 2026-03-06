import { Popup } from "react-leaflet";
import TaipeiStopDetailContent from "../stops/TaipeiStopDetailContent";
import type { TaipeiGarbageStop } from "../api/taipei-client";

interface TaipeiStopPopupProps {
  stop: TaipeiGarbageStop;
  onClose: () => void;
}

export default function TaipeiStopPopup({
  stop,
  onClose,
}: TaipeiStopPopupProps) {
  return (
    <Popup
      position={[stop.lat, stop.lon]}
      offset={[0, -8]}
      closeButton
      eventHandlers={{ remove: onClose }}
      className="stop-popup"
    >
      <div className="min-w-64 max-w-80">
        <div className="mb-3">
          <h3 className="text-foreground text-base font-bold leading-tight">
            {stop.address}
          </h3>
          <p className="text-muted-foreground text-sm">
            {stop.routeName} {stop.trip}
          </p>
        </div>
        <TaipeiStopDetailContent stop={stop} />
      </div>
    </Popup>
  );
}
