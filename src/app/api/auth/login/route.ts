import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, shippingAddresses } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { hashPassword, verifyPassword, setAuthCookie, rateLimit, clientIp } from "@/lib/auth";
import crypto from "crypto";

// Single login endpoint — no separate registration step.
// First time a username is used, the account is created with a securely
// bcrypt-hashed password; on later logins the password is verified.
// This is Diwali Spin & Win's OWN account — never an Instagram login, and
// passwords are stored only as a one-way hash, never in plain/base64 text.
export async function POST(req: Request) {
  if (!rateLimit(`login:${clientIp(req)}`, 10, 60_000)) return NextResponse.json({ error: "Too many login attempts. Wait a minute." }, { status: 429 });
  const b = await req.json().catch(() => ({}));
  const username = String(b.username || b.email || "").trim().toLowerCase().replace(/^@/, "");
  const password = String(b.password || "");
  const spinEntryId = String(b.spinEntryId || "").trim() || null;
  if (!/^[a-z0-9._@+-]{2,60}$/.test(username)) return NextResponse.json({ error: "Enter a valid username (2–60 characters)." }, { status: 400 });
  if (password.length < 6) return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });

  const [existing] = await db.select().from(users).where(or(eq(users.instagramHandle, username), eq(users.email, username))).limit(1);

  if (existing) {
    if (!(await verifyPassword(password, existing.passwordHash))) return NextResponse.json({ error: "Incorrect username or password." }, { status: 401 });
    await setAuthCookie(existing.id);
    return NextResponse.json({ success: true, user: { id: existing.id, email: existing.email, instagramHandle: existing.instagramHandle, referralCode: existing.referralCode, spinEntryId: existing.spinEntryId } });
  }

  // First use of this username → create the account with a hashed password.
  const passwordHash = await hashPassword(password);
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username) ? username : `${username}@diwali.local`;
  const referralCode = crypto.randomBytes(5).toString("hex").toUpperCase();
  const [user] = await db.insert(users).values({ email, passwordHash, instagramHandle: username, spinEntryId, referralCode }).returning();
  if (spinEntryId) await db.update(shippingAddresses).set({ userId: user.id }).where(eq(shippingAddresses.spinEntryId, spinEntryId)).catch(() => {});
  await setAuthCookie(user.id);
  return NextResponse.json({ success: true, user: { id: user.id, email: user.email, instagramHandle: user.instagramHandle, referralCode: user.referralCode, spinEntryId: user.spinEntryId } });
}
