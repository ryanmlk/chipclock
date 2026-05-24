/* eslint-disable @typescript-eslint/no-explicit-any */
if (typeof global.Request === 'undefined') {
  global.Request = class Request {} as any;
}
if (typeof global.Response === 'undefined') {
  global.Response = class Response {} as any;
}

import middleware from './middleware';
import { NextRequest } from 'next/server';

jest.mock('next/server', () => {
  return {
    NextRequest: class MockNextRequest {
      nextUrl: URL;
      url: string;
      constructor(url: string) {
        this.nextUrl = new URL(url);
        this.url = url;
      }
    },
    NextResponse: {
      redirect: jest.fn((url) => {
        return {
          status: 307,
          headers: new Map([['location', url.toString()]])
        };
      })
    }
  };
});

jest.mock('@clerk/nextjs/server', () => {
  return {
    clerkMiddleware: (handler: any) => {
      return (req: any, ev: any) => {
        // We will inject a mocked auth function in tests
        const mockAuth = (req as any).__mockAuth;
        return handler(mockAuth, req, ev);
      };
    },
    createRouteMatcher: (routes: string[]) => {
      return (req: any) => {
        const path = req.nextUrl.pathname;
        if (routes.includes('/api/(.*)') && path.startsWith('/api/')) return true;
        if (routes.includes(path)) return true;
        return false;
      };
    }
  };
});

describe('middleware RBAC', () => {
  const setupRequest = (path: string, role?: string) => {
    const req = new NextRequest(`http://localhost${path}`);
    (req as any).__mockAuth = jest.fn().mockResolvedValue({
      userId: role ? "user_123" : null, // If no role, simulate unauthenticated for this test, or just provide userId if role exists
      sessionClaims: {
        metadata: {
          role
        }
      }
    });
    return req;
  };

  it('allows public routes for unauthenticated users', async () => {
    const req = setupRequest('/login');
    const res = await (middleware as any)(req, {});
    expect(res).toBeUndefined(); // Returns nothing for public routes meaning pass through
  });

  it('allows schedule route for crew role', async () => {
    const req = setupRequest('/schedule', 'crew');
    const res = await (middleware as any)(req, {});
    expect(res).toBeUndefined();
  });

  it('redirects crew role from protected routes (e.g., /manage/labour)', async () => {
    const req = setupRequest('/manage/labour', 'crew');
    const res = await (middleware as any)(req, {});
    expect(res).toBeDefined();
    expect(res.status).toBe(307); // NextResponse.redirect defaults to 307
    expect(res.headers.get('location')).toContain('/schedule'); // Or where it redirects
  });

  it('allows manager role to access protected routes', async () => {
    const req = setupRequest('/manage/labour', 'manager');
    const res = await (middleware as any)(req, {});
    expect(res).toBeUndefined();
  });

  it('allows kitchen_manager role to access protected routes', async () => {
    const req = setupRequest('/manage/labour', 'kitchen_manager');
    const res = await (middleware as any)(req, {});
    expect(res).toBeUndefined();
  });

  it('allows apprentice role to access protected routes', async () => {
    const req = setupRequest('/manage/labour', 'apprentice');
    const res = await (middleware as any)(req, {});
    expect(res).toBeUndefined();
  });

  it('redirects unauthenticated users from protected routes to login', async () => {
    const req = setupRequest('/manage/labour');
    const res = await (middleware as any)(req, {});
    expect(res).toBeDefined();
    expect(res.headers.get('location')).toContain('/login');
  });
});
