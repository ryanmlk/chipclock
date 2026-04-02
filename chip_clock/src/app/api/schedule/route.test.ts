import { GET } from "./route";
import { NextRequest } from "next/server";

jest.mock("next/server", () => ({
  NextRequest: class MockNextRequest {
    nextUrl: URL;
    constructor(url: string) {
      this.nextUrl = new URL(url);
    }
  },
  NextResponse: {
    json: jest.fn((data, options) => ({ data, ...options }))
  }
}));

// We need a dummy Request global for next/server to parse if it's evaluated, but since we mocked it, it shouldn't evaluate the real thing.
// However, the real module might still be required by route.ts, so let's set global.Request
if (typeof global.Request === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  global.Request = class Request {} as any;
}
if (typeof global.Response === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  global.Response = class Response {} as any;
}
import prisma from "@/app/prisma";

jest.mock("@/app/prisma", () => ({
  __esModule: true,
  default: {
    shift: {
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    weeklySchedule: {
      findFirst: jest.fn(),
      create: jest.fn(),
    }
  }
}));

describe("GET /api/schedule", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should fetch shifts for the requested start_date even if it is before the UTC currentWeekStart", async () => {
    // Simulate Sunday, March 22nd 2026, 22:00:00 EST 
    // This is Monday, March 23rd 2026, 03:00:00 UTC.
    // So the server's UTC `now` thinks it's already Monday the 23rd.
    jest.setSystemTime(new Date("2026-03-23T03:00:00.000Z"));

    // The client requests the week starting from Monday, March 16th (because locally it's still Sunday the 22nd)
    const req = new NextRequest("http://localhost/api/schedule?start_date=2026-03-16T00:00:00.000Z&end_date=2026-03-23T00:00:00.000Z");

    await GET(req);

    expect(prisma.shift.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          shift_start: expect.objectContaining({
            gte: new Date("2026-03-16T00:00:00.000Z"),
          }),
        }),
      })
    );
  });

  it("should use currentWeekStart if no start_date is provided", async () => {
    jest.setSystemTime(new Date("2026-03-24T12:00:00.000Z")); // Tuesday
    const req = new NextRequest("http://localhost/api/schedule");
    await GET(req);

    // Current week start for Tuesday March 24th is Monday March 23rd
    expect(prisma.shift.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          shift_start: expect.objectContaining({
            gte: new Date("2026-03-23T00:00:00.000Z"),
          }),
        }),
      })
    );
  });

  it("should apply name search filter", async () => {
    const req = new NextRequest("http://localhost/api/schedule?name=john");
    await GET(req);

    expect(prisma.shift.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          employee: {
            OR: [
              { first_name: { contains: "john", mode: "insensitive" } },
              { last_name: { contains: "john", mode: "insensitive" } },
            ],
          }
        }),
      })
    );
  });

  it("should return 500 on db error", async () => {
    const req = new NextRequest("http://localhost/api/schedule");
    
    // mock console.error to avoid noise in test output
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    
    (prisma.shift.findMany as jest.Mock).mockRejectedValueOnce(new Error("DB Error"));
    const res = await GET(req);
    
    expect(res.status).toBe(500);
    spy.mockRestore();
  });
});
