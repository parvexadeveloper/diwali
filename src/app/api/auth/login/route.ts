import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { verifyPassword, setAuthCookie, rateLimit, clientIp } from "@/lib/auth";

export async function POST(req: Request) {
  if (!rateLimit(`login:${clientIp(req)}`, 10, 60_000)) return NextResponse.json({ error: "Too many login attempts. Wait a minute." }, { status: 429 });
  const b = await req.json().catch(() => ({}));
  // Accept a single "username" that matches the account's username (Instagram handle) or email.
  const username = String(b.username || b.email || "").trim().toLowerCase().replace(/^@/, "");
  const password = String(b.password || "");
  if (!username || !password) return NextResponse.json({ error: "Enter your username and password." }, { status: 400 });
  const [user] = await db.select().from(users).where(or(eq(users.instagramHandle, username), eq(users.email, username))).limit(1);
  if (!user || !(await verifyPassword(password, user.passwordHash))) return NextResponse.json({ error: "Incorrect username or password." }, { status: 401 });
  await setAuthCookie(user.id);
  return NextResponse.json({ success: true, user: { id: user.id, email: user.email, instagramHandle: user.instagramHandle, referralCode: user.referralCode, spinEntryId: user.spinEntryId } });
}
