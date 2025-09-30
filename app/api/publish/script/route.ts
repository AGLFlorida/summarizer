import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const KEY = "publish_script";
const DEFAULT_SCRIPT = `(input) => { console.log('hello world'); }`;

export async function GET() {
  const cks = await cookies();
  const value = cks.get(KEY)?.value ?? DEFAULT_SCRIPT;
  return NextResponse.json({ script: value });
}

export async function POST(req: Request) {
  const { script } = await req.json().catch(() => ({}));
  if (typeof script !== "string" || !script.trim()) {
    return NextResponse.json({ error: "Script must be a non-empty string" }, { status: 400 });
  }
  const res = NextResponse.json({ ok: true });
  // For hobby use we keep this non-HttpOnly so the Config page can preload it.
  res.cookies.set(KEY, script, { httpOnly: false, sameSite: "lax", maxAge: 60 * 60 * 24 * 30, path: "/" });
  return res;
}
