import { describe, it, expect, jest, beforeEach } from "@jest/globals";

// Mock dependencies before imports
const mockDbSelect = jest.fn();
const mockDbInsert = jest.fn();
const mockRedisMget = jest.fn<any>();
const mockRedisPipeline = jest.fn<any>();
const mockPipelineSet = jest.fn<any>();
const mockPipelineExec = jest.fn<any>();

jest.unstable_mockModule("../../src/db.js", () => ({
  db: {
    select: mockDbSelect,
    insert: mockDbInsert,
  },
}));

jest.unstable_mockModule("../../src/redis.js", () => ({
  redis: {
    mget: mockRedisMget,
    pipeline: mockRedisPipeline,
  },
}));

jest.unstable_mockModule("../../src/ntc-client.js", () => ({
  fetchLiveGps: jest.fn(),
}));

const { default: handler } = await import("../../api/cron/sync.js");
const { fetchLiveGps } = await import("../../src/ntc-client.js");
const mockFetchLiveGps = fetchLiveGps as jest.MockedFunction<
  typeof fetchLiveGps
>;

function mockRes() {
  const res: any = {};
  res.status = jest.fn<any>().mockReturnValue(res);
  res.json = jest.fn<any>().mockReturnValue(res);
  return res;
}

describe("/api/cron/sync", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRedisPipeline.mockReturnValue({
      set: mockPipelineSet,
      exec: mockPipelineExec,
    });
    mockPipelineSet.mockReturnThis();
    mockPipelineExec.mockResolvedValue([]);
  });

  it("returns early with vehicles: 0 when no GPS data", async () => {
    mockFetchLiveGps.mockResolvedValue([]);
    const res = mockRes();

    await handler({} as any, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ ok: true, vehicles: 0 });
  });

  it("returns 500 when NTC API fails", async () => {
    mockFetchLiveGps.mockRejectedValue(new Error("Network error"));
    const res = mockRes();

    await handler({} as any, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ ok: false, error: "NTC API unreachable" }),
    );
  });

  it("processes GPS data end-to-end", async () => {
    mockFetchLiveGps.mockResolvedValue([
      {
        lineid: "207001",
        car: "KED-0605",
        time: "2026/02/28 15:00:00",
        location: "somewhere",
        longitude: 121.689,
        latitude: 25.18001,
        cityid: "123",
        cityname: "萬里區",
      },
    ]);

    // Mock DB: stops query
    const mockFrom = jest.fn<any>();
    const mockWhere = jest.fn<any>();
    const mockOrderBy = jest.fn<any>();
    mockDbSelect.mockReturnValue({ from: mockFrom });
    mockFrom.mockReturnValue({ where: mockWhere });
    mockWhere.mockReturnValue({ orderBy: mockOrderBy });
    mockOrderBy.mockResolvedValue([
      {
        routeLineId: "207001",
        rank: 1,
        latitude: 25.18,
        longitude: 121.689,
      },
    ]);

    // Mock Redis: no prior state
    mockRedisMget.mockResolvedValue([null]);

    // Mock DB: insert
    const mockValues = jest.fn<any>();
    const mockOnConflict = jest.fn<any>();
    mockDbInsert.mockReturnValue({ values: mockValues });
    mockValues.mockReturnValue({ onConflictDoNothing: mockOnConflict });
    mockOnConflict.mockResolvedValue(undefined);

    const res = mockRes();
    await handler({} as any, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ ok: true, newPassEvents: 1 }),
    );
    expect(mockValues).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          routeLineId: "207001",
          stopRank: 1,
          car: "KED-0605",
          routeDate: "2026-02-28",
        }),
      ]),
    );
    expect(mockPipelineSet).toHaveBeenCalled();
  });
});
