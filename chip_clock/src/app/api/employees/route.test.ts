/* eslint-disable @typescript-eslint/no-explicit-any */
import { PATCH } from "./route";
import { NextRequest } from "next/server";
import prisma from "@/app/prisma";
import { clerkClient } from "@clerk/nextjs/server";

jest.mock("next/server", () => ({
  NextRequest: class MockNextRequest {
    _body: any;
    constructor(body: any) {
      this._body = body;
    }
    async json() {
      return this._body;
    }
  },
  NextResponse: {
    json: jest.fn((data, options) => ({ data, ...options }))
  }
}));

if (typeof global.Request === 'undefined') {
  global.Request = class Request {} as any;
}
if (typeof global.Response === 'undefined') {
  global.Response = class Response {} as any;
}

jest.mock("@/app/prisma", () => ({
  __esModule: true,
  default: {
    employee: {
      findUnique: jest.fn(),
      update: jest.fn()
    }
  }
}));

jest.mock("@clerk/nextjs/server", () => ({
  clerkClient: jest.fn().mockResolvedValue({
    users: {
      updateUserMetadata: jest.fn()
    }
  })
}));

describe("PATCH /api/employees", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("updates role in DB and Clerk if clerk_id is present", async () => {
    const req = new NextRequest({
      id: "emp_123",
      role: "manager"
    }) as any;

    (prisma.employee.findUnique as jest.Mock).mockResolvedValue({
      id: "emp_123",
      clerk_id: "user_abc"
    });

    (prisma.employee.update as jest.Mock).mockResolvedValue({
      id: "emp_123",
      role: "manager",
      clerk_id: "user_abc"
    });

    const res = await PATCH(req);

    expect(res.status).toBe(200);
    expect(prisma.employee.update).toHaveBeenCalledWith({
      where: { id: "emp_123" },
      data: { id: "emp_123", role: "manager" }
    });

    const client = await clerkClient();
    expect(client.users.updateUserMetadata).toHaveBeenCalledWith("user_abc", {
      publicMetadata: {
        role: "manager"
      }
    });
  });
  
  it("skips Clerk update if role is not in the request body", async () => {
    const req = new NextRequest({
      id: "emp_123",
      first_name: "John"
    }) as any;

    (prisma.employee.update as jest.Mock).mockResolvedValue({
      id: "emp_123",
      first_name: "John"
    });

    await PATCH(req);

    expect(prisma.employee.update).toHaveBeenCalled();
    const client = await clerkClient();
    expect(client.users.updateUserMetadata).not.toHaveBeenCalled();
  });
});
