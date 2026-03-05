import { Bike } from "lucide-react";
import type { ModuleDefinition } from "@/core/types";
import YouBikeMapLayer from "./map/YouBikeMapLayer";

export const youbikeModule: ModuleDefinition = {
  id: "youbike",
  name: "nav.youbike",
  icon: Bike,
  routes: [],
  mapLayers: [
    {
      id: "youbike",
      name: "map.layers.youbike",
      icon: Bike,
      defaultVisible: true,
      MapComponent: YouBikeMapLayer,
    },
  ],
};
