// app/api/config/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const repo = (await cookies()).get("repo")?.value ?? "";
  return NextResponse.json({ repo });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const repo: string = (body?.repo ?? "").trim();
  if (!repo || !/^[^/]+\/[^/]+$/.test(repo)) {
    return NextResponse.json({ error: "Repository must be in the form owner/name." }, { status: 400 });
  }
  const res = NextResponse.json({ ok: true });
  // cookie lasts 30 days
  res.cookies.set("repo", repo, { httpOnly: false, sameSite: "lax", maxAge: 60 * 60 * 24 * 30 });
  return res;
}
