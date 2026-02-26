import { describe, expect, it } from "@jest/globals";
import { haversineMeters } from "../geo.js";

describe("haversineMeters", () => {
  it("returns 0 for identical points", () => {
    expect(haversineMeters(25.033, 121.565, 25.033, 121.565)).toBe(0);
  });

  it("returns ≈ 110-112 km for 1 degree latitude difference", () => {
    const distance = haversineMeters(25.0, 121.0, 26.0, 121.0);
    expect(distance).toBeGreaterThan(110_000);
    expect(distance).toBeLessThan(112_000);
  });

  it("returns ≈ 250-400 m for two real Wanli stops", () => {
    // Two nearby stops in Wanli district, New Taipei City
    const distance = haversineMeters(25.1745, 121.6891, 25.1763, 121.6905);
    expect(distance).toBeGreaterThan(200);
    expect(distance).toBeLessThan(400);
  });
});
