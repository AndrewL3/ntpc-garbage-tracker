import { AlertTriangle } from "lucide-react";
import type { ModuleDefinition } from "@/core/types";
import AlertsDashboardCard from "./dashboard/AlertsDashboardCard";

export const alertsModule: ModuleDefinition = {
  id: "alerts",
  name: "nav.alerts",
  icon: AlertTriangle,
  routes: [],
  mapLayers: [],
  dashboardCard: AlertsDashboardCard,
};
