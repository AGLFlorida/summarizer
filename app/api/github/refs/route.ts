import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cks = await cookies();
  const repo = cks.get("repo")?.value;
  const token = cks.get("gh_token")?.value;
  if (!repo) return NextResponse.json({ error: "Repository not configured" }, { status: 400 });
  if (!token) return NextResponse.json({ error: "Connect GitHub first" }, { status: 400 });

  const [tagsRes, branchesRes] = await Promise.all([
    fetch(`https://api.github.com/repos/${repo}/tags?per_page=100`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
      cache: "no-store",
    }),
    fetch(`https://api.github.com/repos/${repo}/branches?per_page=100`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
      cache: "no-store",
    }),
  ]);

  if (!tagsRes.ok) return NextResponse.json({ error: "Failed to fetch tags" }, { status: 502 });
  if (!branchesRes.ok) return NextResponse.json({ error: "Failed to fetch branches" }, { status: 502 });

  const tagsJson = await tagsRes.json();
  const branchesJson = await branchesRes.json();

  const tags = (tagsJson ?? []).map((t: any) => t.name);
  const branches = (branchesJson ?? []).map((b: any) => b.name);

  return NextResponse.json({ tags, branches });
}
