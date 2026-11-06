import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, setAuthCookie, rateLimit, clientIp } from "@/lib/auth";

export async function POST(req: Request) {
  if (!rateLimit(`login:${clientIp(req)}`, 10, 60_000)) return NextResponse.json({ error: "Too many login attempts. Wait a minute." }, { status: 429 });
  const b = await req.json().catch(() => ({}));
  const email = String(b.email || "").trim().toLowerCase();
  const password = String(b.password || "");
  if (!email || !password) return NextResponse.json({ error: "Enter email and password." }, { status: 400 });
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user || !(await verifyPassword(password, user.passwordHash))) return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  await setAuthCookie(user.id);
  return NextResponse.json({ success: true, user: { id: user.id, email: user.email, instagramHandle: user.instagramHandle, referralCode: user.referralCode, spinEntryId: user.spinEntryId } });
}
