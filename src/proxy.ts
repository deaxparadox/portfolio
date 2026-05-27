// src/proxy.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { searchParams, pathname } = request.nextUrl
  if (pathname === '/' && !searchParams.has('mode')) {
    return NextResponse.redirect(new URL('/?mode=resume', request.url))
  }
}

export const config = {
  matcher: '/',
}
