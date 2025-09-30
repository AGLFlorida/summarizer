// app/api/github/start/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import crypto from "node:crypto";

export async function GET() {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  if (!clientId) return NextResponse.json({ error: "Missing GITHUB_CLIENT_ID" }, { status: 500 });

  const state = crypto.randomUUID();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${base}/api/github/callback`,
    scope: "repo read:user",
    state,
  });

  const res = NextResponse.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
  res.cookies.set("oauth_state", state, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 600, path: "/" });
  return res;
}
