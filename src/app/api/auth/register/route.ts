import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, shippingAddresses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, setAuthCookie, rateLimit, clientIp } from "@/lib/auth";
import { normalizeHandle, validateHandle } from "@/lib/prizes";
import crypto from "crypto";

export async function POST(req: Request) {
  if (!rateLimit(`reg:${clientIp(req)}`, 10, 60_000)) return NextResponse.json({ error: "Too many attempts. Wait a minute." }, { status: 429 });
  const b = await req.json().catch(() => ({}));
  const email = String(b.email || "").trim().toLowerCase();
  const password = String(b.password || "");
  const handle = normalizeHandle(String(b.instagramHandle || ""));
  const spinEntryId = String(b.spinEntryId || "").trim() || null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  if (password.length < 6) return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
  if (!handle || !validateHandle(handle)) return NextResponse.json({ error: "Enter a valid Instagram username." }, { status: 400 });

  const byEmail = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (byEmail[0]) return NextResponse.json({ error: "This email is already registered. Please sign in." }, { status: 409 });
  const passwordHash = await hashPassword(password);
  const referralCode = crypto.randomBytes(5).toString("hex").toUpperCase();
  const [user] = await db.insert(users).values({ email, passwordHash, instagramHandle: handle, spinEntryId, referralCode }).returning();
  if (spinEntryId) await db.update(shippingAddresses).set({ userId: user.id }).where(eq(shippingAddresses.spinEntryId, spinEntryId)).catch(() => {});
  await setAuthCookie(user.id);
  return NextResponse.json({ success: true, user: { id: user.id, email: user.email, instagramHandle: user.instagramHandle, referralCode: user.referralCode } });
}
