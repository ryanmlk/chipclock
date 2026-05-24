import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { EmployeeRole } from '@/generated/prisma/enums'

const isPublicRoute = createRouteMatcher(['/', '/schedule', '/login', '/signup', '/api/(.*)'])

export default clerkMiddleware(async (auth, req) => {
  const isPublic = isPublicRoute(req)
  
  if (!isPublic) {
    const authObj = await auth()
    if (!authObj.userId) {
      const url = new URL('/login', req.url)
      return NextResponse.redirect(url)
    }

    const role = authObj.sessionClaims?.metadata?.role
    const managerRoles: Roles[] = [
      EmployeeRole.kitchen_manager,
      EmployeeRole.service_manager,
      EmployeeRole.apprentice,
      EmployeeRole.manager
    ]

    if (role === EmployeeRole.crew) {
      // Crew can only access public routes (like /schedule)
      // If they are here, they are trying to access a protected route
      const url = new URL('/schedule', req.url)
      return NextResponse.redirect(url)
    } else if (!role || !managerRoles.includes(role)) {
      // If role is undefined or something else, redirect to schedule or login
      const url = new URL('/schedule', req.url)
      return NextResponse.redirect(url)
    }
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}