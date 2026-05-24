/* eslint-disable @typescript-eslint/no-explicit-any */
import { POST } from "./route";
import { NextRequest } from "next/server";
// Mock svix
jest.mock("svix", () => ({
  Webhook: jest.fn().mockImplementation(() => ({
    verify: jest.fn().mockImplementation((body) => JSON.parse(body))
  }))
}));

// Mock Next.js Server Request/Response
jest.mock("next/server", () => ({
  NextRequest: class MockNextRequest {
    headers: Map<string, string>;
    _body: string;
    constructor(body: string, headers: Record<string, string>) {
      this._body = body;
      this.headers = new Map(Object.entries(headers));
    }
    async json() {
      return JSON.parse(this._body);
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
  global.Response = class Response {
    body: any;
    status: number;
    constructor(body: any, init?: { status?: number }) {
      this.body = body;
      this.status = init?.status || 200;
    }
  } as any;
}

// Mock Prisma
jest.mock("@/app/prisma", () => ({
  __esModule: true,
  default: {
    employee: {
      create: jest.fn()
    }
  }
}));
import prisma from "@/app/prisma";

// Mock Clerk Backend
jest.mock("@clerk/nextjs/server", () => {
  return {
    clerkClient: jest.fn().mockResolvedValue({
      users: {
        updateUserMetadata: jest.fn()
      }
    })
  };
});
import { clerkClient } from "@clerk/nextjs/server";

describe("POST /api/webhooks/clerk", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.CLERK_WEBHOOK_SECRET = "whsec_test";
  });

  it("handles user.created webhook and syncs to DB and Clerk", async () => {
    const payload = {
      type: "user.created",
      data: {
        id: "user_123",
        email_addresses: [{ email_address: "test@example.com" }],
        first_name: "John",
        last_name: "Doe"
      }
    };
    const body = JSON.stringify(payload);
    const headers = {
      "svix-id": "msg_123",
      "svix-timestamp": "123456",
      "svix-signature": "v1,sig_123"
    };

    const req = new NextRequest(body, headers) as any;

    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(prisma.employee.create).toHaveBeenCalledWith({
      data: {
        clerk_id: "user_123",
        first_name: "John",
        last_name: "Doe",
        email: "test@example.com",
        role: "crew",
        status: "active"
      }
    });

    const client = await clerkClient();
    expect(client.users.updateUserMetadata).toHaveBeenCalledWith("user_123", {
      publicMetadata: {
        role: "crew"
      }
    });
  });

  it("returns 400 if no svix headers", async () => {
    const payload = { type: "user.created", data: {} };
    const req = new NextRequest(JSON.stringify(payload), {}) as any;
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
