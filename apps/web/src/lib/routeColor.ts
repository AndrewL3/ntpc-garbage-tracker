const ROUTE_PALETTE = [
  "#0d9488", // teal
  "#f97316", // orange
  "#8b5cf6", // violet
  "#f43f5e", // rose
  "#f59e0b", // amber
  "#0ea5e9", // sky
  "#84cc16", // lime
  "#d946ef", // fuchsia
] as const;

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function getRouteColor(lineId: string): string {
  return ROUTE_PALETTE[hashString(lineId) % ROUTE_PALETTE.length];
}

export { ROUTE_PALETTE };
