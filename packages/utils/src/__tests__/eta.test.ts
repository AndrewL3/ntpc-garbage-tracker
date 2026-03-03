import { describe, expect, it } from "@jest/globals";
import { computeEtaDelta, type RouteStop, type PassEvent } from "../eta.js";

const makeStop = (rank: number, scheduledTime: string): RouteStop => ({
  rank,
  name: `Stop ${rank}`,
  village: "村里",
  scheduledTime,
  garbageDays: [true, true, true, true, true, true, true],
  recyclingDays: [false, false, false, false, false, false, false],
  foodscrapsDays: [false, false, false, false, false, false, false],
});

describe("computeEtaDelta", () => {
  const today = "2026-03-01"; // Sunday (dow = 0)
  const dow = 0;

  it("returns inactive status when no pass events exist", () => {
    const stops = [makeStop(1, "15:30"), makeStop(2, "15:35")];
    const result = computeEtaDelta(stops, [], today, dow);

    expect(result.progress.status).toBe("inactive");
    expect(result.progress.deltaMinutes).toBeNull();
    expect(result.progress.leadingStopRank).toBeNull();
    expect(result.stops[0].passedAt).toBeNull();
    expect(result.stops[0].eta).toBeNull();
    expect(result.stops[0].collectsToday).toEqual(["garbage"]);
  });

  it("computes delta when vehicle is 2 minutes late", () => {
    const stops = [
      makeStop(1, "15:30"),
      makeStop(2, "15:35"),
      makeStop(3, "15:40"),
    ];
    const events: PassEvent[] = [
      {
        stopRank: 1,
        car: "KED-0605",
        passedAt: new Date("2026-03-01T07:32:00.000Z"),
      }, // 15:32 Taipei = +2 min
    ];
    const result = computeEtaDelta(stops, events, today, dow);

    expect(result.progress.status).toBe("active");
    expect(result.progress.deltaMinutes).toBe(2);
    expect(result.progress.leadingStopRank).toBe(1);

    // Stop 1: passed
    expect(result.stops[0].passedAt).toBe("2026-03-01T15:32:00+08:00");
    expect(result.stops[0].eta).toBeNull();

    // Stop 2: ETA = 15:35 + 2min = 15:37
    expect(result.stops[1].passedAt).toBeNull();
    expect(result.stops[1].eta).toBe("2026-03-01T15:37:00+08:00");

    // Stop 3: ETA = 15:40 + 2min = 15:42
    expect(result.stops[2].eta).toBe("2026-03-01T15:42:00+08:00");
  });

  it("uses leading vehicle (highest rank) for delta across multiple cars", () => {
    const stops = [
      makeStop(1, "15:30"),
      makeStop(2, "15:35"),
      makeStop(3, "15:40"),
    ];
    const events: PassEvent[] = [
      {
        stopRank: 1,
        car: "KED-0605",
        passedAt: new Date("2026-03-01T07:32:00.000Z"),
      },
      {
        stopRank: 2,
        car: "KED-0605",
        passedAt: new Date("2026-03-01T07:38:00.000Z"),
      }, // 15:38, +3 min
      {
        stopRank: 1,
        car: "ABC-1234",
        passedAt: new Date("2026-03-01T07:33:00.000Z"),
      }, // behind
    ];
    const result = computeEtaDelta(stops, events, today, dow);

    expect(result.progress.leadingStopRank).toBe(2);
    expect(result.progress.deltaMinutes).toBe(3); // based on stop 2: 15:38 - 15:35

    // Stop 3: ETA = 15:40 + 3 = 15:43
    expect(result.stops[2].eta).toBe("2026-03-01T15:43:00+08:00");
  });

  it("returns completed status when all stops are passed", () => {
    const stops = [makeStop(1, "15:30"), makeStop(2, "15:35")];
    const events: PassEvent[] = [
      {
        stopRank: 1,
        car: "KED-0605",
        passedAt: new Date("2026-03-01T07:30:00.000Z"),
      },
      {
        stopRank: 2,
        car: "KED-0605",
        passedAt: new Date("2026-03-01T07:35:00.000Z"),
      },
    ];
    const result = computeEtaDelta(stops, events, today, dow);

    expect(result.progress.status).toBe("completed");
    expect(result.stops[0].passedAt).not.toBeNull();
    expect(result.stops[1].passedAt).not.toBeNull();
    expect(result.stops[0].eta).toBeNull();
    expect(result.stops[1].eta).toBeNull();
  });

  it("handles negative delta (truck early)", () => {
    const stops = [makeStop(1, "15:30"), makeStop(2, "15:35")];
    const events: PassEvent[] = [
      {
        stopRank: 1,
        car: "KED-0605",
        passedAt: new Date("2026-03-01T07:27:00.000Z"),
      }, // 15:27, -3 min
    ];
    const result = computeEtaDelta(stops, events, today, dow);

    expect(result.progress.deltaMinutes).toBe(-3);
    // Stop 2: ETA = 15:35 - 3 = 15:32
    expect(result.stops[1].eta).toBe("2026-03-01T15:32:00+08:00");
  });

  it("enforces monotonicity — marks all stops up to leading rank as passed even with gaps in pass events", () => {
    const stops = [
      makeStop(1, "17:27"),
      makeStop(2, "17:30"),
      makeStop(3, "17:35"),
      makeStop(4, "17:41"),
      makeStop(5, "17:42"),
    ];
    // Gap: pass events exist for ranks 1, 4, 5 but NOT 2, 3
    // (simulates old inference code that didn't backfill)
    const events: PassEvent[] = [
      {
        stopRank: 1,
        car: "KEG-2913",
        passedAt: new Date("2026-03-01T09:27:14.000Z"), // 17:27:14 Taipei
      },
      {
        stopRank: 4,
        car: "KEG-2913",
        passedAt: new Date("2026-03-01T09:41:14.000Z"), // 17:41:14 Taipei
      },
      {
        stopRank: 5,
        car: "KEG-2913",
        passedAt: new Date("2026-03-01T09:42:42.000Z"), // 17:42:42 Taipei
      },
    ];
    const result = computeEtaDelta(stops, events, today, dow);

    expect(result.progress.leadingStopRank).toBe(5);
    expect(result.progress.status).toBe("completed");

    // ALL stops up to leading rank (5) must show as passed — no gaps
    expect(result.stops[0].passedAt).not.toBeNull(); // rank 1: has event
    expect(result.stops[1].passedAt).not.toBeNull(); // rank 2: NO event, but must be passed (monotonic)
    expect(result.stops[2].passedAt).not.toBeNull(); // rank 3: NO event, but must be passed (monotonic)
    expect(result.stops[3].passedAt).not.toBeNull(); // rank 4: has event
    expect(result.stops[4].passedAt).not.toBeNull(); // rank 5: has event

    // Gap stops should NOT show ETA (they're passed)
    expect(result.stops[1].eta).toBeNull();
    expect(result.stops[2].eta).toBeNull();
  });

  it("skips ETA for stops with unparseable scheduledTime", () => {
    const stops = [
      makeStop(1, "15:30"),
      { ...makeStop(2, "bad"), scheduledTime: "bad" },
    ];
    const events: PassEvent[] = [
      {
        stopRank: 1,
        car: "KED-0605",
        passedAt: new Date("2026-03-01T07:32:00.000Z"),
      },
    ];
    const result = computeEtaDelta(stops, events, today, dow);

    expect(result.stops[1].eta).toBeNull();
  });
});
