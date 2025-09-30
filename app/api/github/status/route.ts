// app/api/github/status/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const token = (await cookies()).get("gh_token")?.value;
  return NextResponse.json({ connected: Boolean(token) });
}
