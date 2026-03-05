import type { ComponentType, ReactNode } from "react";
import type { RouteObject } from "react-router";
import type { LatLng, LatLngBounds, Icon } from "leaflet";

export interface ModuleDefinition {
  id: string;
  name: string; // i18n key
  icon: ComponentType; // Lucide icon for nav
  routes: RouteObject[];
  mapLayers?: MapLayerProvider[];
  searchProvider?: SearchProvider;
  dashboardCard?: ComponentType;
}

export interface MapLayerProvider {
  id: string;
  name: string; // i18n key for toggle label
  icon: ComponentType;
  defaultVisible: boolean;
  getMarkers(bounds: LatLngBounds): Promise<MapMarker[]>;
  getPopupContent(marker: MapMarker): ReactNode;
  refreshInterval?: number; // ms, for real-time layers
}

export interface MapMarker {
  id: string;
  position: LatLng;
  icon?: Icon;
  [key: string]: unknown; // module-specific data for popups
}

export interface SearchProvider {
  moduleId: string;
  search(query: string, location?: LatLng): Promise<SearchResult[]>;
  getSuggestions?(partial: string): Promise<string[]>;
}

export interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  position: LatLng;
  moduleId: string;
}
