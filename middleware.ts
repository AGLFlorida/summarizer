// middleware.ts (at project root)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(_req: NextRequest) {
  return NextResponse.next()
}

// (optional) only run on these paths
export const config = {
  matcher: [
    // add routes you want to intercept; empty array means it won't run
    // '/(.*)', // uncomment to run on everything
  ],
}