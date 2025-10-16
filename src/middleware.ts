// src/middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  })

  const isAuth = !!token
  const isAuthPage = request.nextUrl.pathname.startsWith("/login")
  const isDashboard = request.nextUrl.pathname.startsWith("/dashboard")

  // Si está en la página de login y ya está autenticado, redirigir al dashboard
  if (isAuthPage && isAuth) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Si intenta acceder al dashboard sin estar autenticado, redirigir al login
  if (isDashboard && !isAuth) {
    let from = request.nextUrl.pathname
    if (request.nextUrl.search) {
      from += request.nextUrl.search
    }
    return NextResponse.redirect(
      new URL(`/login?from=${encodeURIComponent(from)}`, request.url)
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
}