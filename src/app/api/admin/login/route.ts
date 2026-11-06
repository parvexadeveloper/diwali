import { NextResponse } from "next/server";
import { checkAdminCreds, setAdminCookie, rateLimit, clientIp } from "@/lib/auth";

export async function POST(req: Request) {
  if (!rateLimit(`admin:${clientIp(req)}`, 10, 60_000)) return NextResponse.json({ error: "Too many attempts. Wait a minute." }, { status: 429 });
  const b = await req.json().catch(() => ({}));
  const username = String(b.username || "").trim();
  const password = String(b.password || "");
  if (!checkAdminCreds(username, password)) return NextResponse.json({ error: "Incorrect admin username or password." }, { status: 401 });
  await setAdminCookie();
  return NextResponse.json({ success: true });
}
