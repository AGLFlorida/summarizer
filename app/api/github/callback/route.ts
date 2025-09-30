// app/api/github/callback/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const _ck = await cookies()
  const expected = _ck.get("oauth_state")?.value;

  if (!code || !state || state !== expected) {
    return NextResponse.redirect(new URL("/config?error=oauth_state", process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"));
  }

  const clientId = process.env.GITHUB_CLIENT_ID!;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET!;
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(new URL("/config?error=token_exchange", process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"));
  }

  const data = (await tokenRes.json()) as { access_token?: string };
  const access = data.access_token;

  const res = NextResponse.redirect(new URL("/config", process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"));
  // HttpOnly so client-side code cannot read it; short lifetime for demo purposes
  if (access) {
    res.cookies.set("gh_token", access, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
  }
  // clear one-time state cookie
  res.cookies.set("oauth_state", "", { httpOnly: true, secure: true, sameSite: "lax", maxAge: 0, path: "/" });
  return res;
}
