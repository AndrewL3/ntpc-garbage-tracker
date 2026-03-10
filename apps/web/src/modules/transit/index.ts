import { Bus } from "lucide-react";
import type { ModuleDefinition } from "@/core/types";
import TransitMapLayer from "./map/TransitMapLayer";
import TransitDashboardCard from "./dashboard/TransitDashboardCard";

export const transitModule: ModuleDefinition = {
  id: "transit",
  name: "nav.transit",
  icon: Bus,
  routes: [],
  mapLayers: [
    {
      id: "transit",
      name: "map.layers.transit",
      icon: Bus,
      defaultVisible: true,
      MapComponent: TransitMapLayer,
    },
  ],
  dashboardCard: TransitDashboardCard,
  favoritesConfig: { storageKey: "transit" },
};
