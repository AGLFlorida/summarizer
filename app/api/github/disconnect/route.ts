// app/api/github/disconnect/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const res = NextResponse.redirect(new URL("/config", process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"));
  res.cookies.set("gh_token", "", { httpOnly: true, secure: true, sameSite: "lax", maxAge: 0, path: "/" });
  return res;
}
