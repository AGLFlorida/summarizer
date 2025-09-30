import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { base, head } = await req.json();
  const cks = await cookies();
  const repo = cks.get("repo")?.value;
  const token = cks.get("gh_token")?.value;

  if (!repo) return NextResponse.json({ error: "Repository not configured" }, { status: 400 });
  if (!token) return NextResponse.json({ error: "Connect GitHub first" }, { status: 400 });
  if (!base || !head) return NextResponse.json({ error: "Missing base or head reference" }, { status: 400 });

  const ghRes = await fetch(`https://api.github.com/repos/${repo}/compare/${encodeURIComponent(base)}...${encodeURIComponent(head)}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
    cache: "no-store",
  });

  if (!ghRes.ok) {
    const msg = await ghRes.text();
    return NextResponse.json({ error: `GitHub compare failed: ${msg}` }, { status: 502 });
  }

  const json = await ghRes.json();

  const commitsText: string = (json.commits ?? [])
    .map((c: any) => `- ${c.commit.message}`)
    .join("\n");

  // unified diff (concatenate individual file patches; note: may be truncated by GitHub for large changes)
  const diffText: string = (json.files ?? [])
    .map((f: any) => (f.patch ? `--- ${f.filename}\n+++ ${f.filename}\n${f.patch}` : `--- ${f.filename}\n(no patch available)`))
    .join("\n\n");

  return NextResponse.json({ commitsText, diffText });
}
