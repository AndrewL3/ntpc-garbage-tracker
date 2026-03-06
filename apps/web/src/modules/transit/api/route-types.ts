export interface BusRouteDetail {
  routeId: string;
  routeName: string;
  routeNameEn: string;
  departure: string;
  destination: string;
  city: string;
}

export interface BusRouteStop {
  stopId: string;
  name: string;
  nameEn: string;
  lat: number;
  lon: number;
  sequence: number;
  estimateMinutes: number | null;
  stopStatus: number;
}

export interface BusVehicle {
  plateNumb: string;
  lat: number;
  lon: number;
  speed: number;
  nearStopSequence: number | null;
}

export interface RouteDetailResponse {
  route: BusRouteDetail;
  stops: BusRouteStop[];
  buses: BusVehicle[];
}
